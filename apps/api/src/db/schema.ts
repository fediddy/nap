import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  pgEnum,
  jsonb,
  boolean,
  integer,
} from 'drizzle-orm/pg-core';

// Enums
export const businessStatusEnum = pgEnum('business_status', ['active', 'deactivated']);
export const directoryHealthEnum = pgEnum('directory_health', ['healthy', 'degraded', 'down']);
export const directoryTypeEnum = pgEnum('directory_type', ['browser', 'file_export', 'api']);

// Businesses table
export const businesses = pgTable('businesses', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  address: varchar('address', { length: 255 }).notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  state: varchar('state', { length: 50 }).notNull(),
  zip: varchar('zip', { length: 20 }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  website: text('website'),
  status: businessStatusEnum('status').notNull().default('active'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Directories table
export const directories = pgTable('directories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  type: directoryTypeEnum('type').notNull(),
  apiConfig: jsonb('api_config').notNull().default({}),
  rateLimits: jsonb('rate_limits').notNull().default({}),
  healthStatus: directoryHealthEnum('health_status').notNull().default('healthy'),
  paused: boolean('paused').notNull().default(false),
  lastHealthCheck: timestamp('last_health_check', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Batches table
export const batchStatusEnum = pgEnum('batch_status', ['imported', 'failed']);

export const batches = pgTable('batches', {
  id: uuid('id').primaryKey().defaultRandom(),
  csvFilename: varchar('csv_filename', { length: 255 }).notNull(),
  importDate: timestamp('import_date', { withTimezone: true }).notNull().defaultNow(),
  businessCount: integer('business_count').notNull().default(0),
  status: batchStatusEnum('status').notNull().default('imported'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Submissions table
export const submissionStatusEnum = pgEnum('submission_status', [
  'queued', 'submitting', 'submitted', 'verified', 'failed', 'requires_action', 'removed'
]);

export const submissions = pgTable('submissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id').notNull().references(() => businesses.id),
  directoryId: uuid('directory_id').notNull().references(() => directories.id),
  status: submissionStatusEnum('status').notNull().default('queued'),
  externalId: varchar('external_id', { length: 255 }),
  errorCode: varchar('error_code', { length: 100 }),
  message: text('message'),
  submittedAt: timestamp('submitted_at', { withTimezone: true }),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  lastAttempt: timestamp('last_attempt', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Directory Accounts table — stores authenticated browser sessions per directory
export const directoryAccountStatusEnum = pgEnum('directory_account_status', ['active', 'needs_reauth', 'suspended']);

export const directoryAccounts = pgTable('directory_accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 100 }).notNull(),
  label: varchar('label', { length: 255 }).notNull(),
  cookiesJson: text('cookies_json'),
  userAgent: text('user_agent'),
  status: directoryAccountStatusEnum('status').notNull().default('active'),
  pagesCreated: integer('pages_created').notNull().default(0),
  lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Type exports for use in services
export type Business = typeof businesses.$inferSelect;
export type NewBusiness = typeof businesses.$inferInsert;
export type Directory = typeof directories.$inferSelect;
export type NewDirectory = typeof directories.$inferInsert;
export type Batch = typeof batches.$inferSelect;
export type NewBatch = typeof batches.$inferInsert;
export type Submission = typeof submissions.$inferSelect;
export type NewSubmission = typeof submissions.$inferInsert;
export type DirectoryAccount = typeof directoryAccounts.$inferSelect;
export type NewDirectoryAccount = typeof directoryAccounts.$inferInsert;
