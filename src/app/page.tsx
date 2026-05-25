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
import { Suspense } from 'react';

export default async function HomePage() {
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
            <InsightSlider insights={insights.slice(0, 6)} />
          </div>
          <div className="hidden md:flex flex-1 flex-col justify-between md:h-[420px]">
            {insights.slice(0, 6).map(ins => (
              <Link
                key={ins.id}
                href={`/insights/${ins.slug}`}
                className="group flex gap-3 items-center p-2 rounded-xl hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-slate-200 flex-1"
              >
                {ins.image && (
                  <img src={ins.image} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                )}
                <p className="text-sm font-semibold text-slate-700 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
                  {ins.title}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 통합 마켓 바 */}
      <MarketBar />

      {/* 날씨 위젯 + 달력 */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch">
        <WeatherWidget />
        <CalendarWidget />
      </div>

      {/* 논문 분석 목록 + 빈 공간 */}
      {papers.length > 0 && (
        <div className="flex gap-4">
          <div className="w-full md:w-1/3 flex flex-col gap-3">
            {papers.map(paper => (
              <Link
                key={paper.id}
                href={`/papers/${paper.slug}`}
                className="group bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md hover:border-indigo-200 transition-all flex flex-col gap-2"
              >
                <p className="text-sm font-bold text-slate-800 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
                  {paper.title}
                </p>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{paper.excerpt}</p>
                <p className="text-xs text-slate-400 mt-auto">{formatDate(paper.date)}</p>
              </Link>
            ))}
          </div>
          <div className="hidden md:flex md:w-2/3 flex-col gap-3">
            <Suspense fallback={<div className="bg-white border border-slate-200 rounded-xl p-4 h-20 animate-pulse" />}>
              <AiStocksWidget />
            </Suspense>
            <div className="grid grid-cols-2 gap-3 flex-1">
              <Suspense fallback={<div className="bg-white border border-slate-200 rounded-xl p-4 animate-pulse" />}>
                <GithubTrendingWidget />
              </Suspense>
              <Suspense fallback={<div className="bg-white border border-slate-200 rounded-xl p-4 animate-pulse" />}>
                <HuggingFaceWidget />
              </Suspense>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
