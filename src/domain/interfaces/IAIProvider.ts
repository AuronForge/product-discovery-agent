import {
  ProductDiscoverySolution,
  ProductDiscoveryRequest,
  LanguageCode
} from '../models/ProductDiscovery';

/**
 * Interface for AI provider implementations
 */
export interface IAIProvider {
  /**
   * Generate product discovery solution based on problem description
   * @param request - The product discovery request
   * @param language - Detected language for response
   * @returns Promise with the generated solution
   */
  generateDiscovery(
    request: ProductDiscoveryRequest,
    language: LanguageCode
  ): Promise<ProductDiscoverySolution>;
}
