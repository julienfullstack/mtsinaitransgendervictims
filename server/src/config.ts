import { z } from 'zod'

const schema = z.object({
  DATABASE_URL: z.string().min(1),
  HOST: z.string().default('0.0.0.0'),
  PORT: z.coerce.number().default(3001),
  /** Comma separated list of origins allowed to call the API. */
  CORS_ORIGINS: z.string().default('http://localhost:5317'),
})

export type AppConfig = z.infer<typeof schema> & { corsOrigins: string[] }

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const parsed = schema.parse({
    DATABASE_URL: env.DATABASE_URL,
    HOST: env.HOST,
    PORT: env.PORT,
    CORS_ORIGINS: env.CORS_ORIGINS,
  })
  return {
    ...parsed,
    corsOrigins: parsed.CORS_ORIGINS.split(',')
      .map((o) => o.trim())
      .filter(Boolean),
  }
}
