import { int, text, mysqlTable, datetime, timestamp, boolean } from 'drizzle-orm/mysql-core';

/**
 * @description MySQL doesn't allow for returning value when inserting
 */

export const user = mysqlTable('user', {
  id: int('id')
    .primaryKey()
    .autoincrement(),
  username: text('name')
    .notNull(),
  password: text('password')
    .notNull(),
});

export const session = mysqlTable('session', {
  /**
   * @description Will be added to jwt token
   */
  id: int('id')
    .primaryKey()
    .autoincrement(),
  userId: int('user_id')
    .references(() => user.id),
  lastAccessedAt: timestamp('last_accessed_at', { mode: 'date' })
    .defaultNow()
    .notNull(),
  device: text('device').default('unknown').notNull(),
  browser: text('browser').default('unknown').notNull(),
  os: text('os').default('unknown').notNull(),
  isBlacklisted: boolean('is_blacklisted')
    .default(false)
    .notNull(),
  /**
   * @description For production app this could be converted to an ip by mysql
   */
  ip: text('ip').default(null)
});
