import express from 'express';
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
  verify,
  refreshSession
} from '../controllers/auth.controller.js';
import { verifyToken, verifyRefreshToken } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import { logger } from '../utils/logger.js';
import { authValidation } from '../validations/auth.validation.js';

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
  (req: { body: any; }, res: any, next: () => void) => {
    logger.info('Login validation middleware', {
      body: req.body,
      //validationErrors: req.validationErrors
    });
    next();
  },
  validateRequest(authValidation.login),
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
  validateRequest(authValidation.signUp),
  signup
);

// Logout route
authRoutes.post(
  '/logout', 
  logout
);

// Protected routes
// verify token route
authRoutes.post(
  '/verify', 
  verify
);

// Refresh token route
authRoutes.post(
  '/refresh', 
  verifyRefreshToken, 
  refreshToken
);

// Password reset routes
authRoutes.post(
  '/forgot-password',  
  validateRequest(authValidation.forgotPassword),
  requestPasswordReset
);

// Reset password with token
authRoutes.post(
  '/reset-password',  
  validateRequest(authValidation.resetPassword),
  resetPassword
);

// Change password (authenticated)
authRoutes.post(
  '/change-password',
  verifyToken, 
  validateRequest(authValidation.changePassword),
  changePassword
);

// Email verification routes
// Verify email with token
authRoutes.get(
  '/verify-email', 
  validateRequest(authValidation.verifyEmail),
  verifyEmail
);

// Resend verification email
authRoutes.post(
  '/resend-verification-email',  
  validateRequest(authValidation.resendVerificationEmail),
  resendVerificationEmail
);

// Refresh session
authRoutes.post(
  '/refresh-session',
  verifyToken,
  refreshSession
);

export default authRoutes;

