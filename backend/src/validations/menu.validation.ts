import { body, param } from 'express-validator';

export const menuValidation = {
  getMenuById: [
    param('id').isMongoId().withMessage('Invalid menu ID'),
  ],

  getMenuBySlug: [
    param('slug').isString().withMessage('Invalid slug'),
  ],

  createMenu: [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('items').isArray().withMessage('Items must be an array'),
    body('items.*.label').trim().notEmpty().withMessage('Item label is required'),
    body('items.*.url').trim().notEmpty().withMessage('Item URL is required'),
    body('items.*.roles').optional().isArray()
  ],

  updateMenu: [
    param('id').isMongoId().withMessage('Invalid menu ID'),
    body('name').optional().trim(),
    body('items').optional().isArray()
  ],

  deleteMenu: [
    param('id').isMongoId().withMessage('Invalid menu ID'),
  ],

  duplicateMenu: [
    param('id').isMongoId().withMessage('Invalid menu ID'),
    body('newName').trim().notEmpty().withMessage('New name is required')
  ],

  createMenuItem: [
    param('id').isMongoId().withMessage('Invalid menu ID'),
    body('label').trim().notEmpty().withMessage('Label is required'),
    body('url').trim().notEmpty().withMessage('URL is required'),
    body('roles').optional().isArray()
  ],

  updateMenuItem: [
    param('id').isMongoId().withMessage('Invalid menu ID'),
    param('itemId').isMongoId().withMessage('Invalid item ID'),
    body('label').optional().trim(),
    body('url').optional().trim(),
    body('roles').optional().isArray()
  ],

  deleteMenuItem: [
    param('id').isMongoId().withMessage('Invalid menu ID'),
    body('itemId').isMongoId().withMessage('Invalid menu item ID')
  ],

  moveMenuItem: [
    param('id').isMongoId().withMessage('Invalid menu ID'),
    body('itemId').isMongoId().withMessage('Invalid menu item ID'),
    body('newParentId').optional().isMongoId().withMessage('Invalid new parent menu ID')
  ],

  reorderMenuItems: [
    param('id').isMongoId().withMessage('Invalid menu ID'),
    body('itemIds').isArray().withMessage('Item IDs must be an array'),
    body('itemIds.*').isMongoId().withMessage('Invalid menu item ID')
  ],

  getMenuItems: [
    param('id').isMongoId().withMessage('Invalid menu ID')
  ],

  getMenuItemById: [
    param('id').isMongoId().withMessage('Invalid menu ID'),
    body('itemId').isMongoId().withMessage('Invalid menu item ID')
  ],

  getMenuItemBySlug: [
    param('id').isMongoId().withMessage('Invalid menu ID'),
    body('slug').isString().withMessage('Invalid slug')
  ]
}; 