import { ProductDiscoverySolution, ProductDiscoveryRequest } from '../models/ProductDiscovery';

/**
 * Interface for the Product Discovery Service
 * Following the Dependency Inversion Principle
 */
export interface IProductDiscoveryService {
  /**
   * Execute product discovery based on the provided problem
   * @param request - The product discovery request
   * @returns Promise with the discovery solution
   */
  executeDiscovery(request: ProductDiscoveryRequest): Promise<ProductDiscoverySolution>;

  /**
   * List all discoveries with pagination
   * @param limit - Maximum number of records to return
   * @param offset - Number of records to skip
   * @returns Promise with array of discoveries and total count
   */
  listDiscoveries(limit?: number, offset?: number): Promise<{
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
  }>;

  /**
   * Get a specific discovery by ID
   * @param id - The discovery ID
   * @returns Promise with the discovery or null if not found
   */
  getDiscoveryById(id: string): Promise<{
    id: string;
    solution: ProductDiscoverySolution;
    problem: string;
    language: string;
    createdAt: Date;
  } | null>;
}
