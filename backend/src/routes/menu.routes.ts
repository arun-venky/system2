import express from 'express';
import { body, param } from 'express-validator';
import {
  getAllMenus,
  getMenuById,
  createMenu,
  updateMenu,
  deleteMenu,
  manageMenus,
  getMenuBySlug,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  reorderMenuItems,
  duplicateMenu
} from '../controllers/menu.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { checkPermission, isAdmin } from '../middleware/rbac.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';

export const menuRoutes = express.Router();

// Get all menus (filtered by role)
menuRoutes.get('/', verifyToken, getAllMenus);

// Get menu management interface (Admin only)
menuRoutes.get(
  '/manage',
  verifyToken,
  isAdmin,
  manageMenus
);

// Get menu by ID
menuRoutes.get(
  '/:id',
  verifyToken,
  param('id').isMongoId().withMessage('Invalid menu ID'),
  validateRequest,
  getMenuById
);

// Get menu by slug
menuRoutes.get(
  '/slug/:slug',
  verifyToken,
  param('slug').isString().withMessage('Invalid slug'),
  validateRequest,
  getMenuBySlug
);

// Create menu (Admin only)
menuRoutes.post(
  '/',
  verifyToken,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('items').isArray().withMessage('Items must be an array'),
    body('items.*.label').trim().notEmpty().withMessage('Item label is required'),
    body('items.*.url').trim().notEmpty().withMessage('Item URL is required'),
    body('items.*.roles').optional().isArray()
  ],
  validateRequest,
  isAdmin,
  createMenu
);

// Update menu (Admin only)
menuRoutes.put(
  '/:id',
  verifyToken,
  [
    param('id').isMongoId().withMessage('Invalid menu ID'),
    body('name').optional().trim(),
    body('items').optional().isArray()
  ],
  validateRequest,
  isAdmin,
  updateMenu
);

// Delete menu (Admin only)
menuRoutes.delete(
  '/:id',
  verifyToken,
  param('id').isMongoId().withMessage('Invalid menu ID'),
  validateRequest,
  isAdmin,
  deleteMenu
);

// Duplicate menu (Admin only)
menuRoutes.post(
  '/:id/duplicate',
  verifyToken,
  [
    param('id').isMongoId().withMessage('Invalid menu ID'),
    body('newName').trim().notEmpty().withMessage('New name is required')
  ],
  validateRequest,
  isAdmin,
  duplicateMenu
);

// Menu Item Management Routes
menuRoutes.post(
  '/:id/items',
  verifyToken,
  [
    param('id').isMongoId().withMessage('Invalid menu ID'),
    body('label').trim().notEmpty().withMessage('Item label is required'),
    body('url').trim().notEmpty().withMessage('Item URL is required'),
    body('roles').optional().isArray()
  ],
  validateRequest,
  isAdmin,
  addMenuItem
);

menuRoutes.put(
  '/:id/items/:itemId',
  verifyToken,
  [
    param('id').isMongoId().withMessage('Invalid menu ID'),
    param('itemId').isMongoId().withMessage('Invalid item ID'),
    body('label').optional().trim(),
    body('url').optional().trim(),
    body('roles').optional().isArray()
  ],
  validateRequest,
  isAdmin,
  updateMenuItem
);

menuRoutes.delete(
  '/:id/items/:itemId',
  verifyToken,
  [
    param('id').isMongoId().withMessage('Invalid menu ID'),
    param('itemId').isMongoId().withMessage('Invalid item ID')
  ],
  validateRequest,
  isAdmin,
  deleteMenuItem
);

// Reorder menu items (Admin only)
menuRoutes.put(
  '/:id/reorder',
  verifyToken,
  [
    param('id').isMongoId().withMessage('Invalid menu ID'),
    body('itemIds').isArray().withMessage('Item IDs must be an array'),
    body('itemIds.*').isMongoId().withMessage('Invalid item ID')
  ],
  validateRequest,
  isAdmin,
  reorderMenuItems
);