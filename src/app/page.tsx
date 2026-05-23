export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getAllInsights } from '@/lib/insights';
import SiteHeader from '@/components/SiteHeader';
import InsightSlider from '@/components/InsightSlider';
import CryptoTicker from '@/components/CryptoTicker';
import IndexTicker from '@/components/IndexTicker';
import MarketTicker from '@/components/MarketTicker';
import WeatherWidget from '@/components/WeatherWidget';
import CalendarWidget from '@/components/CalendarWidget';

export default async function HomePage() {
  const insights = await getAllInsights();

  return (
    <div className="space-y-10">
      <SiteHeader />

      {/* 슬라이더(2/3) + 최신 목록(1/3) */}
      {insights.length > 0 && (
        <div className="flex gap-5 items-stretch">
          {/* 슬라이더 — 2/3 너비 */}
          <div className="w-2/3 flex-shrink-0">
            <InsightSlider insights={insights.slice(0, 6)} />
          </div>

          {/* 최신 인사이트 목록 — 1/3 너비, 슬라이더와 동일 높이 */}
          <div className="flex-1 flex flex-col justify-between" style={{ height: '420px' }}>
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

      {/* 지수 + 참고지표 + 코인 티커 */}
      <div className="space-y-4">
        <IndexTicker />
        <MarketTicker />
        <CryptoTicker />
      </div>

      {/* 날씨 위젯 + 달력 */}
      <div className="flex gap-4 items-stretch">
        <WeatherWidget />
        <CalendarWidget />
      </div>

    </div>
  );
}
