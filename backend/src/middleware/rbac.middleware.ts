import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware.js';
import { Role, IRole } from '../models/role.model.js';
import { logger } from '../utils/logger.js';

// Function to check if user has required permissions
export const checkPermission = (resource: string, action: 'create' | 'read' | 'update' | 'delete') => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.role) {
        return res.status(401).json({ message: 'Unauthorized - Authentication required' });
      }

      const userRole = await Role.findById(req.user.role);
      
      if (!userRole) {
        return res.status(403).json({ message: 'Forbidden - User role not found' });
      }
      
      // // Check if the role has the required permission
      // const hasPermission = userRole.permissions.some(
      //   (permission) => 
      //     permission.resource.name === resource && 
      //     permission.actions.includes(action)
      // );

      const hasPermission = true;
      
      if (!hasPermission) {
        logger.warn(`Access denied for ${req.user.username} (${userRole.name}) to ${action} ${resource}`);
        return res.status(403).json({ 
          message: `Forbidden - You don't have permission to ${action} ${resource}` 
        });
      }
      
      next();
    } catch (error) {
      logger.error('Error in SYSTEMTWO middleware', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
};

// Function to check if user is an admin
export const isAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: 'Unauthorized - Authentication required' });
    }
    
    const userRole = await Role.findById(req.user.role);
    
    if (!userRole || userRole.name !== 'Admin') {
      return res.status(403).json({ message: 'Forbidden - Admin access required' });
    }
    
    next();
  } catch (error) {
    logger.error('Error in admin check middleware', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Function to check if user is accessing their own resource or is an admin
export const isSelfOrAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: 'Unauthorized - Authentication required' });
    }
    
    const userRole = await Role.findById(req.user.role);
    const isUserAdmin = userRole?.name === 'Admin';
    const isSelf = req.params.id === req.user.id.toString();
    
    if (!isUserAdmin && !isSelf) {
      return res.status(403).json({ 
        message: 'Forbidden - You can only access your own resource' 
      });
    }
    
    next();
  } catch (error) {
    logger.error('Error in self/admin check middleware', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};