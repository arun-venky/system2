import express from 'express';
import { body, param } from 'express-validator';
import {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  manageRoles,
  getRoleUsers,
  assignRoleToUsers,
  removeRoleFromUsers,
  duplicateRole,
  getRolePermissions,
  updateRolePermissions
} from '../controllers/role.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { isAdmin } from '../middleware/rbac.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';

export const roleRoutes = express.Router();

// Get all roles (Admin only)
roleRoutes.get('/', verifyToken, isAdmin, getAllRoles);

// Get role by ID (Admin only)
roleRoutes.get(
  '/:id',
  verifyToken,
  param('id').isMongoId().withMessage('Invalid role ID'),
  validateRequest,
  isAdmin,
  getRoleById
);

// Get role users (Admin only)
roleRoutes.get(
  '/:id/users',
  verifyToken,
  [
    param('id').isMongoId().withMessage('Invalid role ID')
  ],
  validateRequest,
  isAdmin,
  getRoleUsers
);

// Get role permissions (Admin only)
roleRoutes.get(
  '/:id/permissions',
  verifyToken,
  [
    param('id').isMongoId().withMessage('Invalid role ID')
  ],
  validateRequest,
  isAdmin,
  getRolePermissions
);

// Create role (Admin only)
roleRoutes.post(
  '/',
  verifyToken,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('permissions').isArray().withMessage('Permissions must be an array'),
    body('permissions.*.resource').notEmpty().withMessage('Resource is required'),
    body('permissions.*.actions').isArray().withMessage('Actions must be an array')
  ],
  validateRequest,
  isAdmin,
  createRole
);

// Update role (Admin only)
roleRoutes.put(
  '/:id',
  verifyToken,
  [
    param('id').isMongoId().withMessage('Invalid role ID'),
    body('name').optional().trim(),
    body('permissions').optional().isArray()
  ],
  validateRequest,
  isAdmin,
  updateRole
);

// Delete role (Admin only)
roleRoutes.delete(
  '/:id',
  verifyToken,
  param('id').isMongoId().withMessage('Invalid role ID'),
  validateRequest,
  isAdmin,
  deleteRole
);

// Manage roles (bulk operations) (Admin only)
roleRoutes.post(
  '/manage',
  verifyToken,
  [
    body('operations').isArray().withMessage('Operations must be an array'),
    body('operations.*.action').isIn(['create', 'update', 'delete']).withMessage('Invalid action'),
    body('operations.*.data').optional()
  ],
  validateRequest,
  isAdmin,
  manageRoles
);

// Assign role to users (Admin only)
roleRoutes.post(
  '/:id/users',
  verifyToken,
  [
    param('id').isMongoId().withMessage('Invalid role ID'),
    body('userIds').isArray().withMessage('User IDs must be an array'),
    body('userIds.*').isMongoId().withMessage('Invalid user ID')
  ],
  validateRequest,
  isAdmin,
  assignRoleToUsers
);

// Remove role from users (Admin only)
roleRoutes.delete(
  '/:id/users',
  verifyToken,
  [
    param('id').isMongoId().withMessage('Invalid role ID'),
    body('userIds').isArray().withMessage('User IDs must be an array'),
    body('userIds.*').isMongoId().withMessage('Invalid user ID')
  ],
  validateRequest,
  isAdmin,
  removeRoleFromUsers
);

// Update role permissions (Admin only)
roleRoutes.put(
  '/:id/permissions',
  verifyToken,
  [
    param('id').isMongoId().withMessage('Invalid role ID'),
    body('permissions').isArray().withMessage('Permissions must be an array'),
    body('permissions.*.resource').notEmpty().withMessage('Resource is required'),
    body('permissions.*.actions').isArray().withMessage('Actions must be an array')
  ],
  validateRequest,
  isAdmin,
  updateRolePermissions
);

// Duplicate role (Admin only)
roleRoutes.post(
  '/:id/duplicate',
  verifyToken,
  [
    param('id').isMongoId().withMessage('Invalid role ID'),
    body('name').trim().notEmpty().withMessage('New name is required')
  ],
  validateRequest,
  isAdmin,
  duplicateRole
);