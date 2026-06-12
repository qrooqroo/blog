import sql from '@/lib/supabase';
import postgres from 'postgres';
import PublicationsClient from '@/app/editor/publications/PublicationsClient';
import type { Article, BatchStat, BatchStatus, DayGroup } from '@/app/editor/publications/page';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '발행 관리 | AI Insight Note',
  robots: { index: false, follow: false },
};

async function fetchBatchRuns(): Promise<Record<string, BatchStatus>> {
  const toKstDate = (iso: string) => {
    const d = new Date(iso);
    d.setHours(d.getHours() + 9);
    return d.toISOString().slice(0, 10);
  };
  const toKstTime = (iso: string | null) => {
    if (!iso) return undefined;
    const d = new Date(iso);
    d.setHours(d.getHours() + 9);
    return d.toISOString().slice(11, 16);
  };

  try {
    const rows = await sql<{
      id: number;
      batch_type: string;
      started_at: string;
      finished_at: string | null;
      result: string | null;
      written: number | null;
      total: number | null;
      error_message: string | null;
    }[]>`
      SELECT id, batch_type, started_at, finished_at, result, written, total, error_message
      FROM batch_runs
      WHERE started_at >= NOW() - INTERVAL '61 days'
      ORDER BY started_at ASC
    `;

    const byDate: Record<string, BatchStatus> = {};

    for (const row of rows) {
      const date = toKstDate(row.started_at);
      if (!byDate[date]) byDate[date] = {};

      const startedAt  = toKstTime(row.started_at);
      const finishedAt = toKstTime(row.finished_at);
      const result = (row.result ?? (row.finished_at ? 'fail' : 'running')) as BatchStat['result'];

      if (row.batch_type === 'sync') {
        byDate[date].sync = { result: result as 'ok' | 'fail' | 'running', startedAt, finishedAt };
      } else if (row.batch_type === 'papers' || row.batch_type === 'news' || row.batch_type === 'insights') {
        byDate[date][row.batch_type] = {
          result, written: row.written ?? undefined, total: row.total ?? undefined,
          error: row.error_message ?? undefined, startedAt, finishedAt,
        };
      }
    }

    return byDate;
  } catch {
    return {};
  }
}

async function fetchSupabaseIds(): Promise<Record<string, Set<number>>> {
  try {
    const supa = postgres(
      'postgresql://postgres.guqtsvngervemiksrqgc:7Z0HTWrS4kuN58lf@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres',
      { max: 1, ssl: 'require', prepare: false, connect_timeout: 5 }
    );
    const [sNews, sInsights, sPapers] = await Promise.all([
      supa`SELECT id FROM news` as Promise<{id:number}[]>,
      supa`SELECT id FROM insights` as Promise<{id:number}[]>,
      supa`SELECT id FROM papers` as Promise<{id:number}[]>,
    ]);
    await supa.end();
    return {
      news:     new Set(sNews.map(r => r.id)),
      insights: new Set(sInsights.map(r => r.id)),
      papers:   new Set(sPapers.map(r => r.id)),
    };
  } catch {
    return { news: new Set(), insights: new Set(), papers: new Set() };
  }
}

async function fetchArticles(): Promise<Article[]> {
  const [[news, insights, papers], supaIds] = await Promise.all([
    Promise.all([
      sql`SELECT id, title, slug, published, created_at FROM news ORDER BY created_at DESC LIMIT 500` as Promise<any[]>,
      sql`SELECT id, title, slug, published, created_at FROM insights ORDER BY created_at DESC` as Promise<any[]>,
      sql`SELECT id, title, slug, published, created_at FROM papers ORDER BY created_at DESC` as Promise<any[]>,
    ]),
    fetchSupabaseIds(),
  ]);

  const toKst = (iso: string) => {
    const d = new Date(iso);
    d.setHours(d.getHours() + 9);
    return d.toISOString().slice(0, 10);
  };

  const map = (rows: any[], table: Article['table']): Article[] =>
    rows.map(r => ({
      id: r.id,
      table,
      title: r.title ?? '(제목 없음)',
      slug: r.slug ?? '',
      published: r.published ?? true,
      created_at: r.created_at,
      kst_date: toKst(r.created_at),
      synced: supaIds[table]?.has(r.id) ?? false,
    }));

  return [
    ...map(news, 'news'),
    ...map(insights, 'insights'),
    ...map(papers, 'papers'),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export default async function PublicationsPage() {
  const [articles, batchRuns] = await Promise.all([fetchArticles(), fetchBatchRuns()]);

  const today = new Date();
  today.setHours(today.getHours() + 9);
  const todayStr = today.toISOString().slice(0, 10);
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() - 60);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  const dateSet = new Set<string>();
  dateSet.add(todayStr);
  articles.forEach(a => { if (a.kst_date >= cutoffStr) dateSet.add(a.kst_date); });
  Object.keys(batchRuns).forEach(d => { if (d >= cutoffStr) dateSet.add(d); });

  const days: DayGroup[] = Array.from(dateSet)
    .sort((a, b) => b.localeCompare(a))
    .map(date => ({
      date,
      batch: batchRuns[date] ?? {},
      articles: articles.filter(a => a.kst_date === date),
    }));

  const stats = {
    news:     articles.filter(a => a.table === 'news').length,
    insights: articles.filter(a => a.table === 'insights').length,
    papers:   articles.filter(a => a.table === 'papers').length,
  };

  return <PublicationsClient days={days} stats={stats} backHref="/analysis" backLabel="분석" />;
}
