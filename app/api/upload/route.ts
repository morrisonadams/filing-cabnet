import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { promises as fs } from 'fs'
import path from 'path'
import { getDB, saveDB } from '@/lib/db'
import { ensureDataDirs } from '@/lib/fsutils'
import { extractMetadata } from '@/lib/metadata'
import { uploadToDriveIfConfigured } from '@/lib/googleDrive'
export const runtime = 'nodejs'
export async function POST(req: NextRequest) {
  const contentType = req.headers.get('content-type') || ''
  if (!contentType.includes('multipart/form-data')) {
    return new NextResponse('Expected multipart/form-data', { status: 400 })
  }
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const tagsStr = (formData.get('tags') as string) || ''
  const tags = tagsStr.split(',').map(s=>s.trim()).filter(Boolean)
  if (!file) return new NextResponse('No file provided', { status: 400 })
  await ensureDataDirs()
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const id = uuidv4()
  const uploadsDir = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR, 'uploads') : path.resolve(process.cwd(), 'data', 'uploads')
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const filename = `${id}_${safeName}`
  const dest = path.join(uploadsDir, filename)
  await fs.writeFile(dest, buffer)
  const createdAt = new Date().toISOString()
  const relPath = './' + path.relative(process.cwd(), dest).replace(/\\/g,'/')
  const baseRecord = { id, filename: file.name, path: relPath, createdAt, tags } as any
  const enriched = await extractMetadata(baseRecord)
  const driveFileId = await uploadToDriveIfConfigured(dest, enriched)
  const record = { ...enriched, driveFileId }
  const db = await getDB()
  db.records.unshift(record)
  await saveDB(db)
  return NextResponse.json({ ok: true, record })
}