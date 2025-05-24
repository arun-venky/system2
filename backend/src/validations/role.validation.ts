import { body, param } from 'express-validator';

export const roleValidation = {
  getRoleById: [
    param('id').isMongoId().withMessage('Invalid role ID'),
  ],

  getRoleUsers: [
    param('id').isMongoId().withMessage('Invalid role ID'),
  ],

  getRolePermissions: [
    param('id').isMongoId().withMessage('Invalid role ID'),
  ],

  createRole: [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('description').optional().trim(),
    body('permissions').isArray().withMessage('Permissions must be an array'),
    body('permissions.*.resource').notEmpty().withMessage('Resource is required'),
    body('permissions.*.actions').isArray().withMessage('Actions must be an array')
  ],

  updateRole: [
    param('id').isMongoId().withMessage('Invalid role ID'),
    body('name').optional().trim(),
    body('description').optional().trim(),
    body('permissions').optional().isArray()
  ],

  deleteRole: [
    param('id').isMongoId().withMessage('Invalid role ID'),
  ],

  manageRoles: [
    body('operations').isArray().withMessage('Operations must be an array'),
    body('operations.*.action').isIn(['create', 'update', 'delete']).withMessage('Invalid action'),
    body('operations.*.data').optional()
  ],

  assignRoleToUsers: [
    param('id').isMongoId().withMessage('Invalid role ID'),
    body('userIds').isArray().withMessage('User IDs must be an array'),
    body('userIds.*').isMongoId().withMessage('Invalid user ID')
  ],

  removeRoleFromUsers: [
    param('id').isMongoId().withMessage('Invalid role ID'),
    body('userIds').isArray().withMessage('User IDs must be an array'),
    body('userIds.*').isMongoId().withMessage('Invalid user ID')
  ],

  updateRolePermissions: [
    param('id').isMongoId().withMessage('Invalid role ID'),
    body('permissions').isArray().withMessage('Permissions must be an array'),
    body('permissions.*.resource').notEmpty().withMessage('Resource is required'),
    body('permissions.*.actions').isArray().withMessage('Actions must be an array')
  ],

  duplicateRole: [
    param('id').isMongoId().withMessage('Invalid role ID'),
    body('name').trim().notEmpty().withMessage('New name is required')
  ],  

}; 