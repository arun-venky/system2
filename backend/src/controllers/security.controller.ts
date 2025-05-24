import { Request, Response } from 'express';
import { AuditLog } from '../models/audit-log.model.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { logger, logAudit } from '../utils/logger.js';

// Define types for security settings
type SecuritySection = 'passwordPolicy' | 'sessionPolicy' | 'mfaPolicy' | 'ipWhitelist';

interface SecuritySettings {
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    maxAge: number;
  };
  sessionPolicy: {
    maxConcurrentSessions: number;
    sessionTimeout: number;
    requireReauth: boolean;
  };
  mfaPolicy: {
    enabled: boolean;
    methods: string[];
    required: boolean;
  };
  ipWhitelist: {
    enabled: boolean;
    ips: string[];
  };
}

// Get audit logs controller
export const getAuditLogs = async (req: Request, res: Response) => {
  const requestId = Math.random().toString(36).substring(7);
  try {    
    logger.info('getAuditLogs controller started', {
      requestId,
      body: req.body,
      timestamp: new Date().toISOString()
    });
    
    const {
      page = 1,
      limit = 10,
      startDate,
      endDate,
      userId,
      action,
      resource,
      ipAddress
    } = req.query;

    // Build query
    const query: any = {};
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = new Date(startDate as string);
      }
      if (endDate) {
        query.timestamp.$lte = new Date(endDate as string);
      }
    }

    if (userId) {
      query.userId = userId;
    }

    if (action) {
      query.action = action;
    }

    if (resource) {
      query.resource = resource;
    }

    if (ipAddress) {
      query.ipAddress = ipAddress;
    }

    // Calculate skip value for pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Get total count
    const totalCount = await AuditLog.countDocuments(query);

    // Get logs with pagination and sorting
    const logs = await AuditLog.find(query)
      .populate('userId', 'username')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    res.status(200).json({
      count: totalCount,
      logs,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(totalCount / Number(limit))
    });
  } catch (error) {
    logger.error('Error getting audit logs', error);
    res.status(500).json({ message: 'Error retrieving audit logs' });
  }
};

// Get security settings controller
export const getSecuritySettings = async (req: Request, res: Response) => {
  try {
    // In a real application, these would be stored in a database
    // For now, we'll return some default settings
    const settings = {
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        maxAge: 90, // days
      },
      sessionPolicy: {
        maxConcurrentSessions: 1,
        sessionTimeout: 30, // minutes
        requireReauth: true,
      },
      mfaPolicy: {
        enabled: false,
        methods: ['email', 'authenticator'],
        required: false,
      },
      ipWhitelist: {
        enabled: false,
        ips: [],
      },
    };
    
    res.status(200).json(settings);
  } catch (error) {
    logger.error('Error getting security settings', error);
    res.status(500).json({ message: 'Error retrieving security settings' });
  }
};

// Update security settings controller
export const updateSecuritySettings = async (req: AuthRequest, res: Response) => {
  try {
    const updates = req.body;
    
    // In a real application, these would be stored in a database
    // For now, we'll just validate the input
    const validSettings = {
      passwordPolicy: {
        minLength: updates.passwordPolicy?.minLength || 8,
        requireUppercase: updates.passwordPolicy?.requireUppercase ?? true,
        requireLowercase: updates.passwordPolicy?.requireLowercase ?? true,
        requireNumbers: updates.passwordPolicy?.requireNumbers ?? true,
        requireSpecialChars: updates.passwordPolicy?.requireSpecialChars ?? true,
        maxAge: updates.passwordPolicy?.maxAge || 90,
      },
      sessionPolicy: {
        maxConcurrentSessions: updates.sessionPolicy?.maxConcurrentSessions || 1,
        sessionTimeout: updates.sessionPolicy?.sessionTimeout || 30,
        requireReauth: updates.sessionPolicy?.requireReauth ?? true,
      },
      mfaPolicy: {
        enabled: updates.mfaPolicy?.enabled ?? false,
        methods: updates.mfaPolicy?.methods || ['email', 'authenticator'],
        required: updates.mfaPolicy?.required ?? false,
      },
      ipWhitelist: {
        enabled: updates.ipWhitelist?.enabled ?? false,
        ips: updates.ipWhitelist?.ips || [],
      },
    };
    
    // Log the update action
    await AuditLog.create({
      userId: req.user?._id,
      action: 'update',
      resource: 'security',
      details: 'Security settings were updated',
    });
    
    logAudit(
      req.user?._id?.toString() || 'system',
      'update',
      'security',
      'Security settings were updated'
    );
    
    res.status(200).json({
      message: 'Security settings updated successfully',
      settings: validSettings,
    });
  } catch (error) {
    logger.error('Error updating security settings', error);
    res.status(500).json({ message: 'Error updating security settings' });
  }
};

// Manage security settings controller (bulk operations)
export const manageSecuritySettings = async (req: AuthRequest, res: Response) => {
  try {
    const { operations } = req.body;
    
    if (!Array.isArray(operations)) {
      return res.status(400).json({ 
        message: 'Operations must be an array' 
      });
    }
    
    const results = [];
    const currentSettings: SecuritySettings = {
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        maxAge: 90,
      },
      sessionPolicy: {
        maxConcurrentSessions: 1,
        sessionTimeout: 30,
        requireReauth: true,
      },
      mfaPolicy: {
        enabled: false,
        methods: ['email', 'authenticator'],
        required: false,
      },
      ipWhitelist: {
        enabled: false,
        ips: [],
      },
    };
    
    for (const op of operations) {
      const { action, section, data } = op as { 
        action: 'update' | 'reset'; 
        section: SecuritySection; 
        data?: any;
      };
      
      switch (action) {
        case 'update':
          if (!currentSettings[section]) {
            results.push({
              action,
              section,
              success: false,
              message: 'Invalid section'
            });
            continue;
          }
          
          // Validate and update settings
          switch (section) {
            case 'passwordPolicy': {
              const policyData = data as Partial<SecuritySettings['passwordPolicy']>;
              if (policyData?.minLength && policyData.minLength < 6) {
                results.push({
                  action,
                  section,
                  success: false,
                  message: 'Minimum password length must be at least 6'
                });
                continue;
              }
              if (policyData?.maxAge && policyData.maxAge < 30) {
                results.push({
                  action,
                  section,
                  success: false,
                  message: 'Maximum password age must be at least 30 days'
                });
                continue;
              }
              Object.assign(currentSettings.passwordPolicy, policyData);
              break;
            }
              
            case 'sessionPolicy': {
              const policyData = data as Partial<SecuritySettings['sessionPolicy']>;
              if (policyData?.maxConcurrentSessions && policyData.maxConcurrentSessions < 1) {
                results.push({
                  action,
                  section,
                  success: false,
                  message: 'Maximum concurrent sessions must be at least 1'
                });
                continue;
              }
              if (policyData?.sessionTimeout && policyData.sessionTimeout < 5) {
                results.push({
                  action,
                  section,
                  success: false,
                  message: 'Session timeout must be at least 5 minutes'
                });
                continue;
              }
              Object.assign(currentSettings.sessionPolicy, policyData);
              break;
            }
              
            case 'mfaPolicy': {
              const policyData = data as Partial<SecuritySettings['mfaPolicy']>;
              if (policyData?.methods && !Array.isArray(policyData.methods)) {
                results.push({
                  action,
                  section,
                  success: false,
                  message: 'MFA methods must be an array'
                });
                continue;
              }
              Object.assign(currentSettings.mfaPolicy, policyData);
              break;
            }
              
            case 'ipWhitelist': {
              const policyData = data as Partial<SecuritySettings['ipWhitelist']>;
              if (policyData?.ips && !Array.isArray(policyData.ips)) {
                results.push({
                  action,
                  section,
                  success: false,
                  message: 'IP whitelist must be an array'
                });
                continue;
              }
              Object.assign(currentSettings.ipWhitelist, policyData);
              break;
            }
          }
          
          results.push({
            action,
            section,
            success: true,
            settings: currentSettings[section]
          });
          break;
          
        case 'reset':
          if (!currentSettings[section]) {
            results.push({
              action,
              section,
              success: false,
              message: 'Invalid section'
            });
            continue;
          }
          
          // Reset section to defaults
          switch (section) {
            case 'passwordPolicy':
              currentSettings.passwordPolicy = {
                minLength: 8,
                requireUppercase: true,
                requireLowercase: true,
                requireNumbers: true,
                requireSpecialChars: true,
                maxAge: 90,
              };
              break;
              
            case 'sessionPolicy':
              currentSettings.sessionPolicy = {
                maxConcurrentSessions: 1,
                sessionTimeout: 30,
                requireReauth: true,
              };
              break;
              
            case 'mfaPolicy':
              currentSettings.mfaPolicy = {
                enabled: false,
                methods: ['email', 'authenticator'],
                required: false,
              };
              break;
              
            case 'ipWhitelist':
              currentSettings.ipWhitelist = {
                enabled: false,
                ips: [],
              };
              break;
          }
          
          results.push({
            action,
            section,
            success: true,
            settings: currentSettings[section]
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
      resource: 'security',
      details: `Bulk security operations performed: ${operations.length} operations`,
    });
    
    logAudit(
      req.user?._id?.toString() || 'system',
      'manage',
      'security',
      `Bulk security operations performed: ${operations.length} operations`
    );
    
    res.status(200).json({
      message: 'Bulk operations completed',
      results,
      currentSettings
    });
  } catch (error) {
    logger.error('Error managing security settings', error);
    res.status(500).json({ message: 'Error performing bulk operations' });
  }
};
