import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';

import * as schema from './schema';

export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;

export class DatabaseUnavailableError extends Error {
  constructor() {
    super('DATABASE_URL is not set');
    this.name = 'DatabaseUnavailableError';
  }
}

let cached: Db | undefined;

export function getDb(): Db {
  if (cached) return cached;
  const url = process.env.DATABASE_URL;
  if (!url) throw new DatabaseUnavailableError();
  cached = drizzle(new Pool({ connectionString: url }), { schema });
  return cached;
}
