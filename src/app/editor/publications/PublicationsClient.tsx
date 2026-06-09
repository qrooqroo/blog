'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { DayGroup, Article, BatchStat } from './page';

/* ── 상수 ─────────────────────────────────────────────────── */
const TYPE_LABEL: Record<Article['table'], string> = {
  news: '뉴스', insights: '인사이트', papers: '논문',
};
const TYPE_COLOR: Record<Article['table'], string> = {
  news:     'bg-blue-100 text-blue-700',
  insights: 'bg-purple-100 text-purple-700',
  papers:   'bg-emerald-100 text-emerald-700',
};
const GAUGE_FILL: Record<'ok' | 'fail' | 'partial' | 'none' | 'running', string> = {
  ok:      'bg-emerald-400',
  partial: 'bg-amber-400',
  fail:    'bg-red-400',
  none:    'bg-slate-200',
  running: 'bg-indigo-300 animate-pulse',
};
const TABLE_HREF: Record<Article['table'], (slug: string) => string> = {
  news:     slug => `/news/${slug}`,
  insights: slug => `/insights/${slug}`,
  papers:   slug => `/papers/${slug}`,
};

/* ── 타입별 기본 목표 수 (배치 스크립트 TARGET_COUNT) ────── */
const DEFAULT_TARGET: Partial<Record<Article['table'], number>> = {
  papers:   3,
  insights: 7,
  // news: RSS 신규 포스트 전량 처리 — 고정 목표 없음
};

/* ── 게이지 퍼센트 계산 ─────────────────────────────────── */
function calcPct(stat: BatchStat | undefined, type: Article['table'], articleCount: number): number {
  const target = DEFAULT_TARGET[type];
  if (!stat) {
    if (target) return Math.min(100, Math.round((articleCount / target) * 100));
    return articleCount > 0 ? 100 : 0;
  }
  if (stat.result === 'running') return 50;
  const written = stat.written ?? 0;
  const total   = stat.total ?? target;
  if (total) return Math.min(100, Math.round((written / total) * 100));
  return stat.result === 'ok' ? 100 : stat.result === 'fail' ? 0 : 50;
}

function statResult(stat: BatchStat | undefined, articleCount: number): 'ok' | 'fail' | 'partial' | 'none' | 'running' {
  if (!stat) return articleCount > 0 ? 'ok' : 'none';
  return stat.result;
}

/* ── 기사 행 ─────────────────────────────────────────────── */
function ArticleRow({ article }: { article: Article }) {
  const [published, setPublished] = useState(article.published);
  const [loading, setLoading] = useState(false);

  const togglePublished = async () => {
    setLoading(true);
    try {
      await fetch('/api/publications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: article.id, table: article.table, published: !published }),
      });
      setPublished(p => !p);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3 py-2 px-4 hover:bg-slate-50">
      {/* 제목 */}
      <Link
        href={TABLE_HREF[article.table](article.slug)}
        target="_blank"
        className="flex-1 min-w-0 text-sm text-slate-700 hover:text-indigo-600 truncate"
      >
        {article.title}
      </Link>

      {/* Supabase 동기화 */}
      <span className={`flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded ${
        article.synced ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-500'
      }`}>
        {article.synced ? 'DB ✓' : 'DB ✗'}
      </span>

      {/* 발행 토글 */}
      <button
        onClick={togglePublished}
        disabled={loading}
        className={`flex-shrink-0 text-[10px] font-medium px-2 py-0.5 rounded border transition-colors ${
          published
            ? 'border-indigo-200 bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
            : 'border-slate-200 bg-white text-slate-400 hover:bg-slate-100'
        }`}
      >
        {loading ? '…' : published ? '발행됨' : '미발행'}
      </button>

    </div>
  );
}

/* ── 타입별 게이지 행 ────────────────────────────────────── */
function TypeGauge({ type, stat, articles }: {
  type: Article['table'];
  stat: BatchStat | undefined;
  articles: Article[];
}) {
  const [open, setOpen] = useState(false);
  const pct = calcPct(stat, type, articles.length);
  const result = statResult(stat, articles.length);
  const fillColor = GAUGE_FILL[result];
  const target = DEFAULT_TARGET[type];

  const label = (() => {
    if (stat?.result === 'running') return stat.startedAt ?? '';
    const written = stat?.written;
    const total   = stat?.total ?? target;
    if (written != null && total != null) return `${written}/${total}`;
    if (written != null) return `${written}개`;
    if (stat?.result === 'fail') return '실패';
    if (articles.length > 0 && target) return `${articles.length}/${target}`;
    if (articles.length > 0) return `${articles.length}개`;
    return '미실행';
  })();

  const hasList = articles.length > 0;

  return (
    <div>
      <button
        onClick={() => hasList && setOpen(o => !o)}
        className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors ${
          hasList ? 'hover:bg-slate-50 cursor-pointer' : 'cursor-default'
        }`}
      >
        {/* 타입 배지 */}
        <span className={`flex-shrink-0 text-[11px] font-bold w-14 text-center py-0.5 rounded ${TYPE_COLOR[type]}`}>
          {TYPE_LABEL[type]}
        </span>

        {/* 게이지 바 */}
        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${fillColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* 퍼센트 + 레이블 */}
        <div className="flex-shrink-0 flex items-center gap-2 min-w-[80px] justify-end">
          <span className={`text-xs font-semibold tabular-nums ${
            result === 'ok'      ? 'text-emerald-600' :
            result === 'fail'    ? 'text-red-500' :
            result === 'partial' ? 'text-amber-600' :
            result === 'running' ? 'text-indigo-500' :
            'text-slate-400'
          }`}>
            {result === 'running' ? '실행 중' : result !== 'none' ? `${pct}%` : ''}
          </span>
          <span className="text-xs text-slate-500">{label}</span>
          {hasList && (
            <span className="text-slate-300 text-xs w-3">{open ? '▲' : '▼'}</span>
          )}
        </div>

        {/* 작동 시각 */}
        {(stat?.startedAt || stat?.finishedAt) && (
          <span className="flex-shrink-0 text-[10px] text-slate-400 tabular-nums whitespace-nowrap">
            {stat.startedAt ?? '?'}
            {stat.finishedAt && stat.finishedAt !== stat.startedAt ? `–${stat.finishedAt}` : ''}
          </span>
        )}

        {/* 에러 툴팁 */}
        {stat?.error && (
          <span title={stat.error} className="flex-shrink-0 text-red-400 text-xs">⚠</span>
        )}
      </button>

      {/* 기사 목록 */}
      {open && hasList && (
        <div className="border-t border-slate-100 bg-white divide-y divide-slate-50">
          {articles.map(a => (
            <ArticleRow key={`${a.table}-${a.id}`} article={a} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── 날짜 섹션 ──────────────────────────────────────────── */
function DaySection({ day }: { day: DayGroup }) {
  const today = new Date();
  today.setHours(today.getHours() + 9);
  const isToday = day.date === today.toISOString().slice(0, 10);

  const byType = (t: Article['table']) => day.articles.filter(a => a.table === t);

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      {/* 날짜 헤더 */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-200">
        <span className="text-sm font-bold text-slate-700">{day.date}</span>
        {isToday && (
          <span className="text-[10px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded font-semibold">오늘</span>
        )}
        <span className="ml-auto flex items-center gap-1.5">
          {day.batch.sync ? (
            <>
              <span className={`text-[10px] ${day.batch.sync.result === 'ok' ? 'text-emerald-600' : day.batch.sync.result === 'running' ? 'text-indigo-500 animate-pulse' : 'text-red-500'}`}>
                동기화 {day.batch.sync.result === 'ok' ? '✓' : day.batch.sync.result === 'running' ? '…' : '✗'}
              </span>
              {day.batch.sync.startedAt && (
                <span className="text-[10px] text-slate-400 tabular-nums">
                  {day.batch.sync.startedAt}{day.batch.sync.finishedAt && day.batch.sync.finishedAt !== day.batch.sync.startedAt ? `–${day.batch.sync.finishedAt}` : ''}
                </span>
              )}
            </>
          ) : (
            <span className="text-[10px] text-slate-300">동기화 —</span>
          )}
        </span>
      </div>

      {/* 3개 게이지 */}
      <div className="divide-y divide-slate-100">
        <TypeGauge type="papers"   stat={day.batch.papers}   articles={byType('papers')}   />
        <TypeGauge type="insights" stat={day.batch.insights} articles={byType('insights')} />
        <TypeGauge type="news"     stat={day.batch.news}     articles={byType('news')}     />
      </div>
    </div>
  );
}

/* ── 메인 ──────────────────────────────────────────────── */
export default function PublicationsClient({
  days: initialDays,
  stats,
}: {
  days: DayGroup[];
  stats: { news: number; insights: number; papers: number };
}) {
  const [days] = useState(initialDays);
  const [filter, setFilter] = useState<'all' | Article['table']>('all');
  const [search, setSearch] = useState('');

  const filteredDays = useMemo(() => {
    return days.map(d => ({
      ...d,
      articles: d.articles.filter(a => {
        if (filter !== 'all' && a.table !== filter) return false;
        if (search && !a.title.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      }),
    })).filter(d =>
      d.articles.length > 0 ||
      Object.keys(d.batch).length > 0
    );
  }, [days, filter, search]);

  const TABS = [
    { key: 'all',      label: `전체 ${stats.news + stats.insights + stats.papers}` },
    { key: 'news',     label: `뉴스 ${stats.news}` },
    { key: 'insights', label: `인사이트 ${stats.insights}` },
    { key: 'papers',   label: `논문 ${stats.papers}` },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* 상단 바 */}
      <div className="sticky top-0 z-50 bg-white border-b border-slate-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Link href="/editor" className="text-slate-400 hover:text-slate-600 text-sm transition-colors">
            ← 에디터
          </Link>
          <span className="text-slate-200">|</span>
          <span className="text-sm font-bold text-slate-700">발행 내역</span>
          <div className="ml-auto flex items-center gap-2">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="제목 검색…"
              className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 w-44 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* 탭 필터 */}
        <div className="flex gap-1">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 날짜별 섹션 */}
        {filteredDays.map(day => (
          <DaySection key={day.date} day={day} />
        ))}
      </div>
    </div>
  );
}
