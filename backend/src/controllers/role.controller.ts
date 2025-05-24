import { Request, Response } from 'express';
import { Role } from '../models/role.model.js';
import { AuditLog } from '../models/audit-log.model.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { logger, logAudit } from '../utils/logger.js';
import { User } from '../models/user.model.js';

// Get all roles controller
export const getAllRoles = async (req: Request, res: Response) => {
  try {
    const roles = await Role.find({});
    
    res.status(200).json({
      count: roles.length,
      roles,
    });
  } catch (error) {
    logger.error('Error getting roles', error);
    res.status(500).json({ message: 'Error retrieving roles' });
  }
};

// Get role by ID controller
export const getRoleById = async (req: Request, res: Response) => {
  try {
    const roleId = req.params.id;
    
    const role = await Role.findById(roleId);
    
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    
    res.status(200).json(role);
  } catch (error) {
    logger.error(`Error getting role ${req.params.id}`, error);
    res.status(500).json({ message: 'Error retrieving role' });
  }
};

// Create role controller
export const createRole = async (req: AuthRequest, res: Response) => {
  try {
    const { name, permissions } = req.body;
    
    // Check if role already exists
    const existingRole = await Role.findOne({ name });
    
    if (existingRole) {
      return res.status(400).json({ 
        message: 'Role with this name already exists' 
      });
    }
    
    // Create new role
    const role = new Role({
      name,
      permissions: permissions || [],
    });
    
    await role.save();
    
    // Log the create action
    await AuditLog.create({
      userId: req.user?._id,
      action: 'create',
      resource: 'roles',
      details: `Role ${role.name} was created`,
    });
    
    logAudit(
      req.user?._id?.toString() || 'system',
      'create',
      'roles',
      `Role ${role.name} was created`
    );
    
    res.status(201).json({
      message: 'Role created successfully',
      role,
    });
  } catch (error) {
    logger.error('Error creating role', error);
    res.status(500).json({ message: 'Error creating role' });
  }
};

// Update role controller
export const updateRole = async (req: AuthRequest, res: Response) => {
  try {
    const roleId = req.params.id;
    const updates = req.body;
    
    // Find and update role
    const role = await Role.findByIdAndUpdate(
      roleId,
      { $set: updates },
      { new: true, runValidators: true }
    );
    
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    
    // Log the update action
    await AuditLog.create({
      userId: req.user?._id,
      action: 'update',
      resource: 'roles',
      details: `Role ${role.name} was updated`,
    });
    
    logAudit(
      req.user?._id?.toString() || 'system',
      'update',
      'roles',
      `Role ${role.name} was updated`
    );
    
    res.status(200).json({
      message: 'Role updated successfully',
      role,
    });
  } catch (error) {
    logger.error(`Error updating role ${req.params.id}`, error);
    res.status(500).json({ message: 'Error updating role' });
  }
};

// Delete role controller
export const deleteRole = async (req: AuthRequest, res: Response) => {
  try {
    const roleId = req.params.id;
    
    const role = await Role.findByIdAndDelete(roleId);
    
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    
    // Log the delete action
    await AuditLog.create({
      userId: req.user?._id,
      action: 'delete',
      resource: 'roles',
      details: `Role ${role.name} was deleted`,
    });
    
    logAudit(
      req.user?._id?.toString() || 'system',
      'delete',
      'roles',
      `Role ${role.name} was deleted`
    );
    
    res.status(200).json({
      message: 'Role deleted successfully',
    });
  } catch (error) {
    logger.error(`Error deleting role ${req.params.id}`, error);
    res.status(500).json({ message: 'Error deleting role' });
  }
};

// Manage roles controller (bulk operations)
export const manageRoles = async (req: AuthRequest, res: Response) => {
  try {
    const { operations } = req.body;
    
    if (!Array.isArray(operations)) {
      return res.status(400).json({ 
        message: 'Operations must be an array' 
      });
    }
    
    const results = [];
    
    for (const op of operations) {
      const { action, roleId, data } = op;
      
      switch (action) {
        case 'create':
          // Check if role already exists
          const existingRole = await Role.findOne({ name: data.name });
          if (existingRole) {
            results.push({
              action,
              success: false,
              message: 'Role with this name already exists'
            });
            continue;
          }
          
          // Create new role
          const newRole = new Role({
            name: data.name,
            permissions: data.permissions || [],
          });
          await newRole.save();
          
          results.push({
            action,
            success: true,
            role: newRole
          });
          break;
          
        case 'update':
          const roleToUpdate = await Role.findById(roleId);
          if (!roleToUpdate) {
            results.push({
              action,
              success: false,
              message: 'Role not found'
            });
            continue;
          }
          
          // If name is being updated, check for duplicates
          if (data.name && data.name !== roleToUpdate.name) {
            const nameExists = await Role.findOne({ name: data.name });
            if (nameExists) {
              results.push({
                action,
                success: false,
                message: 'Role with this name already exists'
              });
              continue;
            }
          }
          
          // Update role
          Object.assign(roleToUpdate, data);
          await roleToUpdate.save();
          
          results.push({
            action,
            success: true,
            role: roleToUpdate
          });
          break;
          
        case 'delete':
          const roleToDelete = await Role.findByIdAndDelete(roleId);
          if (!roleToDelete) {
            results.push({
              action,
              success: false,
              message: 'Role not found'
            });
            continue;
          }
          
          results.push({
            action,
            success: true
          });
          break;
          
        default:
          results.push({
            action,
            success: false,
            message: 'Invalid action'
          });
      }
    }
    
    // Log the bulk operation
    await AuditLog.create({
      userId: req.user?._id,
      action: 'manage',
      resource: 'roles',
      details: `Bulk role operations performed: ${operations.length} operations`,
    });
    
    logAudit(
      req.user?._id?.toString() || 'system',
      'manage',
      'roles',
      `Bulk role operations performed: ${operations.length} operations`
    );
    
    res.status(200).json({
      message: 'Bulk operations completed',
      results
    });
  } catch (error) {
    logger.error('Error managing roles', error);
    res.status(500).json({ message: 'Error performing bulk operations' });
  }
};

// Get role users controller
export const getRoleUsers = async (req: AuthRequest, res: Response) => {
  try {
    const roleId = req.params.id;
    
    // Find role
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    
    // Find users with this role
    const users = await User.find({ role: roleId }).select('-password');
    
    res.status(200).json({
      role: role.name,
      count: users.length,
      users,
    });
  } catch (error) {
    logger.error(`Error getting users for role ${req.params.id}`, error);
    res.status(500).json({ message: 'Error retrieving role users' });
  }
};

// Assign role to users controller
export const assignRoleToUsers = async (req: AuthRequest, res: Response) => {
  try {
    const roleId = req.params.id;
    const { userIds } = req.body;
    
    // Find role
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    
    // Update users
    const result = await User.updateMany(
      { _id: { $in: userIds } },
      { $set: { role: roleId } }
    );
    
    // Log the action
    await AuditLog.create({
      userId: req.user?._id,
      action: 'assign_role',
      resource: 'roles',
      details: `Role ${role.name} assigned to ${result.modifiedCount} users`,
    });
    
    logAudit(
      req.user?._id?.toString() || 'system',
      'assign_role',
      'roles',
      `Role ${role.name} assigned to ${result.modifiedCount} users`
    );
    
    res.status(200).json({
      message: `Role assigned to ${result.modifiedCount} users successfully`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    logger.error(`Error assigning role ${req.params.id} to users`, error);
    res.status(500).json({ message: 'Error assigning role to users' });
  }
};

// Remove role from users controller
export const removeRoleFromUsers = async (req: AuthRequest, res: Response) => {
  try {
    const roleId = req.params.id;
    const { userIds } = req.body;
    
    // Find role
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    
    // Get default Viewer role
    const viewerRole = await Role.findOne({ name: 'Viewer' });
    if (!viewerRole) {
      return res.status(500).json({ message: 'Default role not found' });
    }
    
    // Update users to default role
    const result = await User.updateMany(
      { _id: { $in: userIds } },
      { $set: { role: viewerRole._id } }
    );
    
    // Log the action
    await AuditLog.create({
      userId: req.user?._id,
      action: 'remove_role',
      resource: 'roles',
      details: `Role ${role.name} removed from ${result.modifiedCount} users`,
    });
    
    logAudit(
      req.user?._id?.toString() || 'system',
      'remove_role',
      'roles',
      `Role ${role.name} removed from ${result.modifiedCount} users`
    );
    
    res.status(200).json({
      message: `Role removed from ${result.modifiedCount} users successfully`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    logger.error(`Error removing role ${req.params.id} from users`, error);
    res.status(500).json({ message: 'Error removing role from users' });
  }
};

// Duplicate role controller
export const duplicateRole = async (req: AuthRequest, res: Response) => {
  try {
    const roleId = req.params.id;
    const { name } = req.body;
    
    // Find original role
    const originalRole = await Role.findById(roleId);
    if (!originalRole) {
      return res.status(404).json({ message: 'Role not found' });
    }
    
    // Check if new name already exists
    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return res.status(400).json({ message: 'Role with this name already exists' });
    }
    
    // Create new role with same permissions
    const newRole = new Role({
      name,
      permissions: originalRole.permissions,
    });
    
    await newRole.save();
    
    // Log the action
    await AuditLog.create({
      userId: req.user?._id,
      action: 'duplicate',
      resource: 'roles',
      details: `Role ${originalRole.name} duplicated as ${name}`,
    });
    
    logAudit(
      req.user?._id?.toString() || 'system',
      'duplicate',
      'roles',
      `Role ${originalRole.name} duplicated as ${name}`
    );
    
    res.status(201).json({
      message: 'Role duplicated successfully',
      role: newRole,
    });
  } catch (error) {
    logger.error(`Error duplicating role ${req.params.id}`, error);
    res.status(500).json({ message: 'Error duplicating role' });
  }
};

// Get role permissions controller
export const getRolePermissions = async (req: AuthRequest, res: Response) => {
  try {
    const roleId = req.params.id;
    
    // Find role
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    
    res.status(200).json({
      role: role.name,
      permissions: role.permissions,
    });
  } catch (error) {
    logger.error(`Error getting permissions for role ${req.params.id}`, error);
    res.status(500).json({ message: 'Error retrieving role permissions' });
  }
};

// Update role permissions controller
export const updateRolePermissions = async (req: AuthRequest, res: Response) => {
  try {
    const roleId = req.params.id;
    const { permissions } = req.body;
    
    // Find and update role
    const role = await Role.findByIdAndUpdate(
      roleId,
      { $set: { permissions } },
      { new: true, runValidators: true }
    );
    
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    
    // Log the action
    await AuditLog.create({
      userId: req.user?._id,
      action: 'update_permissions',
      resource: 'roles',
      details: `Permissions updated for role ${role.name}`,
    });
    
    logAudit(
      req.user?._id?.toString() || 'system',
      'update_permissions',
      'roles',
      `Permissions updated for role ${role.name}`
    );
    
    res.status(200).json({
      message: 'Role permissions updated successfully',
      role,
    });
  } catch (error) {
    logger.error(`Error updating permissions for role ${req.params.id}`, error);
    res.status(500).json({ message: 'Error updating role permissions' });
  }
};