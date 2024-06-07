import { env } from 'node:process'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import exp from 'node:constants'
import { z } from 'zod'

const MAX_PORT = 65535
const MIN_PORT = 1

const ACCESS_TOKEN_MIN_ALLOWED_SECONDS = 600
const ACCESS_TOKEN_MAX_ALLOWED_SECONDS = 259_200

const REFRESH_TOKEN_MIN_ALLOWED_SECONDS = 259_200
const REFRESH_TOKEN_MAX_ALLOWED_SECONDS = 2_678_400

const configSchema = z.object({
  port: z.coerce.number().int().min(MIN_PORT).max(MAX_PORT).default(1337),
  refreshKeysMetadata: z.object({
    pubKeyPath: z.string(),
    privKeyPath: z.string(),
    expiry: z.coerce.number().int().positive().min(REFRESH_TOKEN_MIN_ALLOWED_SECONDS).max(REFRESH_TOKEN_MAX_ALLOWED_SECONDS),
  }),
  accessKeysMetadata: z.object({
    pubKeyPath: z.string(),
    privKeyPath: z.string(),
    expiry: z.coerce.number().int().positive().min(ACCESS_TOKEN_MIN_ALLOWED_SECONDS).max(ACCESS_TOKEN_MAX_ALLOWED_SECONDS),
  }),
  debug: z.coerce.boolean().default(false),
})

export type Config = Awaited<ReturnType<typeof parseConfig>>

export default async function parseConfig() {
  const result = await configSchema.parseAsync({
    port: env.PORT,
    accessKeysMetadata: {
      pubKeyPath: env.ACCESS_PUB_KEY_PATH,
      privKeyPath: env.ACCESS_PRIV_KEY_PATH,
      expiry: env.ACCESS_EXPIRY,
    },
    refreshKeysMetadata: {
      pubKeyPath: env.REFRESH_PUB_KEY_PATH,
      privKeyPath: env.REFRESH_PRIV_KEY_PATH,
      expiry: env.REFRESH_EXPIRY,
    },
    debug: env.DEBUG,
  })

  const { accessKeysMetadata, refreshKeysMetadata, ...restOfConfig } = result

  const accessKeys = {
    pubKey: await readFile(resolve(accessKeysMetadata.pubKeyPath), 'utf8'),
    privKey: await readFile(resolve(accessKeysMetadata.privKeyPath), 'utf8'),
    expiry: accessKeysMetadata.expiry,
  }

  const refreshKeys = {
    pubKey: await readFile(resolve(refreshKeysMetadata.pubKeyPath), 'utf8'),
    privKey: await readFile(resolve(refreshKeysMetadata.privKeyPath), 'utf8'),
    expiry: refreshKeysMetadata.expiry,
  }

  return {
    ...restOfConfig,
    accessKeys,
    refreshKeys,
  }
}
