import express from 'express';
import { body, param } from 'express-validator';
import { getAllUsers, getUserById, updateUser, deleteUser } from '../controllers/user.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { checkPermission, isSelfOrAdmin, isAdmin } from '../middleware/rbac.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';

export const userRoutes = express.Router();

// Get all users (Admin only)
userRoutes.get(
  '/',
  verifyToken,
  checkPermission('users', 'read'),
  getAllUsers
);

// Get user by ID (self or Admin)
userRoutes.get(
  '/:id',
  verifyToken,
  param('id').isMongoId().withMessage('Invalid user ID'),
  validateRequest,
  isSelfOrAdmin,
  getUserById
);

// Update user (self or Admin)
userRoutes.put(
  '/:id',
  verifyToken,
  [
    param('id').isMongoId().withMessage('Invalid user ID'),
    body('username')
      .optional()
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters'),
    body('email')
      .optional()
      .isEmail()
      .withMessage('Must be a valid email address')
      .normalizeEmail(),
    body('password')
      .optional()
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),   
  ],
  validateRequest,
  isSelfOrAdmin,
  updateUser
);

// Delete user (Admin only)
userRoutes.delete(
  '/:id',
  verifyToken,
  param('id').isMongoId().withMessage('Invalid user ID'),
  validateRequest,
  isAdmin,
  deleteUser
);