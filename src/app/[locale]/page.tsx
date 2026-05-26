export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getAllInsights } from '@/lib/insights';
import { getRecentPapers } from '@/lib/papers';
import { formatDate } from '@/lib/format';
import SiteHeader from '@/components/SiteHeader';
import InsightSlider from '@/components/InsightSlider';
import MarketBar from '@/components/MarketBar';
import WeatherWidget from '@/components/WeatherWidget';
import CalendarWidget from '@/components/CalendarWidget';
import AiStocksWidget from '@/components/AiStocksWidget';
import GithubTrendingWidget from '@/components/GithubTrendingWidget';
import HuggingFaceWidget from '@/components/HuggingFaceWidget';
import RedditMLWidget from '@/components/RedditMLWidget';
import HNAILaunchWidget from '@/components/HNAILaunchWidget';
import WidgetsPanel from '@/components/WidgetsPanel';
import { Suspense } from 'react';
import { isValidLocale, defaultLocale } from '@/lib/i18n/dictionaries';

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: Props) {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : defaultLocale;
  const isEn = locale === 'en';

  const [insights, papers] = await Promise.all([
    getAllInsights(),
    getRecentPapers(3),
  ]);

  return (
    <div className="space-y-10">
      <SiteHeader />

      {/* 슬라이더(2/3) + 최신 목록(1/3) */}
      {insights.length > 0 && (
        <div className="flex flex-col md:flex-row gap-5 items-stretch">
          <div className="w-full md:w-2/3 md:flex-shrink-0">
            <InsightSlider insights={insights.slice(0, 6)} locale={locale} />
          </div>
          <div className="hidden md:flex flex-1 flex-col justify-between md:h-[420px]">
            {insights.slice(0, 6).map(ins => {
              const insTitle = (isEn && ins.title_en) ? ins.title_en : ins.title;
              const insSlug = ins.slug;
              return (
                <Link
                  key={ins.id}
                  href={`/${locale}/insights/${insSlug}`}
                  className="group flex gap-3 items-center p-2 rounded-xl hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-slate-200 flex-1"
                >
                  {ins.image && (
                    <img src={ins.image} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                  )}
                  <p className="text-sm font-semibold text-slate-700 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {insTitle}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* 경제지표 + 날씨/달력 (ko 전용) */}
      <WidgetsPanel>
        <MarketBar />
        <div className="flex flex-col sm:flex-row gap-4 items-stretch">
          <WeatherWidget />
          <CalendarWidget />
        </div>
      </WidgetsPanel>

      {/* 논문 분석 목록 */}
      {papers.length > 0 && (
        <div className="flex gap-4">
          <div className="w-full md:w-1/3 flex flex-col gap-3">
            {papers.map(paper => {
              const title = (isEn && paper.title_en) ? paper.title_en : paper.title;
              const excerpt = (isEn && paper.excerpt_en) ? paper.excerpt_en : paper.excerpt;
              return (
                <Link
                  key={paper.id}
                  href={`/${locale}/papers/${paper.slug}`}
                  className="group bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md hover:border-indigo-200 transition-all flex flex-col gap-2"
                >
                  <p className="text-sm font-bold text-slate-800 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {title}
                  </p>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{excerpt}</p>
                  <p className="text-xs text-slate-400 mt-auto">{formatDate(paper.date)}</p>
                </Link>
              );
            })}
          </div>
          <div className="hidden md:flex md:w-2/3 flex-col gap-3">
            <Suspense fallback={<div className="bg-white border border-slate-200 rounded-xl p-4 h-20 animate-pulse" />}>
              <AiStocksWidget />
            </Suspense>
            <div className="grid grid-cols-2 gap-3 flex-1">
              <Suspense fallback={<div className="bg-white border border-slate-200 rounded-xl p-4 animate-pulse" />}>
                <GithubTrendingWidget locale={locale} />
              </Suspense>
              <Suspense fallback={<div className="bg-white border border-slate-200 rounded-xl p-4 animate-pulse" />}>
                <HuggingFaceWidget locale={locale} />
              </Suspense>
              <Suspense fallback={<div className="bg-white border border-slate-200 rounded-xl p-4 animate-pulse" />}>
                <RedditMLWidget locale={locale} />
              </Suspense>
              <Suspense fallback={<div className="bg-white border border-slate-200 rounded-xl p-4 animate-pulse" />}>
                <HNAILaunchWidget locale={locale} />
              </Suspense>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
