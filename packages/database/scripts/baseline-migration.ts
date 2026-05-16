import { neonConfig, Pool } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const connectionString = process.env['DATABASE_URL_UNPOOLED'] ?? process.env['DATABASE_URL'];
if (!connectionString) throw new Error('DATABASE_URL not set');

const pool = new Pool({ connectionString });

async function main(): Promise<void> {
  const migrationName = '20260516000000_init';
  const checksum = '0000000000000000000000000000000000000000000000000000000000000000';

  await pool.query(`
    CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
      id VARCHAR(36) PRIMARY KEY,
      checksum VARCHAR(64) NOT NULL,
      finished_at TIMESTAMPTZ,
      migration_name VARCHAR(255) NOT NULL,
      logs TEXT,
      rolled_back_at TIMESTAMPTZ,
      started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      applied_steps_count INT NOT NULL DEFAULT 0
    )
  `);

  const existing = await pool.query(
    `SELECT id FROM "_prisma_migrations" WHERE migration_name = $1`,
    [migrationName],
  );

  if ((existing.rowCount ?? 0) > 0) {
    console.log(`Migration ${migrationName} already recorded.`);
  } else {
    await pool.query(
      `INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, applied_steps_count)
       VALUES (gen_random_uuid()::text, $1, NOW(), $2, 1)`,
      [checksum, migrationName],
    );
    console.log(`Migration ${migrationName} baselined successfully.`);
  }

  await pool.end();
}

main().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});
