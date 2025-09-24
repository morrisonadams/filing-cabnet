import { google } from 'googleapis'
import { Readable } from 'stream'
import fs from 'fs'
export function getOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID || ''
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || ''
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/google/oauth2callback'
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri)
}
function getAuth() {
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && refreshToken) {
    const oauth2Client = getOAuthClient()
    oauth2Client.setCredentials({ refresh_token: refreshToken })
    return oauth2Client
  }
  const saJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  if (saJson) {
    const creds = saJson.trim().startsWith('{') ? JSON.parse(saJson) : JSON.parse(fs.readFileSync(saJson, 'utf-8'))
    const jwt = new google.auth.JWT(
      creds.client_email,
      undefined,
      creds.private_key,
      ['https://www.googleapis.com/auth/drive']
    )
    return jwt
  }
  return null
}
export async function uploadToDriveIfConfigured(localPath: string, record: any) {
  const auth = getAuth()
  if (!auth) return null
  const drive = google.drive({ version: 'v3', auth })
  const fileName = record.filename || 'scan.jpg'
  const parentId = process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID
  const metadata: any = { name: fileName }
  if (parentId) metadata.parents = [parentId]
  const media = { mimeType: 'image/jpeg', body: fs.createReadStream(localPath) as unknown as Readable }
  try {
    const res = await drive.files.create({ requestBody: metadata, media, fields: 'id' })
    return res.data.id || null
  } catch (e) {
    console.error('Drive upload failed', e)
    return null
  }
}