import { promises as fs } from 'fs'
import path from 'path'
export async function ensureDataDirs() {
  const dataDir = process.env.DATA_DIR || path.resolve(process.cwd(), 'data')
  const uploadsDir = path.join(dataDir, 'uploads')
  await fs.mkdir(dataDir, { recursive: true })
  await fs.mkdir(uploadsDir, { recursive: true })
}