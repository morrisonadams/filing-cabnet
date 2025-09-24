import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

const MIME_MAP: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.heic': 'image/heic',
  '.pdf': 'application/pdf',
};

function resolveUploadsPath() {
  const dataDir = process.env.DATA_DIR || path.resolve(process.cwd(), 'data');
  return path.resolve(path.join(dataDir, 'uploads'));
}

function contentTypeFor(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_MAP[ext] || 'application/octet-stream';
}

export const runtime = 'nodejs';

export async function GET(
  _req: NextRequest,
  { params }: { params: { path?: string[] } }
) {
  const segments = params.path || [];
  if (segments.length === 0 || segments[0] !== 'uploads') {
    return new NextResponse('Not found', { status: 404 });
  }
  const uploadsRoot = resolveUploadsPath();
  const relativeSegments = segments.slice(1);
  const normalizedRoot = uploadsRoot.endsWith(path.sep) ? uploadsRoot : uploadsRoot + path.sep;
  if (relativeSegments.length === 0) {
    return new NextResponse('Not found', { status: 404 });
  }
  const requestedPath = path.join(uploadsRoot, ...relativeSegments);
  const resolved = path.resolve(requestedPath);
  if (!resolved.startsWith(normalizedRoot)) {
    return new NextResponse('Not found', { status: 404 });
  }
  try {
    const stat = await fs.stat(resolved);
    if (!stat.isFile()) {
      return new NextResponse('Not found', { status: 404 });
    }
    const data = await fs.readFile(resolved);
    return new NextResponse(data, {
      headers: {
        'Content-Type': contentTypeFor(resolved),
        'Content-Length': stat.size.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new NextResponse('Not found', { status: 404 });
  }
}
