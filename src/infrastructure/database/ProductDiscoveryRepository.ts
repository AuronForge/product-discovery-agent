import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { IProductDiscoveryRepository } from '../../domain/repositories/IProductDiscoveryRepository';
import { ProductDiscoverySolution } from '../../domain/models/ProductDiscovery';

/**
 * SQLite implementation of ProductDiscoveryRepository
 * Handles persistence of product discovery solutions in local database
 */
export class ProductDiscoveryRepository implements IProductDiscoveryRepository {
  constructor(private db: Database.Database) {}

  /**
   * Save a product discovery solution to the database
   */
  async save(solution: ProductDiscoverySolution, problem: string, language: string): Promise<string> {
    const discoveryId = uuidv4();

    // Start transaction for data consistency
    const insertDiscovery = this.db.prepare(`
      INSERT INTO discoveries (id, name, solution, problem, language, created_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `);

    const insertEpic = this.db.prepare(`
      INSERT INTO epics (id, discovery_id, name, description, priority, type, epic_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const insertRequirement = this.db.prepare(`
      INSERT INTO requirements (epic_id, description, requirement_order)
      VALUES (?, ?, ?)
    `);

    // Execute all inserts in a transaction
    const transaction = this.db.transaction(() => {
      // Insert discovery
      insertDiscovery.run(
        discoveryId,
        solution.name,
        solution.solution,
        problem,
        language
      );

      // Insert epics and requirements
      solution.epics.forEach((epic, epicIndex) => {
        insertEpic.run(
          epic.id,
          discoveryId,
          epic.name,
          epic.description,
          epic.priority,
          epic.type,
          epicIndex
        );

        // Insert requirements for this epic
        epic.requirements.forEach((requirement, reqIndex) => {
          insertRequirement.run(epic.id, requirement, reqIndex);
        });
      });
    });

    transaction();
    return discoveryId;
  }

  /**
   * Find a discovery by its ID
   */
  async findById(id: string): Promise<{
    id: string;
    solution: ProductDiscoverySolution;
    problem: string;
    language: string;
    createdAt: Date;
  } | null> {
    // Get discovery
    const discovery = this.db.prepare(`
      SELECT id, name, solution, problem, language, created_at
      FROM discoveries
      WHERE id = ?
    `).get(id) as any;

    if (!discovery) {
      return null;
    }

    // Get epics
    const epics = this.db.prepare(`
      SELECT id, name, description, priority, type, epic_order
      FROM epics
      WHERE discovery_id = ?
      ORDER BY epic_order
    `).all(id) as any[];

    // Get requirements for all epics
    const epicIds = epics.map(e => e.id);
    const requirements = epicIds.length > 0
      ? this.db.prepare(`
          SELECT epic_id, description, requirement_order
          FROM requirements
          WHERE epic_id IN (${epicIds.map(() => '?').join(',')})
          ORDER BY requirement_order
        `).all(...epicIds) as any[]
      : [];

    // Build solution object
    const solution: ProductDiscoverySolution = {
      name: discovery.name,
      solution: discovery.solution,
      epics: epics.map(epic => ({
        id: epic.id,
        name: epic.name,
        description: epic.description,
        requirements: requirements
          .filter(r => r.epic_id === epic.id)
          .map(r => r.description),
        priority: epic.priority,
        type: epic.type
      }))
    };

    return {
      id: discovery.id,
      solution,
      problem: discovery.problem,
      language: discovery.language,
      createdAt: new Date(discovery.created_at)
    };
  }

  /**
   * Get all discoveries with pagination
   */
  async findAll(limit: number = 10, offset: number = 0): Promise<Array<{
    id: string;
    solution: ProductDiscoverySolution;
    problem: string;
    language: string;
    createdAt: Date;
  }>> {
    const discoveries = this.db.prepare(`
      SELECT id
      FROM discoveries
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(limit, offset) as Array<{ id: string }>;

    // Fetch full data for each discovery
    const results = [];
    for (const disc of discoveries) {
      const full = await this.findById(disc.id);
      if (full) {
        results.push(full);
      }
    }

    return results;
  }

  /**
   * Count total discoveries in the database
   */
  async count(): Promise<number> {
    const result = this.db.prepare(`
      SELECT COUNT(*) as count FROM discoveries
    `).get() as { count: number };

    return result.count;
  }

  /**
   * Delete a discovery by ID
   */
  async deleteById(id: string): Promise<boolean> {
    const result = this.db.prepare(`
      DELETE FROM discoveries WHERE id = ?
    `).run(id);

    return result.changes > 0;
  }
}
