import { ILanguageDetector } from '../../domain/interfaces/ILanguageDetector';
import { LanguageCode } from '../../domain/models/ProductDiscovery';

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

  private francModule: any = null;

  /**
   * Lazy load franc module using dynamic import
   */
  private async getFranc(): Promise<any> {
    if (!this.francModule) {
      const module = await import('franc');
      this.francModule = module.franc;
    }
    return this.francModule;
  }

  /**
   * Detect language from text using franc library
   * @param text - Text to analyze
   * @returns Detected language code
   */
  async detect(text: string): Promise<LanguageCode> {
    if (!text || text.trim().length === 0) {
      return 'unknown';
    }

    try {
      const franc = await this.getFranc();
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
