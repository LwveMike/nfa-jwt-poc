import { Module } from '@nestjs/common'
import { DrizzleMySqlModule } from '@knaadh/nestjs-drizzle-mysql2'
import * as schema from './schema'

export const DATABASE_TAG = 'database'

@Module({
  imports: [
    DrizzleMySqlModule.register({
      tag: DATABASE_TAG,
      mysql: {
        connection: 'client',
        config: {
          user: 'user',
          password: 'user',
          database: 'nfa',
          host: '127.0.0.1',
          port: 3306,
        },
      },
      config: {
        schema: { ...schema },
        mode: 'default',
      },
    }),
  ],
})
export class DrizzleModule {}
