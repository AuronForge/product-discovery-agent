import { GitHubCopilotProvider } from '../infrastructure/ai/GitHubCopilotProvider';
import { LanguageDetector } from '../infrastructure/language/LanguageDetector';
import { ProductDiscoveryService } from '../application/services/ProductDiscoveryService';
import { ProductDiscoveryController } from '../presentation/controllers/ProductDiscoveryController';
import { DatabaseSchema } from '../infrastructure/database/DatabaseSchema';
import { ProductDiscoveryRepository } from '../infrastructure/database/ProductDiscoveryRepository';

/**
 * Dependency Injection Container
 * Implements Dependency Inversion Principle
 * Centralizes dependency creation and injection
 */
export class DIContainer {
  private static instance: DIContainer;
  private _productDiscoveryController?: ProductDiscoveryController;
  private _databaseSchema?: DatabaseSchema;

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  /**
   * Get database schema singleton
   */
  private get databaseSchema(): DatabaseSchema {
    if (!this._databaseSchema) {
      this._databaseSchema = new DatabaseSchema();
    }
    return this._databaseSchema;
  }

  /**
   * Get Product Discovery Controller with all dependencies injected
   */
  get productDiscoveryController(): ProductDiscoveryController {
    if (!this._productDiscoveryController) {
      // Create infrastructure dependencies
      const aiProvider = new GitHubCopilotProvider();
      const languageDetector = new LanguageDetector();
      const repository = new ProductDiscoveryRepository(this.databaseSchema.getDatabase());

      // Create application service
      const productDiscoveryService = new ProductDiscoveryService(
        aiProvider,
        languageDetector,
        repository
      );

      // Create controller
      this._productDiscoveryController = new ProductDiscoveryController(
        productDiscoveryService
      );
    }

    return this._productDiscoveryController;
  }

  /**
   * Reset container (useful for testing)
   */
  reset(): void {
    this._productDiscoveryController = undefined;
  }
}
