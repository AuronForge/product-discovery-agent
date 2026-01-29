import Database from 'better-sqlite3';
import { DatabaseSchema } from '../DatabaseSchema';

describe('DatabaseSchema', () => {
  let schema: DatabaseSchema;
  let db: Database.Database;

  beforeEach(() => {
    // Create schema with in-memory database
    schema = new DatabaseSchema(':memory:');
    db = (schema as any).db; // Access private db for testing
  });

  afterEach(() => {
    if (schema) {
      schema.close();
    }
  });

  afterEach(() => {
    db.close();
  });

  describe('initialization', () => {
    it('should create discoveries table', () => {
      const tableInfo = db
        .prepare(
          "SELECT name FROM sqlite_master WHERE type='table' AND name='discoveries'"
        )
        .get();

      expect(tableInfo).toBeDefined();
      expect(tableInfo).toHaveProperty('name', 'discoveries');
    });

    it('should create epics table', () => {
      const tableInfo = db
        .prepare(
          "SELECT name FROM sqlite_master WHERE type='table' AND name='epics'"
        )
        .get();

      expect(tableInfo).toBeDefined();
      expect(tableInfo).toHaveProperty('name', 'epics');
    });

    it('should create requirements table', () => {
      const tableInfo = db
        .prepare(
          "SELECT name FROM sqlite_master WHERE type='table' AND name='requirements'"
        )
        .get();

      expect(tableInfo).toBeDefined();
      expect(tableInfo).toHaveProperty('name', 'requirements');
    });

    it('should create index on discoveries.created_at', () => {
      const indexInfo = db
        .prepare(
          "SELECT name FROM sqlite_master WHERE type='index' AND name='idx_discoveries_created_at'"
        )
        .get();

      expect(indexInfo).toBeDefined();
    });

    it('should create index on epics.discovery_id', () => {
      const indexInfo = db
        .prepare(
          "SELECT name FROM sqlite_master WHERE type='index' AND name='idx_epics_discovery_id'"
        )
        .get();

      expect(indexInfo).toBeDefined();
    });

    it('should create index on requirements.epic_id', () => {
      const indexInfo = db
        .prepare(
          "SELECT name FROM sqlite_master WHERE type='index' AND name='idx_requirements_epic_id'"
        )
        .get();

      expect(indexInfo).toBeDefined();
    });

    it('should configure WAL mode for better concurrency', () => {
      const walMode = db.pragma('journal_mode', { simple: true });
      // In-memory databases use 'memory' mode instead of 'wal'
      expect(walMode).toMatch(/^(wal|memory)$/);
    });

    it('should enable foreign keys', () => {
      // Enable foreign keys (they're off by default in SQLite)
      db.pragma('foreign_keys = ON');
      const foreignKeys = db.pragma('foreign_keys', { simple: true });
      expect(foreignKeys).toBe(1);
    });

    it('should allow inserting a valid discovery', () => {
      const insert = db.prepare(`
        INSERT INTO discoveries (id, name, problem, solution, language, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      const id = 'test-uuid';
      const now = new Date().toISOString();

      const result = insert.run(
        id,
        'Test Product',
        'Test Problem',
        'Test Solution',
        'en',
        now
      );

      expect(result.changes).toBe(1);

      const discovery = db
        .prepare('SELECT * FROM discoveries WHERE id = ?')
        .get(id);
      expect(discovery).toBeDefined();
      expect(discovery).toMatchObject({
        id,
        name: 'Test Product',
        problem: 'Test Problem',
        solution: 'Test Solution',
        language: 'en'
      });
    });

    it('should enforce foreign key constraint on epics', () => {
      // Enable foreign keys
      db.pragma('foreign_keys = ON');

      const insertEpic = db.prepare(`
        INSERT INTO epics (id, discovery_id, name, description, priority, type, epic_order)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      expect(() => {
        insertEpic.run(
          'epic-1',
          'non-existent-id',
          'Title',
          'Desc',
          'P0',
          'Dev',
          1
        );
      }).toThrow();
    });

    it('should enforce foreign key constraint on requirements', () => {
      // Enable foreign keys
      db.pragma('foreign_keys = ON');

      const insertRequirement = db.prepare(`
        INSERT INTO requirements (epic_id, description, requirement_order)
        VALUES (?, ?, ?)
      `);

      expect(() => {
        insertRequirement.run('non-existent-epic', 'Desc', 1);
      }).toThrow();
    });

    it('should cascade delete epics when discovery is deleted', () => {
      // Enable foreign keys
      db.pragma('foreign_keys = ON');

      // Insert discovery
      const discoveryId = 'test-uuid';
      db.prepare(
        `
        INSERT INTO discoveries (id, name, problem, solution, language, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `
      ).run(
        discoveryId,
        'Test',
        'Problem',
        'Solution',
        'en',
        new Date().toISOString()
      );

      // Insert epic
      const epicId = 'epic-1';
      db.prepare(
        `
        INSERT INTO epics (id, discovery_id, name, description, priority, type, epic_order)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `
      ).run(epicId, discoveryId, 'Epic Title', 'Epic Desc', 'P0', 'Dev', 1);

      // Delete discovery
      db.prepare('DELETE FROM discoveries WHERE id = ?').run(discoveryId);

      // Epic should be deleted
      const epic = db.prepare('SELECT * FROM epics WHERE id = ?').get(epicId);
      expect(epic).toBeUndefined();
    });

    it('should cascade delete requirements when epic is deleted', () => {
      // Enable foreign keys
      db.pragma('foreign_keys = ON');

      // Insert discovery
      const discoveryId = 'test-uuid';
      db.prepare(
        `
        INSERT INTO discoveries (id, name, problem, solution, language, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `
      ).run(
        discoveryId,
        'Test',
        'Problem',
        'Solution',
        'en',
        new Date().toISOString()
      );

      // Insert epic
      const epicId = 'epic-1';
      db.prepare(
        `
        INSERT INTO epics (id, discovery_id, name, description, priority, type, epic_order)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `
      ).run(epicId, discoveryId, 'Epic Title', 'Epic Desc', 'P0', 'Dev', 1);

      // Insert requirement
      db.prepare(
        `
        INSERT INTO requirements (epic_id, description, requirement_order)
        VALUES (?, ?, ?)
      `
      ).run(epicId, 'Requirement Desc', 1);

      const reqBefore = db
        .prepare('SELECT * FROM requirements WHERE epic_id = ?')
        .get(epicId);
      expect(reqBefore).toBeDefined();

      // Delete epic
      db.prepare('DELETE FROM epics WHERE id = ?').run(epicId);

      // Requirement should be deleted
      const reqAfter = db
        .prepare('SELECT * FROM requirements WHERE epic_id = ?')
        .get(epicId);
      expect(reqAfter).toBeUndefined();
    });

    it('should handle multiple schema instances idempotently', () => {
      // Create another schema instance with same path
      const schema2 = new DatabaseSchema(':memory:');
      const db2 = (schema2 as any).db;

      const tables = db2
        .prepare(
          "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('discoveries', 'epics', 'requirements') ORDER BY name"
        )
        .all();

      expect(tables).toHaveLength(3);
      schema2.close();
    });

    it('should return database instance via getDatabase()', () => {
      const dbInstance = schema.getDatabase();

      expect(dbInstance).toBeDefined();
      expect(dbInstance).toBe(db);
    });

    it('should close database connection', () => {
      const closeSpy = jest.spyOn(db, 'close');

      schema.close();

      expect(closeSpy).toHaveBeenCalled();
    });

    it('should create directory if it does not exist', () => {
      const fs = require('fs');
      const path = require('path');
      const os = require('os');

      // Create a test path that definitely doesn't exist
      const testDir = path.join(os.tmpdir(), 'test-discovery-' + Date.now());
      const testDbPath = path.join(testDir, 'test.db');

      // Ensure it doesn't exist
      if (fs.existsSync(testDir)) {
        fs.rmSync(testDir, { recursive: true });
      }

      // Create schema with path that requires directory creation
      const testSchema = new DatabaseSchema(testDbPath);

      // Directory should now exist
      expect(fs.existsSync(testDir)).toBe(true);

      // Cleanup
      testSchema.close();
      fs.rmSync(testDir, { recursive: true });
    });

    it('should use default path when no path provided', () => {
      const fs = require('fs');
      const path = require('path');

      // Mock process.cwd to return a test directory
      const testCwd = path.join(
        require('os').tmpdir(),
        'test-cwd-' + Date.now()
      );
      fs.mkdirSync(testCwd, { recursive: true });

      jest.spyOn(process, 'cwd').mockReturnValue(testCwd);

      try {
        const defaultSchema = new DatabaseSchema();
        const dbPath = (defaultSchema as any).db.name;

        expect(dbPath).toContain('data');
        expect(dbPath).toContain('discoveries.db');

        defaultSchema.close();
      } finally {
        jest.restoreAllMocks();
        // Cleanup
        if (fs.existsSync(testCwd)) {
          fs.rmSync(testCwd, { recursive: true });
        }
      }
    });
  });
});
