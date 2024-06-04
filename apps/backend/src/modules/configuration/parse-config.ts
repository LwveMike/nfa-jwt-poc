import { z } from "zod";
import { env } from 'node:process';
import { readFile } from "node:fs/promises";
import { resolve} from "node:path";

const MAX_PORT = 65535;
const MIN_PORT = 1;

const configSchema = z.object({
  port: z.coerce.number().int().min(MIN_PORT).max(MAX_PORT).default(1337),
  keyPath: z.string().refine(async (keyPath) => {
    console.log(resolve(keyPath))

    return readFile(resolve(keyPath))
  }),
  certPath: z.string().refine(async (certPath) => {
    return readFile(resolve(certPath))
  }),
}).transform((config) => {
  const { keyPath, certPath,...rest } = config;

  return {
    ...rest,
    key: keyPath,
    cert: certPath,
  }
});

export type Config = z.infer<typeof configSchema>

export default function parseConfig () {
  return configSchema.parseAsync({
    port: env.PORT,
    keyPath: env.CERT_KEY_PATH,
    certPath: env.CERT_CRT_PATH,
  });
}
