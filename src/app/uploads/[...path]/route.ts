import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import { join, extname } from 'path';

const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
};

interface Params { path: string[] }

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<Params> }
) {
  const { path } = await params;
  const filename = path.join('/');
  const filePath = join(process.cwd(), 'public', 'uploads', filename);

  try {
    const [buffer, stats] = await Promise.all([readFile(filePath), stat(filePath)]);
    const mime = MIME[extname(filename).toLowerCase()] ?? 'application/octet-stream';

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': mime,
        'Content-Length': stats.size.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
