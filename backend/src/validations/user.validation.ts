import { body, param, query } from 'express-validator';

export const userValidation = {
  getUserById: [
    param('id').isMongoId().withMessage('Invalid user ID'),
  ],

  getUserByEmail: [
    query('email').isEmail().withMessage('Invalid email'),
  ],

  getUserByUsername: [
    query('username').isString().withMessage('Invalid username'),
  ],

  createUser: [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  ],

  updateUser: [
    param('id').isMongoId().withMessage('Invalid user ID'),
    body('username').optional().trim(),
    body('email').optional().isEmail().withMessage('Invalid email address'),
    body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  ],

  deleteUser: [
    param('id').isMongoId().withMessage('Invalid user ID'),
  ],

  verifyEmail: [
    param('token').notEmpty().withMessage('Verification token is required'),
  ],

  resendVerificationEmail: [
    param('email').isEmail().withMessage('Invalid email address'),
  ],

  changePassword: [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
  ],

  updateProfile: [
    body('username').optional().trim(),
    body('email').optional().isEmail().withMessage('Invalid email address'),
  ],

  requestPasswordReset: [
    body('email').isEmail().withMessage('Invalid email address'),
  ],

  resetPassword: [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
  ],

  getUserRoles: [
    param('id').isMongoId().withMessage('Invalid user ID'),
  ],

  assignRoles: [
    param('id').isMongoId().withMessage('Invalid user ID'),
    body('roleIds').isArray().withMessage('Role IDs must be an array'),
    body('roleIds.*').isMongoId().withMessage('Invalid role ID'),
  ],

  removeRoles: [
    param('id').isMongoId().withMessage('Invalid user ID'),
    body('roleIds').isArray().withMessage('Role IDs must be an array'),
    body('roleIds.*').isMongoId().withMessage('Invalid role ID'),
  ],

  bulkAssignRoles: [
    body('userIds').isArray().withMessage('User IDs must be an array'),
    body('userIds.*').isMongoId().withMessage('Invalid user ID'),
    body('roleIds').isArray().withMessage('Role IDs must be an array'),
    body('roleIds.*').isMongoId().withMessage('Invalid role ID'),
  ],
}; 