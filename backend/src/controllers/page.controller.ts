import { Request, Response } from 'express';
import { Page, IPage, IPageVersion } from '../models/page.model.js';
import { AuditLog } from '../models/audit-log.model.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { logger, logAudit } from '../utils/logger.js';
import { Types } from 'mongoose';

// Get all pages controller
export const getAllPages = async (req: Request, res: Response) => {
  try {
    const pages = await Page.find({}).populate('roles', 'name');
    
    res.status(200).json({
      count: pages.length,
      pages,
    });
  } catch (error) {
    logger.error('Error getting pages', error);
    res.status(500).json({ message: 'Error retrieving pages' });
  }
};

// Get page by ID controller
export const getPageById = async (req: Request, res: Response) => {
  try {
    const pageId = req.params.id;
    
    const page = await Page.findById(pageId).populate('roles', 'name');
    
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }
    
    res.status(200).json(page);
  } catch (error) {
    logger.error(`Error getting page ${req.params.id}`, error);
    res.status(500).json({ message: 'Error retrieving page' });
  }
};

// Get page by slug controller
export const getPageBySlug = async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug;
    
    const page = await Page.findOne({ slug }).populate('roles', 'name');
    
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }
    
    res.status(200).json(page);
  } catch (error) {
    logger.error(`Error getting page with slug ${req.params.slug}`, error);
    res.status(500).json({ message: 'Error retrieving page' });
  }
};

// Create page controller
export const createPage = async (req: AuthRequest, res: Response) => {
  try {
    const { title, slug, content, roles } = req.body;
    
    // Check if page with same slug already exists
    const existingPage = await Page.findOne({ slug });
    
    if (existingPage) {
      return res.status(400).json({ 
        message: 'Page with this slug already exists' 
      });
    }
    
    // Create new page
    const page = new Page({
      title,
      slug,
      content,
      roles: roles || [],
    });
    
    await page.save();
    
    // Log the create action
    await AuditLog.create({
      userId: req.user?._id,
      action: 'create',
      resource: 'pages',
      details: `Page ${page.title} was created`,
    });
    
    logAudit(
      req.user?._id?.toString() || 'system',
      'create',
      'pages',
      `Page ${page.title} was created`
    );
    
    res.status(201).json({
      message: 'Page created successfully',
      page,
    });
  } catch (error) {
    logger.error('Error creating page', error);
    res.status(500).json({ message: 'Error creating page' });
  }
};

// Update page controller
export const updatePage = async (req: AuthRequest, res: Response) => {
  try {
    const pageId = req.params.id;
    const updates = req.body;
    
    // Find and update page
    const page = await Page.findByIdAndUpdate(
      pageId,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('roles', 'name');
    
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }
    
    // Log the update action
    await AuditLog.create({
      userId: req.user?._id,
      action: 'update',
      resource: 'pages',
      details: `Page ${page.title} was updated`,
    });
    
    logAudit(
      req.user?._id?.toString() || 'system',
      'update',
      'pages',
      `Page ${page.title} was updated`
    );
    
    res.status(200).json({
      message: 'Page updated successfully',
      page,
    });
  } catch (error) {
    logger.error(`Error updating page ${req.params.id}`, error);
    res.status(500).json({ message: 'Error updating page' });
  }
};

// Delete page controller
export const deletePage = async (req: AuthRequest, res: Response) => {
  try {
    const pageId = req.params.id;
    
    const page = await Page.findByIdAndDelete(pageId);
    
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }
    
    // Log the delete action
    await AuditLog.create({
      userId: req.user?._id,
      action: 'delete',
      resource: 'pages',
      details: `Page ${page.title} was deleted`,
    });
    
    logAudit(
      req.user?._id?.toString() || 'system',
      'delete',
      'pages',
      `Page ${page.title} was deleted`
    );
    
    res.status(200).json({
      message: 'Page deleted successfully',
    });
  } catch (error) {
    logger.error(`Error deleting page ${req.params.id}`, error);
    res.status(500).json({ message: 'Error deleting page' });
  }
};

// Manage pages controller (bulk operations)
export const managePages = async (req: AuthRequest, res: Response) => {
  try {
    const { operations } = req.body;
    
    if (!Array.isArray(operations)) {
      return res.status(400).json({ 
        message: 'Operations must be an array' 
      });
    }
    
    const results = [];
    
    for (const op of operations) {
      const { action, pageId, data } = op;
      
      switch (action) {
        case 'create':
          // Check if page with same slug already exists
          const existingPage = await Page.findOne({ slug: data.slug });
          if (existingPage) {
            results.push({
              action,
              success: false,
              message: 'Page with this slug already exists'
            });
            continue;
          }
          
          // Create new page
          const newPage = new Page({
            title: data.title,
            slug: data.slug,
            content: data.content,
            roles: data.roles || [],
          });
          await newPage.save();
          
          results.push({
            action,
            success: true,
            page: newPage
          });
          break;
          
        case 'update':
          const pageToUpdate = await Page.findById(pageId);
          if (!pageToUpdate) {
            results.push({
              action,
              success: false,
              message: 'Page not found'
            });
            continue;
          }
          
          // If slug is being updated, check for duplicates
          if (data.slug && data.slug !== pageToUpdate.slug) {
            const slugExists = await Page.findOne({ slug: data.slug });
            if (slugExists) {
              results.push({
                action,
                success: false,
                message: 'Page with this slug already exists'
              });
              continue;
            }
          }
          
          // Update page
          Object.assign(pageToUpdate, data);
          await pageToUpdate.save();
          
          results.push({
            action,
            success: true,
            page: pageToUpdate
          });
          break;
          
        case 'delete':
          const pageToDelete = await Page.findByIdAndDelete(pageId);
          if (!pageToDelete) {
            results.push({
              action,
              success: false,
              message: 'Page not found'
            });
            continue;
          }
          
          results.push({
            action,
            success: true
          });
          break;
          
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
      resource: 'pages',
      details: `Bulk page operations performed: ${operations.length} operations`,
    });
    
    logAudit(
      req.user?._id?.toString() || 'system',
      'manage',
      'pages',
      `Bulk page operations performed: ${operations.length} operations`
    );
    
    res.status(200).json({
      message: 'Bulk operations completed',
      results
    });
  } catch (error) {
    logger.error('Error managing pages', error);
    res.status(500).json({ message: 'Error performing bulk operations' });
  }
};

// Publish page controller
export const publishPage = async (req: AuthRequest, res: Response) => {
  try {
    const pageId = req.params.id;
    
    const page = await Page.findById(pageId);
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }
    
    // Create a new version before publishing
    const version: IPageVersion = {
      content: page.content,
      publishedAt: new Date(),
      publishedBy: new Types.ObjectId(req.user?._id?.toString() || ''),
    };
    
    page.versions = page.versions || [];
    page.versions.push(version);
    page.isPublished = true;
    page.publishedAt = new Date();
    page.publishedBy = new Types.ObjectId(req.user?._id?.toString() || '');
    await page.save();
    
    // Log the action
    await AuditLog.create({
      userId: req.user?._id,
      action: 'publish',
      resource: 'pages',
      details: `Page ${page.title} was published`,
    });
    
    logAudit(
      req.user?._id?.toString() || 'system',
      'publish',
      'pages',
      `Page ${page.title} was published`
    );
    
    res.status(200).json({
      message: 'Page published successfully',
      page,
    });
  } catch (error) {
    logger.error(`Error publishing page ${req.params.id}`, error);
    res.status(500).json({ message: 'Error publishing page' });
  }
};

// Unpublish page controller
export const unpublishPage = async (req: AuthRequest, res: Response) => {
  try {
    const pageId = req.params.id;
    
    const page = await Page.findById(pageId);
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }
    
    page.isPublished = false;
    page.unpublishedAt = new Date();
    page.unpublishedBy = req.user?._id ? new Types.ObjectId(req.user._id.toString()) : undefined;
    
    await page.save();
    
    // Log the action
    await AuditLog.create({
      userId: req.user?._id,
      action: 'unpublish',
      resource: 'pages',
      details: `Page ${page.title} was unpublished`,
    });
    
    logAudit(
      req.user?._id?.toString() || 'system',
      'unpublish',
      'pages',
      `Page ${page.title} was unpublished`
    );
    
    res.status(200).json({
      message: 'Page unpublished successfully',
      page,
    });
  } catch (error) {
    logger.error(`Error unpublishing page ${req.params.id}`, error);
    res.status(500).json({ message: 'Error unpublishing page' });
  }
};

// Get page versions controller
export const getPageVersions = async (req: AuthRequest, res: Response) => {
  try {
    const pageId = req.params.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const pageDoc = await Page.findById(pageId);
    if (!pageDoc) {
      return res.status(404).json({ message: 'Page not found' });
    }
    
    const versions = pageDoc.versions || [];
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedVersions = versions.slice(startIndex, endIndex);
    
    res.status(200).json({
      total: versions.length,
      page,
      limit,
      versions: paginatedVersions,
    });
  } catch (error) {
    logger.error(`Error getting versions for page ${req.params.id}`, error);
    res.status(500).json({ message: 'Error retrieving page versions' });
  }
};

// Restore page version controller
export const restorePageVersion = async (req: AuthRequest, res: Response) => {
  try {
    const { id: pageId, versionId } = req.params;
    
    const page = await Page.findById(pageId);
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }
    
    const version = page.versions?.find(v => v._id?.toString() === versionId);
    if (!version) {
      return res.status(404).json({ message: 'Version not found' });
    }
    
    // Create a new version before restoring
    const newVersion: IPageVersion = {
      content: page.content,
      publishedAt: new Date(),
      publishedBy: new Types.ObjectId(req.user?._id?.toString() || ''),
      restoredAt: new Date(),
      restoredBy: new Types.ObjectId(req.user?._id?.toString() || ''),
    };
    
    page.versions = page.versions || [];
    page.versions.push(newVersion);
    page.content = version.content;
    
    await page.save();
    
    // Log the action
    await AuditLog.create({
      userId: req.user?._id,
      action: 'restore_version',
      resource: 'pages',
      details: `Page ${page.title} version was restored`,
    });
    
    logAudit(
      req.user?._id?.toString() || 'system',
      'restore_version',
      'pages',
      `Page ${page.title} version was restored`
    );
    
    res.status(200).json({
      message: 'Page version restored successfully',
      page,
    });
  } catch (error) {
    logger.error(`Error restoring version for page ${req.params.id}`, error);
    res.status(500).json({ message: 'Error restoring page version' });
  }
};

// Get page draft controller
export const getPageDraft = async (req: AuthRequest, res: Response) => {
  try {
    const pageId = req.params.id;
    
    const page = await Page.findById(pageId);
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }
    
    res.status(200).json({
      draft: page.draft,
      lastSaved: page.draftLastSaved,
    });
  } catch (error) {
    logger.error(`Error getting draft for page ${req.params.id}`, error);
    res.status(500).json({ message: 'Error retrieving page draft' });
  }
};

// Save page draft controller
export const savePageDraft = async (req: AuthRequest, res: Response) => {
  try {
    const pageId = req.params.id;
    const { content } = req.body;
    
    const page = await Page.findById(pageId);
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }
    
    page.draft = content;
    page.draftLastSaved = new Date();
    page.draftSavedBy = req.user?._id ? new Types.ObjectId(req.user._id.toString()) : undefined;
    
    await page.save();
    
    // Log the action
    await AuditLog.create({
      userId: req.user?._id,
      action: 'save_draft',
      resource: 'pages',
      details: `Draft saved for page ${page.title}`,
    });
    
    logAudit(
      req.user?._id?.toString() || 'system',
      'save_draft',
      'pages',
      `Draft saved for page ${page.title}`
    );
    
    res.status(200).json({
      message: 'Draft saved successfully',
      lastSaved: page.draftLastSaved,
    });
  } catch (error) {
    logger.error(`Error saving draft for page ${req.params.id}`, error);
    res.status(500).json({ message: 'Error saving page draft' });
  }
};

// Delete page draft controller
export const deletePageDraft = async (req: AuthRequest, res: Response) => {
  try {
    const pageId = req.params.id;
    
    const page = await Page.findById(pageId);
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }
    
    page.draft = undefined;
    page.draftLastSaved = undefined;
    page.draftSavedBy = undefined;
    
    await page.save();
    
    // Log the action
    await AuditLog.create({
      userId: req.user?._id,
      action: 'delete_draft',
      resource: 'pages',
      details: `Draft deleted for page ${page.title}`,
    });
    
    logAudit(
      req.user?._id?.toString() || 'system',
      'delete_draft',
      'pages',
      `Draft deleted for page ${page.title}`
    );
    
    res.status(200).json({
      message: 'Draft deleted successfully',
    });
  } catch (error) {
    logger.error(`Error deleting draft for page ${req.params.id}`, error);
    res.status(500).json({ message: 'Error deleting page draft' });
  }
};

// Duplicate page controller
export const duplicatePage = async (req: AuthRequest, res: Response) => {
  try {
    const pageId = req.params.id;
    const { title, slug } = req.body;
    
    const originalPage = await Page.findById(pageId);
    if (!originalPage) {
      return res.status(404).json({ message: 'Page not found' });
    }
    
    // Check if new slug already exists
    const existingPage = await Page.findOne({ slug });
    if (existingPage) {
      return res.status(400).json({ message: 'Page with this slug already exists' });
    }
    
    // Create new page with same content
    const newPage = new Page({
      title,
      slug,
      content: originalPage.content,
      roles: originalPage.roles,
      parentId: originalPage.parentId,
      order: originalPage.order,
    });
    
    await newPage.save();
    
    // Log the action
    await AuditLog.create({
      userId: req.user?._id,
      action: 'duplicate',
      resource: 'pages',
      details: `Page ${originalPage.title} was duplicated as ${title}`,
    });
    
    logAudit(
      req.user?._id?.toString() || 'system',
      'duplicate',
      'pages',
      `Page ${originalPage.title} was duplicated as ${title}`
    );
    
    res.status(201).json({
      message: 'Page duplicated successfully',
      page: newPage,
    });
  } catch (error) {
    logger.error(`Error duplicating page ${req.params.id}`, error);
    res.status(500).json({ message: 'Error duplicating page' });
  }
};

// Move page controller
export const movePage = async (req: AuthRequest, res: Response) => {
  try {
    const pageId = req.params.id;
    const { parentId, order } = req.body;
    
    const page = await Page.findById(pageId);
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }
    
    // If parentId is provided, verify it exists
    if (parentId) {
      const parentPage = await Page.findById(parentId);
      if (!parentPage) {
        return res.status(404).json({ message: 'Parent page not found' });
      }
    }
    
    // Update page position
    page.parentId = parentId;
    page.order = order;
    
    await page.save();
    
    // Log the action
    await AuditLog.create({
      userId: req.user?._id,
      action: 'move',
      resource: 'pages',
      details: `Page ${page.title} was moved`,
    });
    
    logAudit(
      req.user?._id?.toString() || 'system',
      'move',
      'pages',
      `Page ${page.title} was moved`
    );
    
    res.status(200).json({
      message: 'Page moved successfully',
      page,
    });
  } catch (error) {
    logger.error(`Error moving page ${req.params.id}`, error);
    res.status(500).json({ message: 'Error moving page' });
  }
};

// Get page tree controller
export const getPageTree = async (req: Request, res: Response) => {
  try {
    const pages = await Page.find({})
      .select('title slug parentId order')
      .sort('order');
    
    // Build tree structure
    const pageMap = new Map<string, any>();
    const tree: any[] = [];
    
    // First pass: create map of all pages
    pages.forEach(page => {
      const pageId = (page as any)._id.toString();
      pageMap.set(pageId, {
        ...page.toObject(),
        children: [],
      });
    });
    
    // Second pass: build tree
    pages.forEach(page => {
      const pageId = (page as any)._id.toString();
      const pageObj = pageMap.get(pageId);
      if (page.parentId) {
        const parentId = page.parentId.toString();
        const parent = pageMap.get(parentId);
        if (parent) {
          parent.children.push(pageObj);
        }
      } else {
        tree.push(pageObj);
      }
    });
    
    res.status(200).json(tree);
  } catch (error) {
    logger.error('Error getting page tree', error);
    res.status(500).json({ message: 'Error retrieving page tree' });
  }
};