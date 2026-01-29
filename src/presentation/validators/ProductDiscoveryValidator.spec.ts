import { ProductDiscoveryRequestSchema } from './ProductDiscoveryValidator';
import { ZodError } from 'zod';

describe('ProductDiscoveryValidator', () => {
  describe('ProductDiscoveryRequestSchema', () => {
    it('should validate valid request', () => {
      const validRequest = {
        problem: 'This is a valid problem description with sufficient length'
      };

      const result = ProductDiscoveryRequestSchema.parse(validRequest);

      expect(result).toEqual(validRequest);
    });

    it('should trim whitespace', () => {
      const request = {
        problem: '  This is a problem with whitespace  '
      };

      const result = ProductDiscoveryRequestSchema.parse(request);

      expect(result.problem).toBe('This is a problem with whitespace');
    });

    it('should reject empty problem', () => {
      const invalidRequest = {
        problem: ''
      };

      expect(() => ProductDiscoveryRequestSchema.parse(invalidRequest))
        .toThrow(ZodError);
    });

    it('should reject problem shorter than 10 characters', () => {
      const invalidRequest = {
        problem: 'Short'
      };

      expect(() => ProductDiscoveryRequestSchema.parse(invalidRequest))
        .toThrow(ZodError);
    });

    it('should reject problem longer than 5000 characters', () => {
      const invalidRequest = {
        problem: 'a'.repeat(5001)
      };

      expect(() => ProductDiscoveryRequestSchema.parse(invalidRequest))
        .toThrow(ZodError);
    });

    it('should provide detailed error messages', () => {
      const invalidRequest = {
        problem: 'Short'
      };

      try {
        ProductDiscoveryRequestSchema.parse(invalidRequest);
      } catch (error) {
        expect(error).toBeInstanceOf(ZodError);
        const zodError = error as ZodError;
        expect(zodError.errors[0].message).toContain('at least 10 characters');
      }
    });

    it('should accept problem at minimum length', () => {
      const validRequest = {
        problem: '1234567890' // exactly 10 characters
      };

      const result = ProductDiscoveryRequestSchema.parse(validRequest);

      expect(result.problem).toBe('1234567890');
    });

    it('should accept problem at maximum length', () => {
      const validRequest = {
        problem: 'a'.repeat(5000)
      };

      const result = ProductDiscoveryRequestSchema.parse(validRequest);

      expect(result.problem).toHaveLength(5000);
    });

    it('should handle special characters', () => {
      const validRequest = {
        problem: 'Problem with special chars: @#$%^&*()_+-=[]{}|;:,.<>?/'
      };

      const result = ProductDiscoveryRequestSchema.parse(validRequest);

      expect(result).toEqual(validRequest);
    });

    it('should handle multi-line text', () => {
      const validRequest = {
        problem: `This is a multi-line
        problem description
        that should be accepted`
      };

      const result = ProductDiscoveryRequestSchema.parse(validRequest);

      expect(result.problem).toContain('multi-line');
    });

    it('should handle unicode characters', () => {
      const validRequest = {
        problem: 'Problema com caracteres especiais: áéíóú ñ ç 中文 日本語'
      };

      const result = ProductDiscoveryRequestSchema.parse(validRequest);

      expect(result.problem).toContain('caracteres');
    });
  });
});
