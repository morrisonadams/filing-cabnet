import { promises as fs } from 'fs'
import path from 'path'
export type RecordItem = {
  id: string
  filename: string
  path: string
  createdAt: string
  title?: string
  category?: string
  tags?: string[]
  entities?: string[]
  summary?: string
  driveFileId?: string
}
export type DB = { records: RecordItem[] }
function dbPath() {
  const dataDir = process.env.DATA_DIR || path.resolve(process.cwd(), 'data')
  return path.join(dataDir, 'records.json')
}
export async function getDB(): Promise<DB> {
  const p = dbPath()
  try {
    const raw = await fs.readFile(p, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return { records: [] }
  }
}
export async function saveDB(db: DB) {
  const p = dbPath()
  await fs.writeFile(p, JSON.stringify(db, null, 2), 'utf-8')
}