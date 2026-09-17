import pg from 'pg'
import type { AppConfig } from './config.js'

const { Pool } = pg

export interface DbClient {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    text: string,
    params?: unknown[],
  ): Promise<{ rows: T[]; rowCount: number | null }>
  end(): Promise<void>
}

export function createPool(config: Pick<AppConfig, 'DATABASE_URL'>): DbClient {
  const pool = new Pool({ connectionString: config.DATABASE_URL, max: 10 })
  return {
    async query(text, params) {
      const result = await pool.query(text, params as never)
      return { rows: result.rows as never, rowCount: result.rowCount }
    },
    end() {
      return pool.end()
    },
  }
}
