export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import Link from 'next/link';
import { headers, cookies } from 'next/headers';
import { getAllInsights } from '@/lib/insights';
import { isValidLocale, defaultLocale } from '@/lib/i18n/dictionaries';

async function getLocale() {
  const h = await headers();
  const c = await cookies();
  const raw = h.get('x-locale') ?? c.get('NEXT_LOCALE')?.value ?? defaultLocale;
  return isValidLocale(raw) ? raw : defaultLocale;
}

export const metadata: Metadata = {
  title: { absolute: '인사이트 | AI Insight Note' },
  description: 'AI, 블록체인, 바이오테크, 양자컴퓨터 등 최신 기술 동향과 심층 분석을 담은 인사이트 아카이브.',
  alternates: { canonical: 'https://aiinsightnote.com/insights' },
  openGraph: {
    type: 'website',
    url: 'https://aiinsightnote.com/insights',
    title: '인사이트 | AI Insight Note',
    description: 'AI, 블록체인, 바이오테크, 양자컴퓨터 등 최신 기술 동향과 심층 분석을 담은 인사이트 아카이브.',
    siteName: 'AI Insight Note',
    locale: 'ko_KR',
  },
  twitter: {
    card: 'summary',
    title: '인사이트 | AI Insight Note',
    description: 'AI, 블록체인, 바이오테크, 양자컴퓨터 등 최신 기술 동향과 심층 분석.',
  },
};

export default async function InsightsPage() {
  const [insights, locale] = await Promise.all([getAllInsights(), getLocale()]);
  const isEn = locale === 'en';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900">{isEn ? 'Insights' : '인사이트'}</h1>
        <p className="text-sm text-slate-400 mt-1">
          {isEn ? 'Deep-dive analysis on emerging tech trends' : '최신 기술 방향성과 논문 분석'}
        </p>
      </div>

      {insights.length === 0 ? (
        <p className="text-sm text-slate-400 py-16 text-center">
          {isEn ? 'No articles yet.' : '아직 작성된 글이 없습니다.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {insights.map(insight => (
            <Link
              key={insight.id}
              href={`/insights/${insight.slug}`}
              className="group block bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-indigo-300 hover:shadow-md transition-all"
            >
              {insight.image && (
                <div className="relative h-44 bg-slate-200 overflow-hidden">
                  <img
                    src={insight.image}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
              <div className="p-5">
                <h2 className="text-base font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors mb-2">
                  {isEn ? (insight.title_en ?? insight.title) : insight.title}
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {isEn ? (insight.excerpt_en ?? insight.excerpt) : insight.excerpt}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
