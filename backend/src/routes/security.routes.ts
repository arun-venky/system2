import express from 'express';
import { body, query } from 'express-validator';
import {
  getAuditLogs,
  getSecuritySettings,
  updateSecuritySettings,
  // getActiveSessions,
  // revokeSession,
  // revokeAllSessions,
  // getIpWhitelist,
  // addIpToWhitelist,
  // removeIpFromWhitelist,
  // setupMfa,
  // verifyMfa,
  // disableMfa,
  // getMfaStatus
} from '../controllers/security.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { isAdmin } from '../middleware/rbac.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';

export const securityRoutes = express.Router();

// Get audit logs (Admin only)
securityRoutes.get(
  '/logs',
  verifyToken,
  isAdmin,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 10, max: 100 }),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('userId').optional().isMongoId(),
    query('action').optional(),
    query('resource').optional(),
    query('ipAddress').optional().isIP()
  ],
  validateRequest,
  getAuditLogs
);

// Get security settings (Admin only)
securityRoutes.get(
  '/settings',
  verifyToken,
  isAdmin,
  getSecuritySettings
);

// Update security settings (Admin only)
securityRoutes.put(
  '/settings',
  verifyToken,
  isAdmin,
  [
    body('jwtExpiration').optional().isString(),
    body('refreshTokenExpiration').optional().isString(),
    body('passwordStrengthRegex').optional().isString()
  ],
  validateRequest,
  updateSecuritySettings
);

// // Session Management Routes
// securityRoutes.get(
//   '/sessions',
//   verifyToken,
//   getActiveSessions
// );

// securityRoutes.delete(
//   '/sessions/:sessionId',
//   verifyToken,
//   [
//     body('sessionId').notEmpty().withMessage('Session ID is required')
//   ],
//   validateRequest,
//   revokeSession
// );

// securityRoutes.delete(
//   '/sessions',
//   verifyToken,
//   revokeAllSessions
// );

// // IP Whitelist Routes (Admin only)
// securityRoutes.get(
//   '/ip-whitelist',
//   verifyToken,
//   isAdmin,
//   getIpWhitelist
// );

// securityRoutes.post(
//   '/ip-whitelist',
//   verifyToken,
//   isAdmin,
//   [
//     body('ip').isIP().withMessage('Must be a valid IP address'),
//     body('description').optional().trim()
//   ],
//   validateRequest,
//   addIpToWhitelist
// );

// securityRoutes.delete(
//   '/ip-whitelist/:ip',
//   verifyToken,
//   isAdmin,
//   [
//     body('ip').isIP().withMessage('Must be a valid IP address')
//   ],
//   validateRequest,
//   removeIpFromWhitelist
// );

// // MFA Routes
// securityRoutes.get(
//   '/mfa/status',
//   verifyToken,
//   getMfaStatus
// );

// securityRoutes.post(
//   '/mfa/setup',
//   verifyToken,
//   [
//     body('method').isIn(['authenticator', 'sms', 'email']).withMessage('Invalid MFA method')
//   ],
//   validateRequest,
//   setupMfa
// );

// securityRoutes.post(
//   '/mfa/verify',
//   verifyToken,
//   [
//     body('code').isLength({ min: 6, max: 6 }).withMessage('Invalid verification code')
//   ],
//   validateRequest,
//   verifyMfa
// );

// securityRoutes.delete(
//   '/mfa',
//   verifyToken,
//   [
//     body('code').isLength({ min: 6, max: 6 }).withMessage('Invalid verification code')
//   ],
//   validateRequest,
//   disableMfa
// );