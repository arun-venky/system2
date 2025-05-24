import { Request, Response } from 'express';
import { Menu, IMenuItem } from '../models/menu.model.js';
import { AuditLog } from '../models/audit-log.model.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { logger, logAudit } from '../utils/logger.js';
import { Types } from 'mongoose';

// Get all menus controller
export const getAllMenus = async (req: Request, res: Response) => {
  try {
    const menus = await Menu.find({}).populate('items.roles', 'name');
    
    res.status(200).json({
      count: menus.length,
      menus,
    });
  } catch (error) {
    logger.error('Error getting menus', error);
    res.status(500).json({ message: 'Error retrieving menus' });
  }
};

// Get menu by ID controller
export const getMenuById = async (req: Request, res: Response) => {
  try {
    const menuId = req.params.id;
    
    const menu = await Menu.findById(menuId).populate('items.roles', 'name');
    
    if (!menu) {
      return res.status(404).json({ message: 'Menu not found' });
    }
    
    res.status(200).json(menu);
  } catch (error) {
    logger.error(`Error getting menu ${req.params.id}`, error);
    res.status(500).json({ message: 'Error retrieving menu' });
  }
};

// Create menu controller
export const createMenu = async (req: AuthRequest, res: Response) => {
  try {
    const { name, items } = req.body;
    
    // Check if menu already exists
    const existingMenu = await Menu.findOne({ name });
    
    if (existingMenu) {
      return res.status(400).json({ 
        message: 'Menu with this name already exists' 
      });
    }
    
    // Create new menu
    const menu = new Menu({
      name,
      items: items || [],
    });
    
    await menu.save();
    
    // Log the create action
    await AuditLog.create({
      userId: req.user?._id,
      action: 'create',
      resource: 'menus',
      details: `Menu ${menu.name} was created`,
    });
    
    logAudit(
      req.user?._id?.toString() || 'system',
      'create',
      'menus',
      `Menu ${menu.name} was created`
    );
    
    res.status(201).json({
      message: 'Menu created successfully',
      menu,
    });
  } catch (error) {
    logger.error('Error creating menu', error);
    res.status(500).json({ message: 'Error creating menu' });
  }
};

// Update menu controller
export const updateMenu = async (req: AuthRequest, res: Response) => {
  try {
    const menuId = req.params.id;
    const updates = req.body;
    
    // Find and update menu
    const menu = await Menu.findByIdAndUpdate(
      menuId,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('items.roles', 'name');
    
    if (!menu) {
      return res.status(404).json({ message: 'Menu not found' });
    }
    
    // Log the update action
    await AuditLog.create({
      userId: req.user?._id,
      action: 'update',
      resource: 'menus',
      details: `Menu ${menu.name} was updated`,
    });
    
    logAudit(
      req.user?._id?.toString() || 'system',
      'update',
      'menus',
      `Menu ${menu.name} was updated`
    );
    
    res.status(200).json({
      message: 'Menu updated successfully',
      menu,
    });
  } catch (error) {
    logger.error(`Error updating menu ${req.params.id}`, error);
    res.status(500).json({ message: 'Error updating menu' });
  }
};

// Delete menu controller
export const deleteMenu = async (req: AuthRequest, res: Response) => {
  try {
    const menuId = req.params.id;
    
    const menu = await Menu.findByIdAndDelete(menuId);
    
    if (!menu) {
      return res.status(404).json({ message: 'Menu not found' });
    }
    
    // Log the delete action
    await AuditLog.create({
      userId: req.user?._id,
      action: 'delete',
      resource: 'menus',
      details: `Menu ${menu.name} was deleted`,
    });
    
    logAudit(
      req.user?._id?.toString() || 'system',
      'delete',
      'menus',
      `Menu ${menu.name} was deleted`
    );
    
    res.status(200).json({
      message: 'Menu deleted successfully',
    });
  } catch (error) {
    logger.error(`Error deleting menu ${req.params.id}`, error);
    res.status(500).json({ message: 'Error deleting menu' });
  }
};

// Manage menus controller (bulk operations)
export const manageMenus = async (req: AuthRequest, res: Response) => {
  try {
    const { operations } = req.body;
    
    if (!Array.isArray(operations)) {
      return res.status(400).json({ 
        message: 'Operations must be an array' 
      });
    }
    
    const results = [];
    
    for (const op of operations) {
      const { action, menuId, data } = op as {
        action: 'create' | 'update' | 'delete' | 'addItem' | 'updateItem' | 'removeItem';
        menuId?: string;
        data?: any;
      };
      
      switch (action) {
        case 'create': {
          // Check if menu already exists
          const existingMenu = await Menu.findOne({ name: data.name });
          if (existingMenu) {
            results.push({
              action,
              success: false,
              message: 'Menu with this name already exists'
            });
            continue;
          }
          
          // Create new menu
          const newMenu = new Menu({
            name: data.name,
            items: data.items || [],
          });
          await newMenu.save();
          
          // Log the create action
          await AuditLog.create({
            userId: req.user?._id,
            action: 'create',
            resource: 'menus',
            details: `Menu ${newMenu.name} was created`,
          });
          
          logAudit(
            req.user?._id?.toString() || 'system',
            'create',
            'menus',
            `Menu ${newMenu.name} was created`
          );
          
          results.push({
            action,
            success: true,
            menu: newMenu
          });
          break;
        }
        
        case 'update': {
          const menuToUpdate = await Menu.findById(menuId);
          if (!menuToUpdate) {
            results.push({
              action,
              success: false,
              message: 'Menu not found'
            });
            continue;
          }
          
          // If name is being updated, check for duplicates
          if (data.name && data.name !== menuToUpdate.name) {
            const nameExists = await Menu.findOne({ name: data.name });
            if (nameExists) {
              results.push({
                action,
                success: false,
                message: 'Menu with this name already exists'
              });
              continue;
            }
          }
          
          // Update menu
          Object.assign(menuToUpdate, data);
          await menuToUpdate.save();
          
          // Log the update action
          await AuditLog.create({
            userId: req.user?._id,
            action: 'update',
            resource: 'menus',
            details: `Menu ${menuToUpdate.name} was updated`,
          });
          
          logAudit(
            req.user?._id?.toString() || 'system',
            'update',
            'menus',
            `Menu ${menuToUpdate.name} was updated`
          );
          
          results.push({
            action,
            success: true,
            menu: menuToUpdate
          });
          break;
        }
        
        case 'delete': {
          const menuToDelete = await Menu.findByIdAndDelete(menuId);
          if (!menuToDelete) {
            results.push({
              action,
              success: false,
              message: 'Menu not found'
            });
            continue;
          }
          
          // Log the delete action
          await AuditLog.create({
            userId: req.user?._id,
            action: 'delete',
            resource: 'menus',
            details: `Menu ${menuToDelete.name} was deleted`,
          });
          
          logAudit(
            req.user?._id?.toString() || 'system',
            'delete',
            'menus',
            `Menu ${menuToDelete.name} was deleted`
          );
          
          results.push({
            action,
            success: true
          });
          break;
        }
        
        case 'addItem': {
          const menu = await Menu.findById(menuId);
          if (!menu) {
            results.push({
              action,
              success: false,
              message: 'Menu not found'
            });
            continue;
          }
          
          const { label, url, roles } = data;
          
          // Check if item with same label already exists
          const itemExists = menu.items.some(item => item.label === label);
          if (itemExists) {
            results.push({
              action,
              success: false,
              message: 'Menu item with this label already exists'
            });
            continue;
          }
          
          // Add new item
          const newItem: IMenuItem = {
            _id: new Types.ObjectId(),
            label,
            url,
            roles: roles || [],
            order: 0
          };
          menu.items.push(newItem);
          await menu.save();
          
          // Log the action
          await AuditLog.create({
            userId: req.user?._id,
            action: 'addItem',
            resource: 'menus',
            details: `Item ${label} was added to menu ${menu.name}`,
          });
          
          logAudit(
            req.user?._id?.toString() || 'system',
            'addItem',
            'menus',
            `Item ${label} was added to menu ${menu.name}`
          );
          
          results.push({
            action,
            success: true,
            menu
          });
          break;
        }
        
        case 'updateItem': {
          const menu = await Menu.findById(menuId);
          if (!menu) {
            results.push({
              action,
              success: false,
              message: 'Menu not found'
            });
            continue;
          }
          
          const { itemId, updates } = data;
          
          // Find item index
          const itemIndex = menu.items.findIndex(item => item._id.toString() === itemId);
          if (itemIndex === -1) {
            results.push({
              action,
              success: false,
              message: 'Menu item not found'
            });
            continue;
          }
          
          // Check for duplicate label if label is being updated
          if (updates.label && updates.label !== menu.items[itemIndex].label) {
            const labelExists = menu.items.some(item => item.label === updates.label);
            if (labelExists) {
              results.push({
                action,
                success: false,
                message: 'Menu item with this label already exists'
              });
              continue;
            }
          }
          
          // Update item
          Object.assign(menu.items[itemIndex], updates);
          await menu.save();
          
          // Log the action
          await AuditLog.create({
            userId: req.user?._id,
            action: 'updateItem',
            resource: 'menus',
            details: `Item ${menu.items[itemIndex].label} updated in menu ${menu.name}`,
          });
          
          logAudit(
            req.user?._id?.toString() || 'system',
            'updateItem',
            'menus',
            `Item ${menu.items[itemIndex].label} updated in menu ${menu.name}`
          );
          
          results.push({
            action,
            success: true,
            menu
          });
          break;
        }
        
        case 'removeItem': {
          const menu = await Menu.findById(menuId);
          if (!menu) {
            results.push({
              action,
              success: false,
              message: 'Menu not found'
            });
            continue;
          }
          
          const { itemId } = data;
          
          // Find item index
          const itemIndex = menu.items.findIndex(item => item._id.toString() === itemId);
          if (itemIndex === -1) {
            results.push({
              action,
              success: false,
              message: 'Menu item not found'
            });
            continue;
          }
          
          // Remove item
          const removedItem = menu.items.splice(itemIndex, 1)[0];
          await menu.save();
          
          // Log the action
          await AuditLog.create({
            userId: req.user?._id,
            action: 'removeItem',
            resource: 'menus',
            details: `Item ${removedItem.label} was removed from menu ${menu.name}`,
          });
          
          logAudit(
            req.user?._id?.toString() || 'system',
            'removeItem',
            'menus',
            `Item ${removedItem.label} was removed from menu ${menu.name}`
          );
          
          results.push({
            action,
            success: true,
            menu
          });
          break;
        }
        
        default:
          results.push({
            action,
            success: false,
            message: 'Invalid action'
          });
      }
    }
    
    // Log the bulk operation
    await AuditLog.create({
      userId: req.user?._id,
      action: 'manage',
      resource: 'menus',
      details: `Bulk menu operations performed: ${operations.length} operations`,
    });
    
    logAudit(
      req.user?._id?.toString() || 'system',
      'manage',
      'menus',
      `Bulk menu operations performed: ${operations.length} operations`
    );
    
    res.status(200).json({
      message: 'Bulk operations completed',
      results
    });
  } catch (error) {
    logger.error('Error managing menus', error);
    res.status(500).json({ message: 'Error performing bulk operations' });
  }
};

// Get menu by slug controller
export const getMenuBySlug = async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug;
    
    const menu = await Menu.findOne({ slug }).populate('items');
    
    if (!menu) {
      return res.status(404).json({ message: 'Menu not found' });
    }
    
    res.status(200).json(menu);
  } catch (error) {
    logger.error(`Error getting menu with slug ${req.params.slug}`, error);
    res.status(500).json({ message: 'Error retrieving menu' });
  }
};

// Add menu item controller
export const addMenuItem = async (req: AuthRequest, res: Response) => {
  try {
    const menuId = req.params.id;
    const { label, url, roles } = req.body;
    
    const menu = await Menu.findById(menuId);
    if (!menu) {
      return res.status(404).json({ message: 'Menu not found' });
    }
    
    const newItem: IMenuItem = {
      _id: new Types.ObjectId(),
      label,
      url,
      roles: roles || [],
      order: 0
    };
    
    menu.items.push(newItem);
    await menu.save();
    
    // Log the action
    await AuditLog.create({
      userId: req.user?._id,
      action: 'add_item',
      resource: 'menus',
      details: `Item ${label} added to menu ${menu.name}`,
    });
    
    logAudit(
      req.user?._id?.toString() || 'system',
      'add_item',
      'menus',
      `Item ${label} added to menu ${menu.name}`
    );
    
    res.status(201).json({
      message: 'Menu item added successfully',
      menu,
    });
  } catch (error) {
    logger.error(`Error adding item to menu ${req.params.id}`, error);
    res.status(500).json({ message: 'Error adding menu item' });
  }
};

// Update menu item controller
export const updateMenuItem = async (req: AuthRequest, res: Response) => {
  try {
    const { menuId, itemId } = req.params;
    const updates = req.body;
    
    const menu = await Menu.findById(menuId);
    if (!menu) {
      return res.status(404).json({ message: 'Menu not found' });
    }
    
    const itemIndex = menu.items.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    menu.items[itemIndex] = {
      ...menu.items[itemIndex],
      ...updates,
    };
    
    await menu.save();
    
    // Log the action
    await AuditLog.create({
      userId: req.user?._id,
      action: 'update_item',
      resource: 'menus',
      details: `Item ${menu.items[itemIndex].label} updated in menu ${menu.name}`,
    });
    
    logAudit(
      req.user?._id?.toString() || 'system',
      'update_item',
      'menus',
      `Item ${menu.items[itemIndex].label} updated in menu ${menu.name}`
    );
    
    res.status(200).json({
      message: 'Menu item updated successfully',
      menu,
    });
  } catch (error) {
    logger.error(`Error updating menu item ${req.params.itemId}`, error);
    res.status(500).json({ message: 'Error updating menu item' });
  }
};

// Delete menu item controller
export const deleteMenuItem = async (req: AuthRequest, res: Response) => {
  try {
    const { menuId, itemId } = req.params;
    
    const menu = await Menu.findById(menuId);
    if (!menu) {
      return res.status(404).json({ message: 'Menu not found' });
    }
    
    const itemIndex = menu.items.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    const deletedItem = menu.items[itemIndex];
    menu.items.splice(itemIndex, 1);
    await menu.save();
    
    // Log the action
    await AuditLog.create({
      userId: req.user?._id,
      action: 'delete_item',
      resource: 'menus',
      details: `Item ${deletedItem.label} deleted from menu ${menu.name}`,
    });
    
    logAudit(
      req.user?._id?.toString() || 'system',
      'delete_item',
      'menus',
      `Item ${deletedItem.label} deleted from menu ${menu.name}`
    );
    
    res.status(200).json({
      message: 'Menu item deleted successfully',
      menu,
    });
  } catch (error) {
    logger.error(`Error deleting menu item ${req.params.itemId}`, error);
    res.status(500).json({ message: 'Error deleting menu item' });
  }
};

// Reorder menu items controller
export const reorderMenuItems = async (req: AuthRequest, res: Response) => {
  try {
    const menuId = req.params.id;
    const { itemIds } = req.body;
    
    if (!Array.isArray(itemIds)) {
      return res.status(400).json({ message: 'itemIds must be an array' });
    }
    
    const menu = await Menu.findById(menuId);
    if (!menu) {
      return res.status(404).json({ message: 'Menu not found' });
    }
    
    // Create a map of new positions
    const newPositions = new Map(itemIds.map((id, index) => [id, index]));
    
    // Update item orders
    menu.items.forEach(item => {
      const newOrder = newPositions.get(item._id.toString());
      if (newOrder !== undefined) {
        item.order = newOrder;
      }
    });
    
    await menu.save();
    
    // Log the action
    await AuditLog.create({
      userId: req.user?._id,
      action: 'reorder_items',
      resource: 'menus',
      details: `Items reordered in menu ${menu.name}`,
    });
    
    logAudit(
      req.user?._id?.toString() || 'system',
      'reorder_items',
      'menus',
      `Items reordered in menu ${menu.name}`
    );
    
    res.status(200).json({
      message: 'Menu items reordered successfully',
      menu,
    });
  } catch (error) {
    logger.error(`Error reordering items in menu ${req.params.id}`, error);
    res.status(500).json({ message: 'Error reordering menu items' });
  }
};

// Duplicate menu controller
export const duplicateMenu = async (req: AuthRequest, res: Response) => {
  try {
    const menuId = req.params.id;
    const { name } = req.body;
    
    const originalMenu = await Menu.findById(menuId);
    if (!originalMenu) {
      return res.status(404).json({ message: 'Menu not found' });
    }
    
    // Check if new name already exists
    const existingMenu = await Menu.findOne({ name });
    if (existingMenu) {
      return res.status(400).json({ message: 'Menu with this name already exists' });
    }
    
    // Create new menu with same items
    const newMenu = new Menu({
      name,
      items: originalMenu.items,
    });
    
    await newMenu.save();
    
    // Log the action
    await AuditLog.create({
      userId: req.user?._id,
      action: 'duplicate',
      resource: 'menus',
      details: `Menu ${originalMenu.name} was duplicated as ${name}`,
    });
    
    logAudit(
      req.user?._id?.toString() || 'system',
      'duplicate',
      'menus',
      `Menu ${originalMenu.name} was duplicated as ${name}`
    );
    
    res.status(201).json({
      message: 'Menu duplicated successfully',
      menu: newMenu,
    });
  } catch (error) {
    logger.error(`Error duplicating menu ${req.params.id}`, error);
    res.status(500).json({ message: 'Error duplicating menu' });
  }
};