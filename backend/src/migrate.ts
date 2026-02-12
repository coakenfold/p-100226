import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { query, closePool } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.resolve(__dirname, '../migrations');

async function migrate(): Promise<void> {
  // Create migrations tracking table
  await query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  // Get already-applied migrations
  const applied = await query<{ name: string }>(
    'SELECT name FROM migrations ORDER BY id',
  );
  const appliedNames = new Set(applied.rows.map((r) => r.name));

  // Read migration files
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    if (appliedNames.has(file)) {
      console.log(`  skip: ${file} (already applied)`);
      continue;
    }

    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
    console.log(`  apply: ${file}`);
    await query(sql);
    await query('INSERT INTO migrations (name) VALUES ($1)', [file]);
  }

  console.log('Migrations complete');
}

migrate()
  .catch((err: unknown) => {
    console.error('Migration failed:', err);
    process.exit(1);
  })
  .finally(() => closePool());
