import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/modules/drizzle/schema.ts',
  out: './migrations',
  dialect: 'mysql',
  // TODO(lwvemike): take this from configService
  dbCredentials: {
    host: process.env.DB_HOST!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
  },
})
