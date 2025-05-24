import { Request, Response, NextFunction } from 'express';
import { ValidationError } from 'express-validator';
import { logger } from '../utils/logger.js';

// Custom error interface
export interface IError extends Error {
  status?: number;
  errors?: ValidationError[];
}

// Error handler middleware
export const errorHandler = (err: IError, req: Request, res: Response, next: NextFunction) => {
  const requestId = Math.random().toString(36).substring(7);

  // Log the error
  logger.error('Error occurred', {
    requestId,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    headers: req.headers,
    timestamp: new Date().toISOString()
  });

  // Set default status code
  const statusCode = err.status || 500;
  
  // Prepare response
  const response = {
    message: statusCode === 500 ? 'Internal server error' : err.message,
    errors: err.errors || undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  };
  
  // Send response
  res.status(statusCode).json(response);
};

// 404 handler middleware
export const notFoundHandler = (req: Request, res: Response) => {
  logger.warn('Route not found', {
    method: req.method,
    url: req.originalUrl,
    headers: req.headers,
    body: req.body,
    query: req.query,
    timestamp: new Date().toISOString()
  });
  res.status(404).json({ 
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString()
  });
};