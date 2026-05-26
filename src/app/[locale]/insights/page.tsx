export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllInsights } from '@/lib/insights';
import { getDictionary, isValidLocale, defaultLocale } from '@/lib/i18n/dictionaries';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : defaultLocale;
  const isKo = locale === 'ko';
  return {
    title: { absolute: isKo ? '인사이트 | AI Insight Note' : 'Insights | AI Insight Note' },
    description: isKo
      ? 'AI, 블록체인, 바이오테크, 양자컴퓨터 등 최신 기술 동향과 심층 분석을 담은 인사이트 아카이브.'
      : 'In-depth analysis of AI, blockchain, biotech, and quantum computing trends.',
    alternates: { canonical: `https://aiinsightnote.com/${locale}/insights` },
    openGraph: {
      type: 'website',
      url: `https://aiinsightnote.com/${locale}/insights`,
      title: isKo ? '인사이트 | AI Insight Note' : 'Insights | AI Insight Note',
      siteName: 'AI Insight Note',
      locale: isKo ? 'ko_KR' : 'en_US',
    },
  };
}

export default async function InsightsPage({ params }: Props) {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : defaultLocale;
  const dict = getDictionary(locale);
  const insights = await getAllInsights();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900">{dict.pages.insights.title}</h1>
        <p className="text-sm text-slate-400 mt-1">{dict.pages.insights.subtitle}</p>
      </div>

      {insights.length === 0 ? (
        <p className="text-sm text-slate-400 py-16 text-center">{dict.pages.insights.empty}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {insights.map(insight => {
            const isEn = locale === 'en';
            const title = (isEn && insight.title_en) ? insight.title_en : insight.title;
            const excerpt = (isEn && insight.excerpt_en) ? insight.excerpt_en : insight.excerpt;
            const slug = insight.slug;
            return (
              <Link
                key={insight.id}
                href={`/${locale}/insights/${slug}`}
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
                    {title}
                  </h2>
                  <p className="text-sm text-slate-500 leading-relaxed">{excerpt}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
