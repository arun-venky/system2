import express from 'express';
import {
  getAllPages,
  getPageById,
  createPage,
  updatePage,
  deletePage,
  getPageElementsByPageId,
  reorderPages,
  getAvailableResources,
  bulkDeletePageElements,
  createPageElement,
  deletePageElement,
  getAllPageElements,
  updatePageElement
} from '../controllers/page.controller.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { checkPermission } from '../middleware/rbac.middleware.js';
import { pageValidation } from '../validations/page.validation.js';

export const pageRoutes = express.Router();

// Get all pages
pageRoutes.get('/', verifyToken, getAllPages);

// Get page by ID
pageRoutes.get('/:id', verifyToken, validateRequest(pageValidation.getPageById), getPageById);

// Create page
pageRoutes.post('/', 
  verifyToken, 
  checkPermission('pages', 'create'),
  validateRequest(pageValidation.createPage), 
  createPage
);

// Update page
pageRoutes.put('/:id', 
  verifyToken, 
  checkPermission('pages', 'update'),
  validateRequest(pageValidation.updatePage), 
  updatePage
);

// Delete page
pageRoutes.delete('/:id', 
  verifyToken, 
  checkPermission('pages', 'delete'),
  validateRequest(pageValidation.deletePage), 
  deletePage
);

// Reorder pages
pageRoutes.post('/reorder', 
  verifyToken, 
  checkPermission('pages', 'update'),
  validateRequest(pageValidation.reorderPages),
  reorderPages
);

// Get available resources
pageRoutes.get('/resources/available', 
  verifyToken, 
  checkPermission('pages', 'read'),
  validateRequest(pageValidation.getAvailableResources),
  getAvailableResources
);

// Get page elements by page ID
pageRoutes.get('/:id/elements', 
  verifyToken, 
  validateRequest(pageValidation.getPageElementsByPageId),
  getPageElementsByPageId
); 

// Create page element
pageRoutes.post('/:id/elements', 
  verifyToken, 
  checkPermission('pages', 'create'),
  validateRequest(pageValidation.createPageElement),
  createPageElement
);

// Update page element
pageRoutes.put('/:id/elements/:elementId', 
  verifyToken, 
  checkPermission('pages', 'update'),
  validateRequest(pageValidation.updatePageElement),
  updatePageElement
);

// Delete page element
pageRoutes.delete('/:id/elements/:elementId', 
  verifyToken, 
  checkPermission('pages', 'delete'),
  validateRequest(pageValidation.deletePageElement),
  deletePageElement
);

// Bulk delete page elements
pageRoutes.delete('/:id/elements/bulk', 
  verifyToken, 
  checkPermission('pages', 'delete'),
  validateRequest(pageValidation.bulkDeletePageElements),
  bulkDeletePageElements
);


