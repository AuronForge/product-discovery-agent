import { Request, Response, NextFunction } from 'express';
import { errorHandler } from './errorHandler';
import { ZodError } from 'zod';
import { ValidationError, BusinessError, AIProviderError } from '../errors/CustomErrors';

describe('errorHandler', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    mockRequest = {
      path: '/api/test',
      method: 'POST'
    };

    mockResponse = {
      status: statusMock
    };

    mockNext = jest.fn();
  });

  describe('ZodError handling', () => {
    it('should handle ZodError with 400 status', () => {
      const zodError = new ZodError([
        {
          code: 'too_small',
          minimum: 10,
          type: 'string',
          inclusive: true,
          exact: false,
          message: 'String must contain at least 10 character(s)',
          path: ['problem']
        }
      ]);

      errorHandler(
        zodError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Validation Error',
          message: 'Invalid request data',
          details: expect.arrayContaining([
            expect.objectContaining({
              field: 'problem',
              message: 'String must contain at least 10 character(s)'
            })
          ])
        })
      );
    });

    it('should handle multiple ZodError issues', () => {
      const zodError = new ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'number',
          path: ['name'],
          message: 'Expected string, received number'
        },
        {
          code: 'too_small',
          minimum: 5,
          type: 'string',
          inclusive: true,
          exact: false,
          message: 'String must contain at least 5 character(s)',
          path: ['description']
        }
      ]);

      errorHandler(
        zodError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          details: expect.arrayContaining([
            expect.objectContaining({ field: 'name' }),
            expect.objectContaining({ field: 'description' })
          ])
        })
      );
    });
  });

  describe('ValidationError handling', () => {
    it('should handle ValidationError with 400 status', () => {
      const validationError = new ValidationError('Invalid email format');

      errorHandler(
        validationError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Validation Error',
          message: 'Invalid email format'
        })
      );
    });
  });

  describe('BusinessLogicError handling', () => {
    it('should handle BusinessError with 422 status', () => {
      const businessError = new BusinessError('Insufficient funds');

      errorHandler(
        businessError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(422);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Business Error',
          message: 'Insufficient funds'
        })
      );
    });
  });

  describe('AIProviderError handling', () => {
    it('should handle AIProviderError with 503 status', () => {
      const aiError = new AIProviderError('OpenAI API unavailable');

      errorHandler(
        aiError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(503);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Service Unavailable',
          message: 'AI provider is currently unavailable. Please try again later.'
        })
      );
    });
  });

  describe('Generic Error handling', () => {
    it('should handle generic Error with 500 status', () => {
      const genericError = new Error('Something went wrong');

      errorHandler(
        genericError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Internal Server Error',
          message: 'An unexpected error occurred. Please try again later.'
        })
      );
    });

    it('should handle error without message', () => {
      const error = new Error();

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Internal Server Error',
          message: 'An unexpected error occurred. Please try again later.'
        })
      );
    });
  });

  describe('Error context', () => {
    it('should log path and method in console', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Test error');

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error occurred:',
        expect.objectContaining({
          path: '/api/test',
          method: 'POST'
        })
      );

      consoleSpy.mockRestore();
    });

    it('should log timestamp context', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Test error');

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
