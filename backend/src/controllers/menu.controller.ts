import { Request, Response } from 'express';
import { Menu } from '../models/menu.model.js';
import { AuditLog } from '../models/audit-log.model.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { logger, logAudit } from '../utils/logger.js';
import { Types } from 'mongoose';

// Get all menus controller
export const getAllMenus = async (req: Request, res: Response) => {
  try {
    const menus = await Menu.find()
      .populate('parent', 'name label')
      .populate('pageElement', 'name description')
      .sort({ displayOrder: 1 });

    res.status(200).json({ menus });
  } catch (error) {
    logger.error('Error getting menus', error);
    res.status(500).json({ message: 'Error retrieving menus' });
  }
};

// Get menu by ID controller
export const getMenuById = async (req: Request, res: Response) => {
  try {
    const menuId = req.params.id;
    
    const menu = await Menu.findById(menuId)
      .populate('parent', 'name label')
      .populate('pageElement', 'name description');
    
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
    const {
      name,
      label,
      icon,
      slug,
      displayOrder,
      parent,
      pageElement
    } = req.body;

    // Check if menu with same name exists
    const existingMenu = await Menu.findOne({ name });
    if (existingMenu) {
      return res.status(400).json({ message: 'Menu with this name already exists' });
    }

    const menu = new Menu({
      name,
      label,
      icon,
      slug,
      displayOrder,
      parent,
      pageElement
    });

    await menu.save();
    await menu.populate('parent pageElement');

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

    res.status(201).json(menu);
  } catch (error) {
    logger.error('Error creating menu', error);
    res.status(500).json({ message: 'Error creating menu' });
  }
};

// Update menu controller
export const updateMenu = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // If name is being updated, check for duplicates
    if (updateData.name) {
      const existingMenu = await Menu.findOne({ 
        name: updateData.name,
        _id: { $ne: id }
      });
      if (existingMenu) {
        return res.status(400).json({ message: 'Menu with this name already exists' });
      }
    }

    const menu = await Menu.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('parent pageElement');

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

    res.status(200).json(menu);
  } catch (error) {
    logger.error('Error updating menu', error);
    res.status(500).json({ message: 'Error updating menu' });
  }
};

// Delete menu controller
export const deleteMenu = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check for submenus
    const hasSubmenus = await Menu.exists({ parent: id });
    if (hasSubmenus) {
      return res.status(400).json({ 
        message: 'Cannot delete menu with submenus. Delete submenus first.' 
      });
    }

    const menu = await Menu.findByIdAndDelete(id);
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

    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting menu', error);
    res.status(500).json({ message: 'Error deleting menu' });
  }
};

// Reorder menus controller
export const reorderMenus = async (req: AuthRequest, res: Response) => {
  try {
    const { menuIds } = req.body;

    const updatePromises = menuIds.map((id: string, index: number) => 
      Menu.findByIdAndUpdate(id, { displayOrder: index })
    );

    await Promise.all(updatePromises);

    // Log the reorder action
    await AuditLog.create({
      userId: req.user?._id,
      action: 'reorder',
      resource: 'menus',
      details: `Menus were reordered`,
    });

    logAudit(
      req.user?._id?.toString() || 'system',
      'reorder',
      'menus',
      `Menus were reordered`
    );

    res.status(200).json({ message: 'Menus reordered successfully' });
  } catch (error) {
    logger.error('Error reordering menus', error);
    res.status(500).json({ message: 'Error reordering menus' });
  }
};

// Get menu by slug controller
export const getMenuBySlug = async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug;
    
    const menu = await Menu.findOne({ slug })
      .populate('parent', 'name label')
      .populate('pageElement', 'name description');
    
    if (!menu) {
      return res.status(404).json({ message: 'Menu not found' });
    }
    
    res.status(200).json(menu);
  } catch (error) {
    logger.error(`Error getting menu with slug ${req.params.slug}`, error);
    res.status(500).json({ message: 'Error retrieving menu' });
  }
};