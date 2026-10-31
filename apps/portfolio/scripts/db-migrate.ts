import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.log('DATABASE_URL is not set, skipping migrations');
    return;
  }
  const pool = new Pool({ connectionString: url });
  await migrate(drizzle(pool), { migrationsFolder: './drizzle' });
  await pool.end();
  console.log('Migrations applied');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
