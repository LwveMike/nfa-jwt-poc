import { sql } from 'drizzle-orm'
import { UniqueConstraintBuilder, boolean, int, mysqlEnum, mysqlTable, text, timestamp, unique } from 'drizzle-orm/mysql-core'

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
  roleId: int('role_id')
    .references(() => role.id)
})

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
  ip: text('ip'),
})

export const services = mysqlTable('services', {
  id: int('id')
    .primaryKey()
    .autoincrement(),
  /**
   * @description Name of the service corresponding to the url, or with the dot notation if is a nested service
   * @example 'protected' or 'protected.books
   */
  name: text('name')
    .notNull(),
})

export const servicesPermission = mysqlTable('services_permissions', {
  id: int('id')
    .primaryKey()
    .autoincrement(),
  serviceId: int('service_id')
    .references(() => services.id),
  permission: mysqlEnum('permission', ['change', 'read', 'delete'])
}, (t) => {
  return {
    serviceIdPermission: unique('service_id__permission').on(t.serviceId, t.permission),
  }
})

/**
 * @description MySQL doesn't like role_services_permissions table name, because it created a fk to long 
 */
export const roleServicesPermissions = mysqlTable('rsp', {
  roleId: int('role_id')
    .references(() => role.id),
  servicePermissionId: int('service_permission_id')
    .references(() => servicesPermission.id),
}, (t) => {
  return {
    roleIdServicePermissionId: unique('role_id__service_permission_id').on(t.roleId, t.servicePermissionId),
  }
})

/**
 * @description This is used more like an alias to multiple servicesPermissions
 */
export const role = mysqlTable('role', {
  id: int('id')
    .primaryKey()
    .autoincrement(),
  name: text('name')
    .notNull(),
})


