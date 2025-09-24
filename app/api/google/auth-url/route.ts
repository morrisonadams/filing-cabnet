import { NextResponse } from 'next/server'
import { getOAuthClient } from '../../../lib/googleDrive'
export async function GET() {
  const oauth2Client = getOAuthClient()
  const scopes = ['https://www.googleapis.com/auth/drive.file','https://www.googleapis.com/auth/drive.metadata']
  const url = oauth2Client.generateAuthUrl({ access_type: 'offline', scope: scopes, prompt:'consent' })
  return NextResponse.json({ url })
}