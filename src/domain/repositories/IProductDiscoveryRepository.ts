import { ProductDiscoverySolution } from '../models/ProductDiscovery';

/**
 * Repository interface for ProductDiscovery persistence
 * Following Clean Architecture principles - Domain layer defines the contract
 */
export interface IProductDiscoveryRepository {
  /**
   * Save a product discovery solution to the database
   * @param solution - The product discovery solution to save
   * @param problem - The original problem description
   * @param language - The detected language of the request
   * @returns The ID of the saved discovery
   */
  save(
    solution: ProductDiscoverySolution,
    problem: string,
    language: string
  ): Promise<string>;

  /**
   * Find a discovery by its ID
   * @param id - The discovery ID
   * @returns The discovery solution or null if not found
   */
  findById(id: string): Promise<{
    id: string;
    solution: ProductDiscoverySolution;
    problem: string;
    language: string;
    createdAt: Date;
  } | null>;

  /**
   * Get all discoveries with pagination
   * @param limit - Maximum number of records to return
   * @param offset - Number of records to skip
   * @returns Array of discoveries
   */
  findAll(
    limit: number,
    offset: number
  ): Promise<
    Array<{
      id: string;
      solution: ProductDiscoverySolution;
      problem: string;
      language: string;
      createdAt: Date;
    }>
  >;

  /**
   * Count total discoveries in the database
   * @returns Total count
   */
  count(): Promise<number>;

  /**
   * Delete a discovery by ID
   * @param id - The discovery ID
   * @returns True if deleted, false if not found
   */
  deleteById(id: string): Promise<boolean>;
}
