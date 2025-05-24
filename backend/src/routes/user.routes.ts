import express from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserRoles,
  assignRoles,
  removeRoles,
  bulkAssignRoles
} from '../controllers/user.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { checkPermission, isAdmin } from '../middleware/rbac.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import { userValidation } from '../validations/user.validation.js';

export const userRoutes = express.Router();

// Get all users (Admin only)
userRoutes.get('/', verifyToken, isAdmin, getAllUsers);

// Get user by ID (Admin only)
userRoutes.get(
  '/:id',
  verifyToken,
  validateRequest(userValidation.getUserById),
  checkPermission('users', 'read'),
  isAdmin,
  getUserById
);

// Create user (Admin only)
userRoutes.post(
  '/',
  verifyToken,
  validateRequest(userValidation.createUser),
  checkPermission('users', 'create'),
  isAdmin,
  createUser
);

// Update user (Admin only)
userRoutes.put(
  '/:id',
  verifyToken,
  validateRequest(userValidation.updateUser),
  checkPermission('users', 'update'),
  isAdmin,
  updateUser
);

// Delete user (Admin only)
userRoutes.delete(
  '/:id',
  verifyToken,
  validateRequest(userValidation.deleteUser),
  checkPermission('users', 'delete'),
  isAdmin,
  deleteUser
);

// Get user roles (Admin only)
userRoutes.get(
  '/:id/roles',
  verifyToken,
  validateRequest(userValidation.getUserRoles),
  checkPermission('users', 'read'),
  isAdmin,
  getUserRoles
);

// Assign roles to user (Admin only)
userRoutes.post(
  '/:id/roles',
  verifyToken,
  validateRequest(userValidation.assignRoles),
  checkPermission('users', 'update'),
  isAdmin,
  assignRoles
);

// Remove roles from user (Admin only)
userRoutes.delete(
  '/:id/roles',
  verifyToken,
  validateRequest(userValidation.removeRoles),
  checkPermission('users', 'update'),
  isAdmin,
  removeRoles
);

// Bulk assign roles to users (Admin only)
userRoutes.post(
  '/bulk/roles',
  verifyToken,
  validateRequest(userValidation.bulkAssignRoles),
  checkPermission('users', 'update'),
  isAdmin,
  bulkAssignRoles
);