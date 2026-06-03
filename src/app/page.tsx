export const dynamic = 'force-dynamic';

import { headers } from 'next/headers';
import Script from 'next/script';
import Link from 'next/link';
import NavigationSpinner from '@/components/NavigationSpinner';
import HomeSiteNav from '@/components/HomeSiteNav';
import Footer from '@/components/Footer';
import { getAllInsights } from '@/lib/insights';
import { getRecentPapers } from '@/lib/papers';
import SiteHeader from '@/components/SiteHeader';
import InsightSlider from '@/components/InsightSlider';
import MarketBar from '@/components/MarketBar';
import WeatherWidget from '@/components/WeatherWidget';
import CalendarWidget from '@/components/CalendarWidget';
import GithubTrendingWidget from '@/components/GithubTrendingWidget';
import HuggingFaceWidget from '@/components/HuggingFaceWidget';
import RedditMLWidget from '@/components/RedditMLWidget';
import HackerNewsAIWidget from '@/components/HackerNewsAIWidget';
import LobstersWidget from '@/components/LobstersWidget';
import TheHackerNewsWidget from '@/components/TheHackerNewsWidget';
import BleepingComputerWidget from '@/components/BleepingComputerWidget';
import AhnLabASECWidget from '@/components/AhnLabASECWidget';
import RaonSecureWidget from '@/components/RaonSecureWidget';
import XFeedWidget from '@/components/XFeedWidget';
import HNAILaunchWidget from '@/components/HNAILaunchWidget';
import LlmLeaderboardWidget from '@/components/LlmLeaderboardWidget';
import AiLabNewsWidget from '@/components/AiLabNewsWidget';
import WidgetsPanel from '@/components/WidgetsPanel';
import WidgetCarousel from '@/components/WidgetCarousel';
import { Suspense } from 'react';
import { isValidLocale, defaultLocale } from '@/lib/i18n/dictionaries';

export default async function HomePage() {
  const headersList = await headers();
  const raw = headersList.get('x-locale') ?? defaultLocale;
  const locale = isValidLocale(raw) ? raw : defaultLocale;
  const isEn = locale === 'en';

  const [insights, papers] = await Promise.all([
    getAllInsights(),
    getRecentPapers(3),
  ]);

  return (
    <>
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4600038940266134"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      <NavigationSpinner />
      <HomeSiteNav locale={locale} />
      <main className="max-w-5xl mx-auto px-4 py-10 pb-16">
        <div className="space-y-10">
          <div className="flex flex-col">
            <SiteHeader locale={locale} />
            <Suspense fallback={null}>
              <AiLabNewsWidget locale={locale} />
            </Suspense>
          </div>

          {insights.length > 0 && (
            <div className="-mt-10">
              <InsightSlider insights={insights.slice(0, 6)} locale={locale} />
            </div>
          )}

          <WidgetsPanel locale={locale}>
            <MarketBar />
            <div className="flex flex-col sm:flex-row gap-4 items-stretch">
              <WeatherWidget />
              <CalendarWidget />
            </div>
          </WidgetsPanel>

          {papers.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Col 1: Recent Papers */}
              <div className="flex flex-col gap-3">
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
                    </Link>
                  );
                })}
              </div>
              {/* Col 2: HN AI Launch */}
              <Suspense fallback={<div className="bg-white border border-slate-200 rounded-xl p-4 animate-pulse" />}>
                <HNAILaunchWidget locale={locale} />
              </Suspense>
              {/* Col 3: LLM Leaderboard */}
              <LlmLeaderboardWidget locale={locale} />
            </div>
          )}

          {/* Carousel: GitHub AI 트렌드 / AI 모델 트렌드 / Dev.to / Reddit */}
          <div className="-mt-5">
            <div className="rounded-2xl bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border border-indigo-100 shadow-lg shadow-indigo-100/60 px-2 pt-2 pb-3">
                <div className="text-center mb-2">
                  <span className="text-sm font-bold text-slate-700">
                    {isEn ? 'Trending Now' : '인기 트렌드'}
                  </span>
                </div>
                <WidgetCarousel>
                  <Suspense fallback={<div className="bg-white border border-slate-200 rounded-xl p-4 animate-pulse h-64" />}>
                    <GithubTrendingWidget locale={locale} />
                  </Suspense>
                  <Suspense fallback={<div className="bg-white border border-slate-200 rounded-xl p-4 animate-pulse h-64" />}>
                    <HuggingFaceWidget locale={locale} />
                  </Suspense>
                  <Suspense fallback={<div className="bg-white border border-slate-200 rounded-xl p-4 animate-pulse h-64" />}>
                    <RedditMLWidget locale={locale} />
                  </Suspense>
                  <Suspense fallback={<div className="bg-white border border-slate-200 rounded-xl p-4 animate-pulse h-64" />}>
                    <HackerNewsAIWidget locale={locale} />
                  </Suspense>
                  <Suspense fallback={<div className="bg-white border border-slate-200 rounded-xl p-4 animate-pulse h-64" />}>
                    <LobstersWidget locale={locale} />
                  </Suspense>
                </WidgetCarousel>
            </div>
          </div>

          {/* 보안 트렌드 */}
          <div>
            <div className="rounded-2xl bg-gradient-to-r from-red-50 via-orange-50 to-amber-50 border border-red-100 shadow-lg shadow-red-100/60 px-2 pt-2 pb-3">
              <div className="text-center mb-2">
                <span className="text-sm font-bold text-slate-700">
                  {isEn ? 'Security Trends' : '보안 트렌드'}
                </span>
              </div>
              <WidgetCarousel>
                <Suspense fallback={<div className="bg-white border border-slate-200 rounded-xl p-4 animate-pulse h-64" />}>
                  <TheHackerNewsWidget locale={locale} />
                </Suspense>
                <Suspense fallback={<div className="bg-white border border-slate-200 rounded-xl p-4 animate-pulse h-64" />}>
                  <BleepingComputerWidget locale={locale} />
                </Suspense>
                <Suspense fallback={<div className="bg-white border border-slate-200 rounded-xl p-4 animate-pulse h-64" />}>
                  <AhnLabASECWidget locale={locale} />
                </Suspense>
                {locale === 'ko' && (
                  <Suspense fallback={<div className="bg-white border border-slate-200 rounded-xl p-4 animate-pulse h-64" />}>
                    <RaonSecureWidget locale={locale} />
                  </Suspense>
                )}
              </WidgetCarousel>
            </div>
          </div>

          {/* X 피드 */}
          <XFeedWidget locale={locale} />

        </div>
      </main>
      <Footer />
    </>
  );
}
