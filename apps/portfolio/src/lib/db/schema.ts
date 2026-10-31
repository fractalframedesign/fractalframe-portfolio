import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';

export const accessLevel = pgEnum('access_level', [
  'public',
  'unlocked',
  'admin',
]);
export const grantStatus = pgEnum('grant_status', ['active', 'paused']);
export const grantSource = pgEnum('grant_source', [
  'manual',
  'request',
  'purchase',
]);
export const requestStatus = pgEnum('request_status', [
  'pending',
  'declined',
  'approved',
]);

const timestamptz = (name: string) => timestamp(name, { withTimezone: true });

export const products = pgTable('products', {
  slug: text('slug').primaryKey(),
  kind: text('kind').notNull().default('project'),
  level: accessLevel('level').notNull(),
  createdAt: timestamptz('created_at').notNull().defaultNow(),
  updatedAt: timestamptz('updated_at').notNull().defaultNow(),
});

export const guests = pgTable('guests', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').unique(),
  note: text('note').notNull().default(''),
  passwordLookup: text('password_lookup').notNull().unique(),
  createdAt: timestamptz('created_at').notNull().defaultNow(),
  // One pass per person opens every password-protected project
  // Paused by default: a row written by older code must never get open access
  accessStatus: grantStatus('access_status').notNull().default('paused'),
  accessExpiresAt: timestamptz('access_expires_at'),
  lastVisitAt: timestamptz('last_visit_at'),
  visitCount: integer('visit_count').notNull().default(0),
});

export const grants = pgTable(
  'grants',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    guestId: uuid('guest_id')
      .notNull()
      .references(() => guests.id, { onDelete: 'cascade' }),
    productSlug: text('product_slug')
      .notNull()
      .references(() => products.slug, { onDelete: 'cascade' }),
    status: grantStatus('status').notNull().default('active'),
    source: grantSource('source').notNull().default('manual'),
    expiresAt: timestamptz('expires_at'),
    lastVisitAt: timestamptz('last_visit_at'),
    visitCount: integer('visit_count').notNull().default(0),
    createdAt: timestamptz('created_at').notNull().defaultNow(),
  },
  (t) => [unique().on(t.guestId, t.productSlug)],
);

export const accessRequests = pgTable('access_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  message: text('message').notNull().default(''),
  productSlug: text('product_slug').notNull(),
  status: requestStatus('status').notNull().default('pending'),
  createdAt: timestamptz('created_at').notNull().defaultNow(),
});

export const loginAttempts = pgTable('login_attempts', {
  key: text('key').primaryKey(),
  failures: integer('failures').notNull(),
  windowStart: timestamptz('window_start').notNull(),
  lockedUntil: timestamptz('locked_until'),
});

/** One row (id 'owner'). Once set, it replaces the ADMIN_PASSWORD env var. */
export const adminAccount = pgTable('admin_account', {
  id: text('id').primaryKey().default('owner'),
  passwordHash: text('password_hash').notNull(),
  passwordChangedAt: timestamptz('password_changed_at').notNull(),
});
