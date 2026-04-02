import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  pgEnum,
  jsonb,
  boolean,
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

// Type exports for use in services
export type Business = typeof businesses.$inferSelect;
export type NewBusiness = typeof businesses.$inferInsert;
export type Directory = typeof directories.$inferSelect;
export type NewDirectory = typeof directories.$inferInsert;
