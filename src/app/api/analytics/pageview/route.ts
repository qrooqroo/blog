import { NextRequest, NextResponse } from 'next/server';
import postgres from 'postgres';
import { isBot } from '@/lib/bot-detect';

const sql = postgres(process.env.DATABASE_URL!);

export async function POST(req: NextRequest) {
  try {
    const { slug, referrer } = await req.json();
    if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 });

    const ua = req.headers.get('user-agent') ?? '';
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? req.headers.get('x-real-ip')
      ?? '::1';

    // 로컬호스트 접속은 기록하지 않음
    if (ip === '::1' || ip === '127.0.0.1' || ip.startsWith('::ffff:127.')) {
      return NextResponse.json({ id: null, skipped: true });
    }

    const bot = isBot(ua);

    // 문서 정보 조회
    const docs = await sql`
      SELECT id, category_id FROM documents WHERE slug = ${slug} LIMIT 1
    `;
    const doc = docs[0] ?? null;

    const [row] = await sql`
      INSERT INTO page_views (slug, document_id, category_id, user_agent, ip, referrer, is_bot)
      VALUES (
        ${slug},
        ${doc?.id ?? null},
        ${doc?.category_id ?? null},
        ${ua},
        ${ip},
        ${referrer ?? ''},
        ${bot}
      )
      RETURNING id
    `;

    return NextResponse.json({ id: row.id, bot });
  } catch (e) {
    console.error('pageview error', e);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
