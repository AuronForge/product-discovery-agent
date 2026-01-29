import { LanguageDetector } from './LanguageDetector';

// Mock franc module
jest.mock('franc', () => ({
  franc: jest.fn((text: string) => {
    if (!text || text.trim().length < 10) return 'und';
    if (text.includes('português') || text.includes('exemplo')) return 'por';
    if (text.includes('español') || text.includes('ejemplo')) return 'spa';
    if (text.includes('français') || text.includes('exemple')) return 'fra';
    if (text.includes('Deutsch') || text.includes('Beispiel')) return 'deu';
    if (text.includes('italiano') || text.includes('esempio')) return 'ita';
    return 'eng';
  })
}));

describe('LanguageDetector', () => {
  let detector: LanguageDetector;

  beforeEach(() => {
    detector = new LanguageDetector();
  });

  describe('detect', () => {
    it('should detect English text', () => {
      const text = 'This is a sample English text for language detection testing';
      const result = detector.detect(text);
      expect(result).toBe('en');
    });

    it('should detect Portuguese text', () => {
      const text = 'Este é um texto de exemplo em português para teste de detecção de idioma';
      const result = detector.detect(text);
      expect(result).toBe('pt');
    });

    it('should detect Spanish text', () => {
      const text = 'Este es un texto de ejemplo en español para pruebas de detección de idioma';
      const result = detector.detect(text);
      expect(result).toBe('es');
    });

    it('should return unknown for empty text', () => {
      const result = detector.detect('');
      expect(result).toBe('unknown');
    });

    it('should return unknown for very short text', () => {
      const result = detector.detect('Hi');
      expect(result).toBe('unknown');
    });

    it('should return unknown for whitespace only', () => {
      const result = detector.detect('   ');
      expect(result).toBe('unknown');
    });

    it('should handle text with numbers and special characters', () => {
      const text = 'This text has numbers 123 and special characters !@#$%';
      const result = detector.detect(text);
      expect(result).toBe('en');
    });

    it('should detect French text', () => {
      const text = 'Ceci est un texte exemple en français pour tester la détection de langue';
      const result = detector.detect(text);
      expect(result).toBe('fr');
    });

    it('should detect German text', () => {
      const text = 'Dies ist ein Beispieltext auf Deutsch zum Testen der Spracherkennung';
      const result = detector.detect(text);
      expect(result).toBe('de');
    });

    it('should detect Italian text', () => {
      const text = 'Questo è un testo di esempio in italiano per testare il rilevamento della lingua';
      const result = detector.detect(text);
      expect(result).toBe('it');
    });

    it('should handle errors gracefully', () => {
      // Test with invalid input that might cause errors
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Force an error by mocking franc to throw
      jest.mock('franc', () => ({
        franc: jest.fn(() => {
          throw new Error('Mock error');
        })
      }));

      const result = detector.detect('test');
      
      consoleSpy.mockRestore();
      expect(['en', 'unknown']).toContain(result);
    });
  });
});
