import Database from 'better-sqlite3';
import path from 'path';

/**
 * Database initialization and schema creation
 * Creates SQLite database with all necessary tables
 */
export class DatabaseSchema {
  private db: Database.Database;

  constructor(dbPath?: string) {
    // Default to data/discoveries.db
    const finalPath = dbPath || path.join(process.cwd(), 'data', 'discoveries.db');
    
    // Ensure directory exists
    const dir = path.dirname(finalPath);
    const fs = require('fs');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    this.db = new Database(finalPath);
    this.db.pragma('journal_mode = WAL'); // Better concurrency
    this.createTables();
  }

  /**
   * Create all database tables
   */
  private createTables(): void {
    // Discoveries table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS discoveries (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        solution TEXT NOT NULL,
        problem TEXT NOT NULL,
        language TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Epics table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS epics (
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

    // Requirements table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS requirements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        epic_id TEXT NOT NULL,
        description TEXT NOT NULL,
        requirement_order INTEGER NOT NULL,
        FOREIGN KEY (epic_id) REFERENCES epics(id) ON DELETE CASCADE
      )
    `);

    // Create indexes for better query performance
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_epics_discovery_id ON epics(discovery_id);
      CREATE INDEX IF NOT EXISTS idx_requirements_epic_id ON requirements(epic_id);
      CREATE INDEX IF NOT EXISTS idx_discoveries_created_at ON discoveries(created_at);
    `);
  }

  /**
   * Get the database instance
   */
  getDatabase(): Database.Database {
    return this.db;
  }

  /**
   * Close the database connection
   */
  close(): void {
    this.db.close();
  }
}
