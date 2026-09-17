import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const { Pool } = pg

const migrationFiles = ['001_init.sql']

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to run migrations.')
}

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const sqlDir = path.resolve(currentDir, '../sql')
const pool = new Pool({ connectionString: databaseUrl, max: 1 })

try {
  await pool.query(
    'create table if not exists schema_migrations (file text primary key, applied_at timestamptz not null default now())',
  )
  for (const file of migrationFiles) {
    const applied = await pool.query('select 1 from schema_migrations where file = $1', [file])
    if (applied.rowCount) {
      console.log(`Skipping ${file}`)
      continue
    }
    const sql = await readFile(path.join(sqlDir, file), 'utf8')
    const client = await pool.connect()
    try {
      console.log(`Running ${file}`)
      await client.query('begin')
      await client.query(sql)
      await client.query('insert into schema_migrations (file) values ($1)', [file])
      await client.query('commit')
      console.log(`Finished ${file}`)
    } catch (error) {
      await client.query('rollback')
      throw error
    } finally {
      client.release()
    }
  }
  console.log('Migrations complete.')
} finally {
  await pool.end()
}
