import { body, param } from 'express-validator';

export const pageValidation = {
  createPage: [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('content').optional(),
    body('slug').optional().trim(),
    body('parentId').optional().isMongoId().withMessage('Invalid parent page ID'),
    body('order').optional().isInt({ min: 0 }),
  ],

  updatePage: [
    param('id').isMongoId().withMessage('Invalid page ID'),
    body('title').optional().trim(),
    body('content').optional(),
    body('slug').optional().trim(),
    body('parentId').optional().isMongoId().withMessage('Invalid parent page ID'),
    body('order').optional().isInt({ min: 0 }),
  ],

  saveDraft: [
    param('id').isMongoId().withMessage('Invalid page ID'),
    body('content').notEmpty().withMessage('Draft content is required'),
  ],

  duplicatePage: [
    param('id').isMongoId().withMessage('Invalid page ID'),
    body('title').trim().notEmpty().withMessage('New title is required'),
    body('slug').optional().trim(),
  ],

  movePage: [
    param('id').isMongoId().withMessage('Invalid page ID'),
    body('parentId').optional().isMongoId().withMessage('Invalid parent page ID'),
    body('order').optional().isInt({ min: 0 }),
  ],

  managePages: [
    body('action').isIn(['publish', 'unpublish', 'delete']).withMessage('Invalid action'),
    body('pageIds').isArray().withMessage('Page IDs must be an array'),
    body('pageIds.*').isMongoId().withMessage('Invalid page ID'),
  ],
}; 