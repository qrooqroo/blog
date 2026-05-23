import { NextRequest, NextResponse } from 'next/server';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const days = Math.min(parseInt(searchParams.get('days') ?? '30'), 365);
  const since = new Date(Date.now() - days * 86400_000).toISOString();
  // 로컬호스트 IP 제외 조건
  const notLocal = sql`ip NOT IN ('::1', '127.0.0.1') AND ip NOT LIKE '::ffff:127.%'`;

  const [
    summary,
    topDocs,
    catStats,
    referrers,
    dailyTrend,
    recentViews,
  ] = await Promise.all([
    // 전체 요약
    sql`
      SELECT
        COUNT(*)                                          AS total,
        COUNT(*) FILTER (WHERE NOT is_bot)               AS humans,
        COUNT(*) FILTER (WHERE is_bot)                   AS bots,
        ROUND(AVG(duration) FILTER (WHERE NOT is_bot AND duration > 0))::int AS avg_duration,
        COUNT(DISTINCT ip) FILTER (WHERE NOT is_bot)     AS unique_ips
      FROM page_views
      WHERE created_at >= ${since} AND ${notLocal}
    `,

    // 상위 문서 (체류시간 포함)
    sql`
      SELECT
        p.slug,
        d.title,
        COUNT(*) FILTER (WHERE NOT p.is_bot)                   AS views,
        ROUND(AVG(p.duration) FILTER (WHERE NOT p.is_bot AND p.duration > 0))::int AS avg_sec
      FROM page_views p
      LEFT JOIN documents d ON d.id = p.document_id
      WHERE p.created_at >= ${since} AND NOT p.is_bot AND ${notLocal}
      GROUP BY p.slug, d.title
      ORDER BY views DESC
      LIMIT 20
    `,

    // 카테고리별 뷰
    sql`
      SELECT
        c.name  AS category,
        c.slug  AS cat_slug,
        COUNT(*) AS views
      FROM page_views p
      JOIN categories c ON c.id = p.category_id
      WHERE p.created_at >= ${since} AND NOT p.is_bot AND ${notLocal}
      GROUP BY c.id, c.name, c.slug
      ORDER BY views DESC
      LIMIT 15
    `,

    // 접속 경로 (referrer)
    sql`
      SELECT
        COALESCE(NULLIF(TRIM(referrer), ''), '(직접 접속)') AS referrer,
        COUNT(*) AS visits
      FROM page_views
      WHERE created_at >= ${since} AND NOT is_bot AND ${notLocal}
      GROUP BY 1
      ORDER BY visits DESC
      LIMIT 15
    `,

    // 일별 트렌드
    sql`
      SELECT
        DATE(created_at AT TIME ZONE 'Asia/Seoul') AS day,
        COUNT(*) FILTER (WHERE NOT is_bot)  AS humans,
        COUNT(*) FILTER (WHERE is_bot)      AS bots
      FROM page_views
      WHERE created_at >= ${since} AND ${notLocal}
      GROUP BY 1
      ORDER BY 1
    `,

    // 최근 접속 로그 (사람만)
    sql`
      SELECT
        p.slug,
        d.title,
        p.ip,
        p.referrer,
        p.duration,
        p.user_agent,
        p.created_at
      FROM page_views p
      LEFT JOIN documents d ON d.id = p.document_id
      WHERE p.created_at >= ${since} AND NOT p.is_bot AND ${notLocal}
      ORDER BY p.created_at DESC
      LIMIT 50
    `,
  ]);

  return NextResponse.json({
    summary: summary[0],
    topDocs,
    catStats,
    referrers,
    dailyTrend,
    recentViews,
    days,
  });
}
