import { NextRequest, NextResponse } from 'next/server'
import { getOAuthClient } from '../../../lib/googleDrive'
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  if (!code) return new NextResponse('Missing code', { status: 400 })
  const oauth2Client = getOAuthClient()
  const { tokens } = await oauth2Client.getToken(code)
  return NextResponse.json({ tokens })
}