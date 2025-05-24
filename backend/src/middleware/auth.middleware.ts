import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/user.model.js';
import { logger } from '../utils/logger.js';

// Extended request interface
export interface AuthRequest extends Request {
  user?: IUser;
}

export const validateTokenInternal = async (token:string) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
    
    const user = await User.findById(decoded.id).populate('role');
    
    if (!user) {
      return null;
    }

    // Check if token matches stored token and is not expired
    if (!user.accessToken || 
        user.accessToken !== token || 
        !user.accessTokenExpiry || 
        user.accessTokenExpiry < new Date()) {
      return null;
    }
    
    return user;
  } catch (error) {
    logger.error('JWT verification failed', error);
    return null;
  }
}

// Verify JWT token middleware
export const verifyToken = async (req: AuthRequest, res: Response, next?: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized - No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    
    const user = await validateTokenInternal(token);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized - Token expired or invalid' });
    }

    req.user = user;

    if (next) {
      next();
    }
  } catch (error) {
    logger.error('Error in auth middleware', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Refresh token middleware
export const verifyRefreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token is required' });
    }
    
    try {
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string) as { id: string };
      
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid refresh token' });
      }

      // Check if refresh token matches stored token and is not expired
      if (!user.refreshToken || 
          user.refreshToken !== refreshToken || 
          !user.refreshTokenExpiry || 
          user.refreshTokenExpiry < new Date()) {
        return res.status(401).json({ message: 'Invalid or expired refresh token' });
      }
      
      req.body.userId = decoded.id;
      next();
    } catch (error) {
      logger.error('Refresh token verification failed', error);
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
  } catch (error) {
    logger.error('Error in refresh token middleware', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};