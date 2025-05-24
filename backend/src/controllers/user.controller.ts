import { Request, Response } from 'express';
import { IUser, User } from '../models/user.model.js';
import { AuditLog } from '../models/audit-log.model.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { logger, logAudit } from '../utils/logger.js';
import { parseUser } from '../utils/tokenUtils.js';
import { Role } from '../models/role.model.js';

// Get all users controller
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({}).populate('role', 'name').select('-password');
    
    res.status(200).json({
      count: users.length,
      users,
    });
  } catch (error) {
    logger.error('Error getting users', error);
    res.status(500).json({ message: 'Error retrieving users' });
  }
};

// Get user by ID controller
export const getUserById = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    
    const user = await User.findById(userId).populate('role', 'name').select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    logger.error(`Error getting user ${req.params.id}`, error);
    res.status(500).json({ message: 'Error retrieving user' });
  }
};

// Create user controller
export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const { username, email, password, role } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User already exists with this email or username' 
      });
    }
    
    // Create new user
    const user = new User({
      username,
      email,
      password,
      role: role || req.body.role, // Use provided role or default
    });
    
    await user.save();
    
    // Log the create action
    await AuditLog.create({
      userId: req.user?._id,
      action: 'create',
      resource: 'users',
      details: `User ${user.username} was created`,
    });
    
    logAudit(
      req.user?._id?.toString() || 'system',
      'create',
      'users',
      `User ${user.username} was created`
    );
    
    res.status(201).json({
      message: 'User created successfully',
      user: parseUser(user),
    });
  } catch (error) {
    logger.error('Error creating user', error);
    res.status(500).json({ message: 'Error creating user' });
  }
};

// Update user controller
export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.id;
    const updates = req.body;
    
    // Prevent role changes unless admin
    if (updates.role && (!req.user || req.user.role.toString() !== 'Admin')) {
      delete updates.role;
    }
    
    // Find and update user
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Log the update action
    await AuditLog.create({
      userId: req.user?._id,
      action: 'update',
      resource: 'users',
      details: `User ${user.username} was updated`,
    });

    logAudit(
      req.user?._id?.toString() || 'system',
      'update',
      'users',
      `User ${user.username} was updated`
    );
    
    res.status(200).json({
      message: 'User updated successfully',
      user,
    });
  } catch (error) {
    logger.error(`Error updating user ${req.params.id}`, error);
    res.status(500).json({ message: 'Error updating user' });
  }
};

// Delete user controller
export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.id;
    
    // Prevent deleting self
    if (req.user && req.user.id.toString() === userId) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    
    const user = await User.findByIdAndDelete(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Log the delete action
    await AuditLog.create({
      userId: req.user?._id,
      action: 'delete',
      resource: 'users',
      details: `User ${user.username} was deleted`,
    });

    User.deleteOne({ _id: userId });
    
    logAudit(
      req.user?._id?.toString() || 'system',
      'delete',
      'users',
      `User ${user.username} was deleted`
    );    
    
    res.status(200).json({
      message: 'User deleted successfully',
    });
  } catch (error) {
    logger.error(`Error deleting user ${req.params.id}`, error);
    res.status(500).json({ message: 'Error deleting user' });
  }
};

// Get user roles controller
export const getUserRoles = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.id;
    
    // Find user
    const user = await User.findById(userId).populate('roles');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({
      roles: user.role || []
    });
  } catch (error) {
    logger.error(`Error getting roles for user ${req.params.id}`, error);
    res.status(500).json({ message: 'Error retrieving user roles' });
  }
};

// Assign roles to user controller
export const assignRoles = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.id;
    const { roleIds } = req.body;
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Find roles
    const roles = await Role.find({ _id: { $in: roleIds } });
    if (roles.length !== roleIds.length) {
      return res.status(400).json({ message: 'One or more roles not found' });
    }
    
    // Update user roles
    user.role = roleIds[0];
    await user.save();
    
    // Log the action
    await AuditLog.create({
      userId: req.user?._id,
      action: 'assign_roles',
      resource: 'users',
      details: `Roles assigned to user ${user.username}`,
    });
    
    logAudit(
      req.user?._id?.toString() || 'system',
      'assign_roles',
      'users',
      `Roles assigned to user ${user.username}`
    );
    
    res.status(200).json({
      message: 'Roles assigned successfully',
      roles: roles
    });
  } catch (error) {
    logger.error(`Error assigning roles to user ${req.params.id}`, error);
    res.status(500).json({ message: 'Error assigning roles to user' });
  }
};

// Remove roles from user controller
export const removeRoles = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.id;
    const { roleIds } = req.body;
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Remove roles
    //user.role =
    await user.save();
    
    // Log the action
    await AuditLog.create({
      userId: req.user?._id,
      action: 'remove_roles',
      resource: 'users',
      details: `Roles removed from user ${user.username}`,
    });
    
    logAudit(
      req.user?._id?.toString() || 'system',
      'remove_roles',
      'users',
      `Roles removed from user ${user.username}`
    );
    
    res.status(200).json({
      message: 'Roles removed successfully'
    });
  } catch (error) {
    logger.error(`Error removing roles from user ${req.params.id}`, error);
    res.status(500).json({ message: 'Error removing roles from user' });
  }
};

// Bulk assign roles to users controller
export const bulkAssignRoles = async (req: AuthRequest, res: Response) => {
  try {
    const { userIds, roleIds } = req.body;
    
    // Find roles
    const roles = await Role.find({ _id: { $in: roleIds } });
    if (roles.length !== roleIds.length) {
      return res.status(400).json({ message: 'One or more roles not found' });
    }
    
    // Update users
    const result = await User.updateMany(
      { _id: { $in: userIds } },
      { $set: { roles: roleIds } }
    );
    
    // Log the action
    await AuditLog.create({
      userId: req.user?._id,
      action: 'bulk_assign_roles',
      resource: 'users',
      details: `Roles assigned to ${result.modifiedCount} users`,
    });
    
    logAudit(
      req.user?._id?.toString() || 'system',
      'bulk_assign_roles',
      'users',
      `Roles assigned to ${result.modifiedCount} users`
    );
    
    res.status(200).json({
      message: `Roles assigned to ${result.modifiedCount} users successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    logger.error('Error bulk assigning roles to users', error);
    res.status(500).json({ message: 'Error bulk assigning roles to users' });
  }
};