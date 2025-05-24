import { body, param, query } from 'express-validator';

export const securityValidation = {
  getAuditLogs: [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 10, max: 100 }),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('userId').optional().isMongoId(),
    query('action').optional(),
    query('resource').optional(),
    query('ipAddress').optional().isIP()
  ],

  updateSecuritySettings: [
    body('jwtExpiration').optional().isString(),
    body('refreshTokenExpiration').optional().isString(),
    body('passwordStrengthRegex').optional().isString()
  ],

}; 