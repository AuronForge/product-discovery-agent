import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ValidationError, AIProviderError, BusinessError } from '../errors/CustomErrors';

/**
 * Global error handler middleware
 * Centralizes error handling following Single Responsibility Principle
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error occurred:', {
    name: error.name,
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method
  });

  // Zod validation errors
  if (error instanceof ZodError) {
    res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid request data',
      details: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
    });
    return;
  }

  // Custom validation errors
  if (error instanceof ValidationError) {
    res.status(400).json({
      error: 'Validation Error',
      message: error.message
    });
    return;
  }

  // AI Provider errors
  if (error instanceof AIProviderError) {
    res.status(503).json({
      error: 'Service Unavailable',
      message: 'AI provider is currently unavailable. Please try again later.'
    });
    return;
  }

  // Business logic errors
  if (error instanceof BusinessError) {
    res.status(422).json({
      error: 'Business Error',
      message: error.message
    });
    return;
  }

  // Generic server errors
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred. Please try again later.'
  });
};
