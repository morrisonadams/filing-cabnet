import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('query') || '').toLowerCase();
  const db = await getDB();
  const items = db.records.filter(r => {
    if (!q) return true;
    const hay = [
      r.title || '',
      r.filename || '',
      (r.tags || []).join(' '),
      (r.entities || []).join(' '),
      r.summary || ''
    ].join(' ').toLowerCase();
    return hay.includes(q);
  });
  return NextResponse.json({ items });
}