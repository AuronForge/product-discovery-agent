import { ILanguageDetector } from '../../domain/interfaces/ILanguageDetector';
import { LanguageCode } from '../../domain/models/ProductDiscovery';
import { franc } from 'franc';

/**
 * Language detection implementation using franc library
 * Follows Single Responsibility Principle
 */
export class LanguageDetector implements ILanguageDetector {
  private readonly languageMap: Record<string, LanguageCode> = {
    eng: 'en',
    por: 'pt',
    spa: 'es',
    fra: 'fr',
    deu: 'de',
    ita: 'it'
  };

  /**
   * Detect language from text using franc library
   * @param text - Text to analyze
   * @returns Detected language code
   */
  detect(text: string): LanguageCode {
    if (!text || text.trim().length === 0) {
      return 'unknown';
    }

    try {
      // franc returns ISO 639-3 codes
      const detectedCode = franc(text, { minLength: 10 });

      if (detectedCode === 'und') {
        return 'unknown';
      }

      return this.languageMap[detectedCode] || 'unknown';
    } catch (error) {
      console.error('Language detection error:', error);
      return 'unknown';
    }
  }
}
