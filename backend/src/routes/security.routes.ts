import express from 'express';
import {
  getAuditLogs,
  getSecuritySettings,
  updateSecuritySettings,
} from '../controllers/security.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { checkPermission, isAdmin } from '../middleware/rbac.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import { securityValidation } from '../validations/security.validation.js';

export const securityRoutes = express.Router();

// Get audit logs (Admin only)
securityRoutes.get(
  '/logs',
  verifyToken,
  isAdmin,
  validateRequest(securityValidation.getAuditLogs),
  checkPermission('security', 'read'),
  getAuditLogs
);

// Get security settings (Admin only)
securityRoutes.get(
  '/settings',
  verifyToken,
  isAdmin,
  checkPermission('security', 'read'),
  getSecuritySettings
);

// Update security settings (Admin only)
securityRoutes.put(
  '/settings',
  verifyToken,
  isAdmin,
  checkPermission('security', 'update'),
  validateRequest(securityValidation.updateSecuritySettings),
  updateSecuritySettings
);