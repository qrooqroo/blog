import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;

  if (!file) return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type))
    return NextResponse.json({ error: '지원하지 않는 형식입니다. (jpg, png, webp, gif)' }, { status: 400 });
  if (file.size > MAX_SIZE)
    return NextResponse.json({ error: '파일 크기는 10MB 이하여야 합니다.' }, { status: 400 });

  const ext      = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const filename = `${randomUUID()}.${ext}`;
  const uploadDir = join(process.cwd(), 'public', 'uploads');

  await mkdir(uploadDir, { recursive: true });
  await writeFile(join(uploadDir, filename), Buffer.from(await file.arrayBuffer()));

  return NextResponse.json({ url: `/uploads/${filename}` });
}
