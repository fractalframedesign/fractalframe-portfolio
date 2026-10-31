import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';

import { seedProducts } from '../src/lib/access/repo/products';
import * as schema from '../src/lib/db/schema';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.log('DATABASE_URL not set, skipping migrations');
    return;
  }
  const pool = new Pool({ connectionString: url });
  try {
    const db = drizzle(pool, { schema });
    await migrate(db, { migrationsFolder: './drizzle' });
    const seeded = await seedProducts(db);
    console.log(`Migrations applied, ${seeded} products seeded`);
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
