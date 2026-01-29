import {
  ValidationError,
  AIProviderError,
  BusinessError
} from '../CustomErrors';

describe('CustomErrors', () => {
  describe('ValidationError', () => {
    it('should create ValidationError with message', () => {
      const error = new ValidationError('Invalid input');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toBe('Invalid input');
      expect(error.name).toBe('ValidationError');
    });

    it('should be catchable as Error', () => {
      try {
        throw new ValidationError('Test error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(ValidationError);
      }
    });
  });

  describe('AIProviderError', () => {
    it('should create AIProviderError with message', () => {
      const error = new AIProviderError('AI service failed');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AIProviderError);
      expect(error.message).toBe('AI service failed');
      expect(error.name).toBe('AIProviderError');
    });

    it('should be catchable as Error', () => {
      try {
        throw new AIProviderError('Test error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(AIProviderError);
      }
    });
  });

  describe('BusinessError', () => {
    it('should create BusinessError with message', () => {
      const error = new BusinessError('Business rule violated');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(BusinessError);
      expect(error.message).toBe('Business rule violated');
      expect(error.name).toBe('BusinessError');
    });

    it('should be catchable as Error', () => {
      try {
        throw new BusinessError('Test error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(BusinessError);
      }
    });

    it('should preserve stack trace', () => {
      const error = new BusinessError('Stack trace test');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('BusinessError');
      expect(error.stack).toContain('Stack trace test');
    });
  });
});
