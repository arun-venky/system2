import winston from 'winston';

// Create a logger instance
export const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ level, message, timestamp, stack }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}${stack ? `\n${stack}` : ''}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// Create a specific logger for audit logs
export const auditLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ message, timestamp, userId, action, resource }) => {
      return `${timestamp} [AUDIT] User: ${userId}, Action: ${action}, Resource: ${resource}, Details: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/audit.log' }),
  ],
});

// Log audit events
export const logAudit = (userId: string, action: string, resource: string, details: string) => {
  auditLogger.info(details, { userId, action, resource });
};