import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { logger } from '../utils/logger.js';

// Validation middleware to check for validation errors
export const validateRequest = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const requestId = Math.random().toString(36).substring(7);
    
    try {
      logger.info('Validation started', {
        requestId,
        path: req.path,
        method: req.method,
        body: req.body
      });

      await Promise.all(
        validations.map(validation =>
          validation.run(req).catch(err => {          
            logger.info('Validation run error', {
              requestId,
              error: err.message,
              stack: err.stack
            });
            throw err; // rethrow to be caught by outer try/catch
          })
        )
      );

      const errors = validationResult(req);      
      
      if (!errors.isEmpty()) {
        logger.info('Validation failed', {
          requestId,
          errors: errors.array().map(error => ({
            field: error.type,
            message: error.msg,
          }))
        });
        return res.status(400).json({
          message: 'Validation error',
          errors: errors.array().map(error => ({
            field: error.type,
            message: error.msg,
          })),
        });
      }

      logger.info('Validation passed', {
        requestId,
        path: req.path
      });
      
      // Only call next() if validation passes
      next();
    } catch (error) {
      logger.error('Validation middleware error', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      return res.status(500).json({ message: 'Internal server error during validation' });
    }
  };
};