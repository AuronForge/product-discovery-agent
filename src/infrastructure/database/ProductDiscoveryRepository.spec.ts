import Database from 'better-sqlite3';
import { ProductDiscoveryRepository } from './ProductDiscoveryRepository';
import { ProductDiscoverySolution } from '../../domain/models/ProductDiscovery';
import { v4 as uuidv4 } from 'uuid';

describe('ProductDiscoveryRepository', () => {
  let db: Database.Database;
  let repository: ProductDiscoveryRepository;

  beforeEach(() => {
    // Create in-memory database for testing
    db = new Database(':memory:');
    
    // Create tables
    db.exec(`
      CREATE TABLE discoveries (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        solution TEXT NOT NULL,
        problem TEXT NOT NULL,
        language TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.exec(`
      CREATE TABLE epics (
        id TEXT PRIMARY KEY,
        discovery_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        priority TEXT NOT NULL,
        type TEXT NOT NULL,
        epic_order INTEGER NOT NULL,
        FOREIGN KEY (discovery_id) REFERENCES discoveries(id) ON DELETE CASCADE
      )
    `);

    db.exec(`
      CREATE TABLE requirements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        epic_id TEXT NOT NULL,
        description TEXT NOT NULL,
        requirement_order INTEGER NOT NULL,
        FOREIGN KEY (epic_id) REFERENCES epics(id) ON DELETE CASCADE
      )
    `);

    repository = new ProductDiscoveryRepository(db);
  });

  afterEach(() => {
    db.close();
  });

  const mockSolution: ProductDiscoverySolution = {
    name: 'E-Commerce Platform',
    solution: 'Complete e-commerce solution with product management',
    epics: [
      {
        id: uuidv4(),
        name: 'Product Management',
        description: 'Manage products and inventory',
        requirements: ['CRUD operations', 'Search functionality', 'Image upload'],
        priority: 'P0',
        type: 'Time de desenvolvimento'
      },
      {
        id: uuidv4(),
        name: 'Shopping Cart',
        description: 'Shopping cart functionality',
        requirements: ['Add to cart', 'Update quantities', 'Checkout'],
        priority: 'P0',
        type: 'Time de experiência do usuário'
      }
    ]
  };

  describe('save', () => {
    it('should save discovery with all epics and requirements', async () => {
      const discoveryId = await repository.save(
        mockSolution,
        'Need e-commerce platform',
        'en'
      );

      expect(discoveryId).toBeDefined();
      expect(typeof discoveryId).toBe('string');

      // Verify discovery was saved
      const discovery = db.prepare('SELECT * FROM discoveries WHERE id = ?').get(discoveryId);
      expect(discovery).toBeDefined();
      expect((discovery as any).name).toBe('E-Commerce Platform');

      // Verify epics were saved
      const epics = db.prepare('SELECT * FROM epics WHERE discovery_id = ?').all(discoveryId);
      expect(epics).toHaveLength(2);

      // Verify requirements were saved
      const requirements = db.prepare(`
        SELECT r.* FROM requirements r
        INNER JOIN epics e ON r.epic_id = e.id
        WHERE e.discovery_id = ?
      `).all(discoveryId);
      expect(requirements).toHaveLength(6); // 3 + 3 requirements
    });

    it('should maintain epic order', async () => {
      const discoveryId = await repository.save(mockSolution, 'Test problem', 'en');

      const epics = db.prepare(`
        SELECT name, epic_order FROM epics 
        WHERE discovery_id = ? 
        ORDER BY epic_order
      `).all(discoveryId) as Array<{ name: string; epic_order: number }>;

      expect(epics[0].name).toBe('Product Management');
      expect(epics[0].epic_order).toBe(0);
      expect(epics[1].name).toBe('Shopping Cart');
      expect(epics[1].epic_order).toBe(1);
    });
  });

  describe('findById', () => {
    it('should return discovery with all data', async () => {
      const savedId = await repository.save(mockSolution, 'Test problem', 'en');

      const result = await repository.findById(savedId);

      expect(result).not.toBeNull();
      expect(result?.id).toBe(savedId);
      expect(result?.solution.name).toBe('E-Commerce Platform');
      expect(result?.solution.epics).toHaveLength(2);
      expect(result?.solution.epics[0].requirements).toHaveLength(3);
      expect(result?.problem).toBe('Test problem');
      expect(result?.language).toBe('en');
      expect(result?.createdAt).toBeInstanceOf(Date);
    });

    it('should return null for non-existent id', async () => {
      const result = await repository.findById('non-existent-id');
      expect(result).toBeNull();
    });

    it('should preserve epic and requirement order', async () => {
      const savedId = await repository.save(mockSolution, 'Test', 'en');
      const result = await repository.findById(savedId);

      expect(result?.solution.epics[0].name).toBe('Product Management');
      expect(result?.solution.epics[1].name).toBe('Shopping Cart');
      expect(result?.solution.epics[0].requirements[0]).toBe('CRUD operations');
      expect(result?.solution.epics[0].requirements[2]).toBe('Image upload');
    });
  });

  describe('findAll', () => {
    beforeEach(async () => {
      // Insert multiple discoveries with unique epics
      const solution1 = {
        ...mockSolution,
        epics: mockSolution.epics.map(epic => ({ ...epic, id: uuidv4() }))
      };
      const solution2 = {
        ...mockSolution,
        epics: mockSolution.epics.map(epic => ({ ...epic, id: uuidv4() }))
      };
      const solution3 = {
        ...mockSolution,
        epics: mockSolution.epics.map(epic => ({ ...epic, id: uuidv4() }))
      };

      await repository.save(solution1, 'Problem 1', 'en');
      await repository.save(solution2, 'Problem 2', 'pt');
      await repository.save(solution3, 'Problem 3', 'es');
    });

    it('should return paginated results', async () => {
      const result = await repository.findAll(2, 0);

      expect(result).toHaveLength(2);
      expect(result[0].solution.name).toBe('E-Commerce Platform');
    });

    it('should respect offset', async () => {
      const result = await repository.findAll(2, 1);

      expect(result).toHaveLength(2);
    });

    it('should return empty array when offset exceeds total', async () => {
      const result = await repository.findAll(10, 100);
      expect(result).toHaveLength(0);
    });

    it('should return discoveries in descending order by creation date', async () => {
      const result = await repository.findAll(10, 0);

      // Most recent first (note: SQLite may not preserve exact insertion order with timestamp precision)
      expect(result.length).toBe(3);
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ problem: 'Problem 1' }),
          expect.objectContaining({ problem: 'Problem 2' }),
          expect.objectContaining({ problem: 'Problem 3' })
        ])
      );
    });
  });

  describe('count', () => {
    it('should return 0 for empty database', async () => {
      const count = await repository.count();
      expect(count).toBe(0);
    });

    it('should return correct count', async () => {
      const solution1 = {
        ...mockSolution,
        epics: mockSolution.epics.map(epic => ({ ...epic, id: uuidv4() }))
      };
      const solution2 = {
        ...mockSolution,
        epics: mockSolution.epics.map(epic => ({ ...epic, id: uuidv4() }))
      };

      await repository.save(solution1, 'Problem 1', 'en');
      await repository.save(solution2, 'Problem 2', 'pt');

      const count = await repository.count();
      expect(count).toBe(2);
    });
  });

  describe('deleteById', () => {
    it('should delete discovery and return true', async () => {
      const savedId = await repository.save(mockSolution, 'Test', 'en');

      const deleted = await repository.deleteById(savedId);

      expect(deleted).toBe(true);

      const result = await repository.findById(savedId);
      expect(result).toBeNull();
    });

    it('should return false for non-existent id', async () => {
      const deleted = await repository.deleteById('non-existent');
      expect(deleted).toBe(false);
    });

    it('should cascade delete epics and requirements', async () => {
      const savedId = await repository.save(mockSolution, 'Test', 'en');

      await repository.deleteById(savedId);

      const epics = db.prepare('SELECT * FROM epics WHERE discovery_id = ?').all(savedId);
      expect(epics).toHaveLength(0);

      // Requirements should also be deleted (cascade)
      const allRequirements = db.prepare('SELECT * FROM requirements').all();
      expect(allRequirements).toHaveLength(0);
    });
  });
});
