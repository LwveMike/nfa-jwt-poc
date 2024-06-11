import { config, exit } from 'node:process'
import { drizzle } from 'drizzle-orm/mysql2'
import { createConnection } from 'mysql2/promise'
import * as schema from 'src/modules/drizzle/schema'

async function main() {
  const db = drizzle(
    await createConnection({
      host: 'localhost',
      user: 'user',
      password: 'user',
      database: 'nfa',
      port: 3306,
    }),
    {
      mode: 'default',
      schema,
    },
  )

  async function case1() {
    const { 0: role } = await db
      .insert(schema.role)
      .values({
        name: 'user_role',
      })

    await db
      .insert(schema.user)
      .values({
        username: 'username',
        password: 'username',
        roleId: role.insertId,
      })

    const { 0: service } = await db
      .insert(schema.services)
      .values({
        name: 'protected',
      })

    const { 0: servicePermission1 } = await db
      .insert(schema.servicesPermission)
      .values([
        {
          serviceId: service.insertId,
          permission: 'read',
        },
      ])

    const { 0: servicePermission2 } = await db
      .insert(schema.servicesPermission)
      .values([
        {
          serviceId: service.insertId,
          permission: 'change',
        },
      ])

    const lastServicePermissionIds = [servicePermission1.insertId, servicePermission2.insertId]

    for (const id of lastServicePermissionIds) {
      await db
        .insert(schema.roleServicesPermissions)
        .values([{
          roleId: role.insertId,
          servicePermissionId: id,
        },
        ])
    }
  }

  async function case2() {
    const { 0: role } = await db
      .insert(schema.role)
      .values({
        name: 'superadmin_role',
      })

    await db
      .insert(schema.user)
      .values({
        username: 'superadmin',
        password: 'superadmin',
        roleId: role.insertId,
      })

    const { 0: service } = await db
      .insert(schema.services)
      .values({
        name: 'api',
      })

    const { 0: servicePermission1 } = await db
      .insert(schema.servicesPermission)
      .values([
        {
          serviceId: service.insertId,
          permission: 'read',
        },
      ])


    const { 0: servicePermission2 } = await db
      .insert(schema.servicesPermission)
      .values([
        {
          serviceId: service.insertId,
          permission: 'change',
        },
      ])

      const lastServicePermissionIds = [servicePermission1.insertId, servicePermission2.insertId]

      for (const id of lastServicePermissionIds) {
        await db
          .insert(schema.roleServicesPermissions)
          .values([{
            roleId: role.insertId,
            servicePermissionId: id,
          },
        ])
      }
  }

  async function case3() {
    const { 0: role } = await db
      .insert(schema.role)
      .values({
        name: 'random_role',
      })

    await db
      .insert(schema.user)
      .values({
        username: 'randomuser',
        password: 'randomuser',
        roleId: role.insertId,
      })

    async function createService(name: string) {
      const { 0: service } = await db
        .insert(schema.services)
        .values({
          name,
        })

      const { 0: servicePermission1 } = await db
        .insert(schema.servicesPermission)
        .values([
          {
            serviceId: service.insertId,
            permission: 'read',
          },
        ])

      const { 0: servicePermission2 } = await db
        .insert(schema.servicesPermission)
        .values([
          {
            serviceId: service.insertId,
            permission: 'change',
          },
        ])

      const lastServicePermissionIds = [servicePermission1.insertId, servicePermission2.insertId]

      for (const id of lastServicePermissionIds) {
        await db
          .insert(schema.roleServicesPermissions)
          .values([{
            roleId: role.insertId,
            servicePermissionId: id,
          },
        ])
      }
    }

    for (const name of ['books', 'books.hello', 'random']) {
      await createService(name)
    }
  }

  await case1()
  await case2()
  await case3()

  exit(0)
}

main()
