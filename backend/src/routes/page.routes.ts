import express from 'express';
import {
  getAllPages,
  getPageById,
  getPageBySlug,
  createPage,
  updatePage,
  deletePage,
  managePages,
  publishPage,
  unpublishPage,
  getPageVersions,
  restorePageVersion,
  getPageDraft,
  savePageDraft,
  deletePageDraft,
  duplicatePage,
  movePage,
  getPageTree,
} from '../controllers/page.controller.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { checkPermission } from '../middleware/rbac.middleware.js';
import { pageValidation } from '../validations/page.validation.js';

export const pageRoutes = express.Router();

// Get all pages
pageRoutes.get('/', verifyToken, getAllPages);

// Get page by ID
pageRoutes.get('/:id', verifyToken, getPageById);

// Get page by slug
pageRoutes.get('/slug/:slug', verifyToken, getPageBySlug);

// Create page
pageRoutes.post(
  '/',
  verifyToken,
  validateRequest(pageValidation.createPage),
  checkPermission('pages', 'create'),
  createPage
);

// Update page
pageRoutes.put(
  '/:id',
  verifyToken,
  validateRequest(pageValidation.updatePage),
  checkPermission('pages', 'update'),
  updatePage
);

// Delete page
pageRoutes.delete(
  '/:id',
  verifyToken,
  checkPermission('pages', 'delete'),
  deletePage
);

// Manage pages (bulk operations)
pageRoutes.post(
  '/manage',
  verifyToken,
  validateRequest(pageValidation.managePages),
  checkPermission('pages', 'update'),
  managePages
);

// Publish page
pageRoutes.post(
  '/:id/publish',
  verifyToken,
  checkPermission('pages', 'update'),
  publishPage
);

// Unpublish page
pageRoutes.post(
  '/:id/unpublish',
  verifyToken,
  checkPermission('pages', 'update'),
  unpublishPage
);

// Get page versions
pageRoutes.get(
  '/:id/versions',
  verifyToken,
  checkPermission('pages', 'read'),
  getPageVersions
);

// Restore page version
pageRoutes.post(
  '/:id/versions/:versionId/restore',
  verifyToken,
  checkPermission('pages', 'update'),
  restorePageVersion
);

// Get page draft
pageRoutes.get(
  '/:id/draft',
  verifyToken,
  checkPermission('pages', 'read'),
  getPageDraft
);

// Save page draft
pageRoutes.post(
  '/:id/draft',
  verifyToken,
  validateRequest(pageValidation.saveDraft),
  checkPermission('pages', 'update'),
  savePageDraft
);

// Delete page draft
pageRoutes.delete(
  '/:id/draft',
  verifyToken,
  checkPermission('pages', 'update'),
  deletePageDraft
);

// Duplicate page
pageRoutes.post(
  '/:id/duplicate',
  verifyToken,
  validateRequest(pageValidation.duplicatePage),
  checkPermission('pages', 'create'),
  duplicatePage
);

// Move page
pageRoutes.post(
  '/:id/move',
  verifyToken,
  validateRequest(pageValidation.movePage),
  checkPermission('pages', 'update'),
  movePage
);

// Get page tree
pageRoutes.get(
  '/tree',
  verifyToken,
  checkPermission('pages', 'read'),
  getPageTree
);