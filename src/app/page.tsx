export const dynamic = 'force-dynamic';
export const maxDuration = 25; // 부하 시 행을 300초→25초로 캡: 함수 동시성 빠르게 회복

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
import HNAILaunchWidget from '@/components/HNAILaunchWidget';
import LlmLeaderboardWidget from '@/components/LlmLeaderboardWidget';
import AiLabNewsWidget from '@/components/AiLabNewsWidget';
import WidgetsPanel from '@/components/WidgetsPanel';
import WidgetCarousel from '@/components/WidgetCarousel';
import { Suspense } from 'react';
import { isValidLocale, defaultLocale } from '@/lib/i18n/dictionaries';

// ── 자체 인사이트 슬라이더 ─────────────────────────────────────────
async function InsightSliderSection({ locale }: { locale: string }) {
  const insights = await getAllInsights();
  if (insights.length === 0) return null;
  return <InsightSlider insights={insights.slice(0, 6)} locale={locale} />;
}

// ── 최신 논문 분석 (자체 DB) ──────────────────────────────────────
async function LatestPapersSection({ locale }: { locale: string }) {
  const papers = await getRecentPapers(3);
  const isEn = locale === 'en';
  if (papers.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-black text-slate-800">
          {isEn ? 'AI Paper Reviews' : '최신 논문 분석'}
        </h2>
        <Link href="/papers" className="text-xs text-slate-400 hover:text-indigo-500 transition-colors">
          {isEn ? 'View all →' : '전체 보기 →'}
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {papers.map(paper => {
          const title = (isEn && paper.title_en) ? paper.title_en : paper.title;
          const excerpt = (isEn && paper.excerpt_en) ? paper.excerpt_en : paper.excerpt;
          return (
            <Link
              key={paper.id}
              href={`/papers/${paper.slug}`}
              className="group bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md hover:border-indigo-200 transition-all flex flex-col gap-2"
            >
              <p className="text-sm font-bold text-slate-800 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
                {title}
              </p>
              <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{excerpt}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

// ── 홈 페이지 ─────────────────────────────────────────────────────
export default async function HomePage() {
  const headersList = await headers();
  const raw = headersList.get('x-locale') ?? defaultLocale;
  const locale = isValidLocale(raw) ? raw : defaultLocale;
  const isEn = locale === 'en';

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AI Insight Note',
    url: 'https://www.aiinsightnote.com',
    description: 'Claude·GPT·Gemini 등 LLM 모델·API 가격 비교와, AI·반도체·로보틱스 분야의 심층 인사이트·논문 분석을 제공하는 기술 사이트.',
    inLanguage: ['ko', 'en'],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
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

          {/* 헤더 */}
          <SiteHeader locale={locale} id="site-header" />

          {/* 인사이트 슬라이더 — 자체 원본 콘텐츠 */}
          <Suspense fallback={<div className="h-64 bg-white border border-slate-200 rounded-xl animate-pulse" />}>
            <InsightSliderSection locale={locale} />
          </Suspense>

          {/* LLM 모델·API 비교 허브 — 핵심 도구 */}
          <Link
            href="/compare"
            className="group block rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white px-6 py-5 hover:border-indigo-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {isEn ? 'LLM Model & API Price Comparison' : 'LLM 모델·API 가격·성능 비교'}
                </h2>
                <p className="mt-1 text-sm text-slate-500 leading-relaxed">
                  {isEn
                    ? 'Compare context windows and per-token pricing across Claude, GPT, and Gemini — and calculate your monthly cost.'
                    : 'Claude·GPT·Gemini의 컨텍스트와 토큰당 가격을 한눈에 비교하고, 월 비용까지 계산해 보세요.'}
                </p>
              </div>
              <span className="flex-shrink-0 text-sm font-bold text-indigo-500 group-hover:translate-x-0.5 transition-transform">
                {isEn ? 'Open →' : '비교하기 →'}
              </span>
            </div>
          </Link>

          {/* 최신 논문 분석 — 자체 DB */}
          <Suspense fallback={
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[1,2,3].map(i => (
                <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 h-28 animate-pulse" />
              ))}
            </div>
          }>
            <LatestPapersSection locale={locale} />
          </Suspense>

          {/* 사이트 소개 */}
          <div className="bg-gradient-to-br from-indigo-50 to-slate-50 rounded-xl border border-indigo-100 px-6 py-5">
            <h2 className="text-sm font-bold text-slate-700 mb-2">
              {isEn ? 'About AI Insight Note' : 'AI Insight Note 소개'}
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed mb-4">
              {isEn
                ? 'LLM model & API price comparison plus original deep-dive analysis and paper reviews across AI, semiconductors, and robotics.'
                : 'LLM 모델·API 가격 비교와, AI·반도체·로보틱스 분야의 심층 인사이트·논문 분석을 제공합니다.'}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { href: '/compare',  label: isEn ? 'Compare' : '모델 비교', desc: isEn ? 'LLM price & specs' : 'LLM 가격·성능 비교' },
                { href: '/insights', label: isEn ? 'Insights' : '인사이트', desc: isEn ? 'Deep-dive analysis' : '심층 분석 칼럼' },
                { href: '/papers',   label: isEn ? 'Papers' : '논문 분석',  desc: isEn ? 'AI paper reviews'  : 'AI 논문 리뷰' },
              ].map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col gap-0.5 p-3 rounded-lg bg-white hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 transition-colors"
                >
                  <span className="text-xs font-bold text-slate-700">{item.label}</span>
                  <span className="text-xs text-slate-400">{item.desc}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* ── 외부 위젯 (사용자가 헤더 버튼으로 ON/OFF, 기본 숨김) ── */}
          <WidgetsPanel locale={locale}>
            <MarketBar />
            <div className="flex flex-col sm:flex-row gap-4 items-stretch">
              <WeatherWidget />
              <CalendarWidget />
            </div>

            <Suspense fallback={null}>
              <AiLabNewsWidget locale={locale} />
            </Suspense>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Suspense fallback={<div className="bg-white border border-slate-200 rounded-xl p-4 animate-pulse" />}>
                <HNAILaunchWidget locale={locale} />
              </Suspense>
              <LlmLeaderboardWidget locale={locale} />
            </div>

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
          </WidgetsPanel>

        </div>
      </main>
      <Footer />
    </>
  );
}
