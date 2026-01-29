import { IProductDiscoveryService } from '../../domain/interfaces/IProductDiscoveryService';
import { IAIProvider } from '../../domain/interfaces/IAIProvider';
import { ILanguageDetector } from '../../domain/interfaces/ILanguageDetector';
import { IProductDiscoveryRepository } from '../../domain/repositories/IProductDiscoveryRepository';
import {
  ProductDiscoverySolution,
  ProductDiscoveryRequest
} from '../../domain/models/ProductDiscovery';

/**
 * Product Discovery Service implementation
 * Orchestrates the discovery process following Clean Architecture
 */
export class ProductDiscoveryService implements IProductDiscoveryService {
  constructor(
    private readonly aiProvider: IAIProvider,
    private readonly languageDetector: ILanguageDetector,
    private readonly repository: IProductDiscoveryRepository
  ) {}

  /**
   * Execute product discovery workflow
   * 1. Validate input
   * 2. Detect language
   * 3. Generate discovery via AI
   * 4. Persist to database
   * 5. Return structured solution
   * @param request - Product discovery request
   * @returns Product discovery solution
   */
  async executeDiscovery(
    request: ProductDiscoveryRequest
  ): Promise<ProductDiscoverySolution> {
    // Validate input
    this.validateRequest(request);

    // Detect language from problem description
    const detectedLanguage = await this.languageDetector.detect(
      request.problem
    );

    // Generate discovery solution using AI
    const solution = await this.aiProvider.generateDiscovery(
      request,
      detectedLanguage
    );

    // Validate output
    this.validateSolution(solution);

    // Persist to database
    try {
      const discoveryId = await this.repository.save(
        solution,
        request.problem,
        detectedLanguage
      );
      console.log(`✅ Discovery saved to database with ID: ${discoveryId}`);
    } catch (error) {
      console.error('Failed to persist discovery to database:', error);
      // Don't fail the request if persistence fails - log and continue
    }

    return solution;
  }

  /**
   * Validate request input
   * @param request - Request to validate
   * @throws Error if validation fails
   */
  private validateRequest(request: ProductDiscoveryRequest): void {
    if (!request.problem || request.problem.trim().length === 0) {
      throw new Error('Problem description is required');
    }

    if (request.problem.trim().length < 10) {
      throw new Error(
        'Problem description is too short (minimum 10 characters)'
      );
    }

    if (request.problem.trim().length > 5000) {
      throw new Error(
        'Problem description is too long (maximum 5000 characters)'
      );
    }
  }

  /**
   * Validate solution output
   * @param solution - Solution to validate
   * @throws Error if validation fails
   */
  private validateSolution(solution: ProductDiscoverySolution): void {
    if (!solution.name || solution.name.trim().length === 0) {
      throw new Error('Solution name is required');
    }

    if (!solution.solution || solution.solution.trim().length === 0) {
      throw new Error('Solution description is required');
    }

    if (!solution.epics || !Array.isArray(solution.epics)) {
      throw new Error('Epics must be an array');
    }

    if (solution.epics.length < 5) {
      throw new Error('Minimum 5 epics required');
    }

    if (solution.epics.length > 15) {
      throw new Error('Maximum 15 epics allowed');
    }

    // Validate each epic
    solution.epics.forEach((epic, index) => {
      if (!epic.id || !epic.name || !epic.description) {
        throw new Error(`Epic at index ${index} is missing required fields`);
      }

      if (!Array.isArray(epic.requirements) || epic.requirements.length === 0) {
        throw new Error(
          `Epic "${epic.name}" must have at least one requirement`
        );
      }

      // Accept both formats: "P0 (Must)" or "P0"
      const validPriorities = [
        'P0 (Must)',
        'P1 (Should)',
        'P2 (Could)',
        "P3 (Won't now)",
        'P0',
        'P1',
        'P2',
        'P3'
      ];
      if (!validPriorities.includes(epic.priority)) {
        throw new Error(
          `Epic "${epic.name}" has invalid priority: ${epic.priority}`
        );
      }

      const validTypes = [
        'Time de negócios',
        'Time de desenvolvimento',
        'Time de experiência do usuário',
        'Time de qualidade'
      ];
      if (!validTypes.includes(epic.type)) {
        throw new Error(`Epic "${epic.name}" has invalid type: ${epic.type}`);
      }
    });
  }

  /**
   * List all discoveries with pagination
   */
  async listDiscoveries(
    limit: number = 10,
    offset: number = 0
  ): Promise<{
    discoveries: Array<{
      id: string;
      name: string;
      solution: string;
      problem: string;
      language: string;
      epicCount: number;
      createdAt: Date;
    }>;
    total: number;
    limit: number;
    offset: number;
  }> {
    const [allDiscoveries, total] = await Promise.all([
      this.repository.findAll(limit, offset),
      this.repository.count()
    ]);

    const discoveries = allDiscoveries.map(d => ({
      id: d.id,
      name: d.solution.name,
      solution: d.solution.solution,
      problem: d.problem,
      language: d.language,
      epicCount: d.solution.epics.length,
      createdAt: d.createdAt
    }));

    return {
      discoveries,
      total,
      limit,
      offset
    };
  }

  /**
   * Get a specific discovery by ID
   */
  async getDiscoveryById(id: string): Promise<{
    id: string;
    solution: ProductDiscoverySolution;
    problem: string;
    language: string;
    createdAt: Date;
  } | null> {
    return await this.repository.findById(id);
  }
}
