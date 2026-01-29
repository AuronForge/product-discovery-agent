import { LanguageCode } from '../models/ProductDiscovery';

/**
 * Interface for language detection service
 */
export interface ILanguageDetector {
  /**
   * Detect the language of a given text
   * @param text - The text to analyze
   * @returns The detected language code
   */
  detect(text: string): Promise<LanguageCode>;
}
