import express from 'express';
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
  getRolePermissions,
  updateRolePermissions
} from '../controllers/role.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { checkPermission, isAdmin } from '../middleware/rbac.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import { roleValidation } from '../validations/role.validation.js';

export const roleRoutes = express.Router();

// Get all roles (Admin only)
roleRoutes.get('/', verifyToken, isAdmin, getAllRoles);

// Get role by ID (Admin only)
roleRoutes.get(
  '/:id',
  verifyToken,
  validateRequest(roleValidation.getRoleById),
  checkPermission('roles', 'read'),
  isAdmin,
  getRoleById
);

// Get role users (Admin only)
roleRoutes.get(
  '/:id/users',
  verifyToken,
  validateRequest(roleValidation.getRoleUsers),
  checkPermission('roles', 'read'),
  isAdmin,
  getRoleUsers
);

// Get role permissions (Admin only)
roleRoutes.get(
  '/:id/permissions',
  verifyToken,
  validateRequest(roleValidation.getRolePermissions),
  checkPermission('roles', 'read'),
  isAdmin,
  getRolePermissions
);

// Create role (Admin only)
roleRoutes.post(
  '/',
  verifyToken,
  validateRequest(roleValidation.createRole),
  checkPermission('roles', 'create'),
  isAdmin,
  createRole
);

// Update role (Admin only)
roleRoutes.put(
  '/:id',
  verifyToken,
  validateRequest(roleValidation.updateRole),
  checkPermission('roles', 'update'),
  isAdmin,
  updateRole
);

// Delete role (Admin only)
roleRoutes.delete(
  '/:id',
  verifyToken,
  validateRequest(roleValidation.deleteRole),
  checkPermission('roles', 'delete'),
  isAdmin,
  deleteRole
);

// Manage roles (bulk operations) (Admin only)
roleRoutes.post(
  '/manage',
  verifyToken,
  validateRequest(roleValidation.manageRoles),
  isAdmin,
  manageRoles
);

// Assign role to users (Admin only)
roleRoutes.post(
  '/:id/users',
  verifyToken,
  validateRequest(roleValidation.assignRoleToUsers),
  isAdmin,
  assignRoleToUsers
);

// Remove role from users (Admin only)
roleRoutes.delete(
  '/:id/users',
  verifyToken,
  validateRequest(roleValidation.removeRoleFromUsers),
  isAdmin,
  removeRoleFromUsers
);

// Update role permissions (Admin only)
roleRoutes.put(
  '/:id/permissions',
  verifyToken,
  validateRequest(roleValidation.updateRolePermissions),
  checkPermission('roles', 'update'),
  isAdmin,
  updateRolePermissions
);