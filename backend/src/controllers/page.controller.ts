import { Request, Response } from 'express';
import { Page } from '../models/page.model.js';
import { PageElement } from '../models/page-element.model.js';
import { AuditLog } from '../models/audit-log.model.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { logger, logAudit } from '../utils/logger.js';

// Get all pages controller
export const getAllPages = async (req: Request, res: Response) => {
  try {
    const pages = await Page.find()
      .populate('pageElements')
      .sort({ displayOrder: 1 });
    res.status(200).json({ pages });
  } catch (error) {
    logger.error('Error getting pages', error);
    res.status(500).json({ message: 'Error retrieving pages' });
  }
};

// Get page by ID controller
export const getPageById = async (req: Request, res: Response) => {
  try {
    const pageId = req.params.id;
    
    const page = await Page.findById(pageId).lean();
      //.populate('pageElements', 'name description');
    
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }
    
    res.status(200).json(page);
  } catch (error) {
    logger.error(`Error getting page ${req.params.id}`, error);
    res.status(500).json({ message: 'Error retrieving page' });
  }
};

// Create page controller
export const createPage = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, displayOrder } = req.body;

    const page = new Page({
      name,
      description,
      displayOrder
    });

    await page.save();

    // Log the create action
    await AuditLog.create({
      userId: req.user?._id,
      action: 'create',
      resource: 'pages',
      details: `Page ${page.name} was created`,
    });

    logAudit(
      req.user?._id?.toString() || 'system',
      'create',
      'pages',
      `Page ${page.name} was created`
    );

    res.status(201).json({ page });
  } catch (error) {
    logger.error('Error creating page', error);
    res.status(500).json({ message: 'Error creating page' });
  }
};

// Update page controller
export const updatePage = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, displayOrder } = req.body;

    const page = await Page.findByIdAndUpdate(
      id,
      {
        name,
        description,
        displayOrder
      },
      { new: true }
    );

    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }

    // Log the update action
    await AuditLog.create({
      userId: req.user?._id,
      action: 'update',
      resource: 'pages',
      details: `Page ${page.name} was updated`,
    });

    logAudit(
      req.user?._id?.toString() || 'system',
      'update',
      'pages',
      `Page ${page.name} was updated`
    );

    res.status(200).json({ page });
  } catch (error) {
    logger.error('Error updating page', error);
    res.status(500).json({ message: 'Error updating page' });
  }
};

// Delete page controller
export const deletePage = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if page has elements
    const page = await Page.findById(id);
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }

    // Check if any PageElements reference this page
    const pageElementCount = await PageElement.countDocuments({ page: id });
    if (pageElementCount > 0) {
      return res.status(400).json({
        message: 'Cannot delete page with elements. Delete elements first.'
      });
    }

    await Page.findByIdAndDelete(id);

    // Log the delete action
    await AuditLog.create({
      userId: req.user?._id,
      action: 'delete',
      resource: 'pages',
      details: `Page ${page.name} was deleted`,
    });

    logAudit(
      req.user?._id?.toString() || 'system',
      'delete',
      'pages',
      `Page ${page.name} was deleted`
    );

    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting page', error);
    res.status(500).json({ message: 'Error deleting page' });
  }
};

// Get available resources controller
export const getAvailableResources = async (req: Request, res: Response) => {
  try {
    const pages = await Page.find({})
      .select('slug title')
      .sort('title')
      .lean();
    
    if (!pages) {
      logger.warn('No pages found when fetching available resources');
      // return res.status(200).json({
      //   resources: [
      //     { value: 'pages', label: 'Pages' },
      //     { value: 'users', label: 'Users' },
      //     { value: 'roles', label: 'Roles' },
      //     { value: 'menus', label: 'Menus' },
      //     { value: 'security', label: 'Security' }
      //   ]
      // });
    }
    
    const resources = pages.map(page => ({
      _id: page._id,
      name: page.name,
      value: page.name      
    }));

    // // Add system resources
    // const systemResources = [
    //   { value: 'pages', label: 'Pages' },
    //   { value: 'users', label: 'Users' },
    //   { value: 'roles', label: 'Roles' },
    //   { value: 'menus', label: 'Menus' },
    //   { value: 'security', label: 'Security' }
    // ];

    res.status(200).json({
      resources: [...resources]
    });
  } catch (error) {
    logger.error('Error getting available resources:', error);
    res.status(500).json({ 
      message: 'Error retrieving available resources',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Reorder pages controller
export const reorderPages = async (req: AuthRequest, res: Response) => {
  try {
    const { pageIds } = req.body;

    const updatePromises = pageIds.map((id: string, index: number) => 
      Page.findByIdAndUpdate(id, { displayOrder: index })
    );

    await Promise.all(updatePromises);

    // Log the reorder action
    await AuditLog.create({
      userId: req.user?._id,
      action: 'reorder',
      resource: 'pages',
      details: `Pages were reordered`,
    });

    logAudit(
      req.user?._id?.toString() || 'system',
      'reorder',
      'pages',
      `Pages were reordered`
    );

    res.status(200).json({ message: 'Pages reordered successfully' });
  } catch (error) {
    logger.error('Error reordering pages', error);
    res.status(500).json({ message: 'Error reordering pages' });
  }
};

// Get all page elements controller
export const getAllPageElements = async (req: Request, res: Response) => {
  try {
    const pageId = req.params.id;

    const pageElements = await PageElement.find({ page: pageId })
      .sort({ displayOrder: 1 }).lean();

    res.status(200).json({ pageElements });
  } catch (error) {
    logger.error('Error getting page elements', error);
    res.status(500).json({ message: 'Error retrieving page elements' });
  }
};

// Get page elements by page ID
export const getPageElementsByPageId = async (req: Request, res: Response) => {
  try {
    const pageId = req.params.id;

    // // First check if the page exists
    // const page = await Page.findById(pageId);
    // if (!page) {
    //   return res.status(404).json({ message: 'Page not found' });
    // }

    const pageElements = await PageElement.find({ page: pageId })
      .sort({ displayOrder: 1 })
      .lean();

    res.status(200).json({ pageElements });
  } catch (error) {
    logger.error('Error getting page elements by page ID', error);
    res.status(500).json({ message: 'Error retrieving page elements' });
  }
};

// Create page element
export const createPageElement = async (req: Request, res: Response) => {
  try {
    const { name, description, isRoot, displayOrder, page } = req.body;

    const pageElement = new PageElement({
      name,
      description,
      isRoot,
      displayOrder,
      page
    });

    await pageElement.save();

    res.status(201).json({ pageElement });
  } catch (error) {
    logger.error('Error creating page element', error);
    res.status(500).json({ message: 'Error creating page element' });
  }
};

// Update page element
export const updatePageElement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, isRoot, displayOrder, page } = req.body;

    const pageElement = await PageElement.findByIdAndUpdate(
      id,
      {
        name,
        description,
        isRoot,
        displayOrder,
        page
      },
      { new: true }
    );

    if (!pageElement) {
      return res.status(404).json({ message: 'Page element not found' });
    }

    res.status(200).json({ pageElement });
  } catch (error) {
    logger.error('Error updating page element', error);
    res.status(500).json({ message: 'Error updating page element' });
  }
};

// Delete page element
export const deletePageElement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const pageElement = await PageElement.findByIdAndDelete(id);

    if (!pageElement) {
      return res.status(404).json({ message: 'Page element not found' });
    }

    res.status(200).json({ message: 'Page element deleted successfully' });
  } catch (error) {
    logger.error('Error deleting page element', error);
    res.status(500).json({ message: 'Error deleting page element' });
  }
};

// Bulk delete page elements
export const bulkDeletePageElements = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Invalid page element IDs' });
    }

    await PageElement.deleteMany({ _id: { $in: ids } });

    res.status(200).json({ message: 'Page elements deleted successfully' });
  } catch (error) {
    logger.error('Error bulk deleting page elements', error);
    res.status(500).json({ message: 'Error deleting page elements' });
  }
}; 