import express from 'express';
import { body } from 'express-validator';
import { 
  signup, 
  login, 
  refreshToken, 
  logout,
  requestPasswordReset,
  resetPassword,  
  verifyEmail,
  resendVerificationEmail,
  changePassword,
  updateProfile,
  verify
} from '../controllers/auth.controller.js';
import { verifyToken, verifyRefreshToken } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import { logger } from '../utils/logger.js';

export const authRoutes = express.Router();

// Logging middleware for auth routes
authRoutes.use((req, res, next) => {
  logger.info('Auth route accessed', {
    method: req.method,
    path: req.path,
    body: req.body,
    headers: {
      'content-type': req.headers['content-type'],
      'user-agent': req.headers['user-agent']
    },
    ip: req.ip
  });
  next();
});

// Public routes
// Login route with validation
authRoutes.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Must be a valid email address')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],
  (req: { body: any; }, res: any, next: () => void) => {
    logger.info('Login validation middleware', {
      body: req.body,
      //validationErrors: req.validationErrors
    });
    next();
  },
  //validateRequest,
  (req: { body: any; }, res: any, next: () => void) => {
    logger.info('Login controller about to be called', {
      body: req.body
    });
    next();
  },
  login
);

// Signup route with validation
authRoutes.post(
  '/signup',
  [
    body('username')
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters'),
    body('email')
      .isEmail()
      .withMessage('Must be a valid email address')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),    
  ],
  validateRequest,
  signup
);

// Logout route
authRoutes.post('/logout', logout);

// Protected routes
// verify token route
authRoutes.post('/verify', verify);

// Refresh token route
authRoutes.post('/refresh', verifyRefreshToken, refreshToken);

// Password reset routes
authRoutes.post(
  '/forgot-password',
  [
    body('email')
      .isEmail()
      .withMessage('Must be a valid email address')
      .normalizeEmail(),    
  ],
  validateRequest,
  requestPasswordReset
);

// Reset password with token
authRoutes.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),    
  ],
  validateRequest,
  resetPassword
);

// Change password (authenticated)
authRoutes.post(
  '/change-password',
  verifyToken,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters')
  ],
  validateRequest,
  changePassword
);

// Update profile (authenticated)
authRoutes.put(
  '/profile',
  verifyToken,
  [
    body('username')
      .optional()
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters'),
    body('email')
      .optional()
      .isEmail()
      .withMessage('Must be a valid email address')
      .normalizeEmail()
  ],
  validateRequest,
  updateProfile
);

// Email verification routes
// Verify email with token
authRoutes.get(
  '/verify-email',
  [
    body('token').notEmpty().withMessage('Verification token is required'),    
  ],
  validateRequest,
  verifyEmail
);

// Resend verification email
authRoutes.post(
  '/resend-verification-email',
  [
    body('email')
      .isEmail()
      .withMessage('Must be a valid email address')
      .normalizeEmail()
  ],
  validateRequest,
  resendVerificationEmail
);

export default authRoutes;

