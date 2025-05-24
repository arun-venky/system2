import { body, param } from 'express-validator';

export const pageValidation = {
  createPage: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ min: 3, max: 50 })
      .withMessage('Name must be between 3 and 50 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description must not exceed 500 characters'),
    body('displayOrder')
      .isInt({ min: 0 })
      .withMessage('Display order must be a non-negative integer')
  ],

  updatePage: [
    param('id')
      .isMongoId()
      .withMessage('Invalid page ID'),
    body('name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Name cannot be empty')
      .isLength({ min: 3, max: 50 })
      .withMessage('Name must be between 3 and 50 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description must not exceed 500 characters'),
    body('displayOrder')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Display order must be a non-negative integer')
  ],

  deletePage: [
    param('id')
      .isMongoId()
      .withMessage('Invalid page ID')
  ],

  getPageById: [
    param('id')
      .isMongoId()
      .withMessage('Invalid page ID')
  ],

  reorderPages: [
    body('pageIds').isArray().withMessage('Page IDs must be an array'),
    body('pageIds.*').isMongoId().withMessage('Invalid page ID')
  ],

  getAvailableResources: [
    body('type').optional().isIn(['text', 'image', 'video', 'link', 'button', 'form', 'table', 'list', 'card', 'carousel', 'slider', 'accordion', 'tabs', 'modal', 'tooltip', 'popover', 'toast', 'alert', 'progress', 'chart', 'map', 'calendar', 'contact', 'social', 'search', 'filter', 'sort', 'pagination', 'table', 'list', 'card', 'carousel', 'slider', 'accordion', 'tabs', 'modal', 'tooltip', 'popover', 'toast', 'alert', 'progress', 'chart', 'map', 'calendar', 'contact', 'social', 'search', 'filter', 'sort', 'pagination']).withMessage('Invalid type')
  ],

  getPageElementsByPageId: [
    param('id').isMongoId().withMessage('Invalid page ID')
  ],

  getPageElementById: [
    param('id').isMongoId().withMessage('Invalid page element ID')
  ],

  createPageElement:  [   
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ min: 3, max: 50 })
      .withMessage('Name must be between 3 and 50 characters'),   
    body('page').isMongoId().withMessage('Invalid page ID')
  ],

  updatePageElement: [
    param('id').isMongoId().withMessage('Invalid page element ID'),
    body('name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Name cannot be empty')
      .isLength({ min: 3, max: 50 })
      .withMessage('Name must be between 3 and 50 characters'),
    body('page').isMongoId().withMessage('Invalid page ID')
  ],

  deletePageElement: [
    param('id').isMongoId().withMessage('Invalid page element ID')
  ],

  bulkDeletePageElements: [
    body('elementIds').isArray().withMessage('Element IDs must be an array'),
    body('elementIds.*').isMongoId().withMessage('Invalid page element ID')
  ]  
}; 