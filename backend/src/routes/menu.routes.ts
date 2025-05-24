import express from 'express';
import {
  getAllMenus,
  getMenuById,
  createMenu,
  updateMenu,
  deleteMenu,
  getMenuBySlug,
} from '../controllers/menu.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { checkPermission, isAdmin } from '../middleware/rbac.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import { menuValidation } from '../validations/menu.validation.js';

export const menuRoutes = express.Router();

// Get all menus (filtered by role)
menuRoutes.get('/', verifyToken, getAllMenus);

// Get menu by ID
menuRoutes.get(
  '/:id',
  verifyToken, 
  validateRequest(menuValidation.getMenuById),
  checkPermission('menus', 'read'),
  getMenuById
);

// Get menu by slug
menuRoutes.get(
  '/slug/:slug',
  verifyToken,  
  validateRequest(menuValidation.getMenuBySlug),
  checkPermission('menus', 'read'),
  getMenuBySlug
);

// Create menu (Admin only)
menuRoutes.post(
  '/',
  verifyToken, 
  validateRequest(menuValidation.createMenu),
  checkPermission('menus', 'create'),
  isAdmin,
  createMenu
);

// Update menu (Admin only)
menuRoutes.put(
  '/:id',
  verifyToken,  
  validateRequest(menuValidation.updateMenu),
  checkPermission('menus', 'update'),
  isAdmin,
  updateMenu
);

// Delete menu (Admin only)
menuRoutes.delete(
  '/:id',
  verifyToken,  
  validateRequest(menuValidation.deleteMenu),
  checkPermission('menus', 'delete'),
  isAdmin,
  deleteMenu
);
