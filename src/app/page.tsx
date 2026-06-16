export const dynamic = 'force-dynamic';

import { headers } from 'next/headers';
import Script from 'next/script';
import Link from 'next/link';
import NavigationSpinner from '@/components/NavigationSpinner';
import HomeSiteNav from '@/components/HomeSiteNav';
import Footer from '@/components/Footer';
import { getAllInsights } from '@/lib/insights';
import { getRecentPapers } from '@/lib/papers';
import { getRecentNews } from '@/lib/news';
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

// ── 최신 기술 뉴스 (자체 DB) ──────────────────────────────────────
async function LatestNewsSection({ locale }: { locale: string }) {
  const news = await getRecentNews(8);
  const isEn = locale === 'en';
  if (news.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-black text-slate-800">
          {isEn ? 'Latest Tech News' : '최신 기술 뉴스'}
        </h2>
        <Link href="/news" className="text-xs text-slate-400 hover:text-indigo-500 transition-colors">
          {isEn ? 'View all →' : '전체 보기 →'}
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {news.map(item => {
          const title = (isEn && item.title_en) ? item.title_en : item.title;
          return (
            <Link
              key={item.id}
              href={`/news/${item.slug}`}
              className="group flex items-start gap-3 bg-white border border-slate-100 rounded-xl p-3.5 hover:border-indigo-200 hover:shadow-sm transition-all"
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt=""
                  className="w-14 h-14 rounded-lg object-cover flex-shrink-0 bg-slate-100"
                />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-indigo-50 flex-shrink-0 flex items-center justify-center text-indigo-300 text-xs font-bold">
                  AI
                </div>
              )}
              <div className="min-w-0 flex flex-col gap-1">
                <p className="text-sm font-semibold text-slate-800 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
                  {title}
                </p>
                <p className="text-xs text-slate-400">{item.category}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
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
              <span className="text-xs font-medium text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full self-start">
                {isEn ? 'Paper' : '논문 분석'}
              </span>
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

// ── 스프링 코일 바인딩 ────────────────────────────────────────────
function SpringCoils({ count = 20 }: { count?: number }) {
  return (
    <div
      style={{ position: 'relative', height: '50px', background: '#FEFCE8', borderBottom: '1.5px solid #BAE6FD' }}
    >
      <div
        style={{ position: 'absolute', left: '8px', right: '8px', top: 0, bottom: 0, display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}
      >
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} style={{ position: 'relative', width: '14px', height: '44px', flexShrink: 0 }}>

            {/* 링 내부 — 속이 빈 어두운 공간 */}
            <div style={{
              position: 'absolute', top: '2px', left: '0', width: '14px', height: '40px',
              borderRadius: '7px',
              border: '2.5px solid #3C3C3C',
              background: '#222',
              boxShadow: '0 2px 6px rgba(0,0,0,0.55)',
              zIndex: 1,
            }} />

            {/* 종이 가림막 */}
            <div style={{
              position: 'absolute', top: '17px', bottom: '12px', left: '-8px', right: '-8px',
              background: '#FEFCE8',
              zIndex: 3,
            }} />

            {/* 구멍 — 종이 뒤로 연결되는 어두운 홀 */}
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '8px', height: '10px',
              borderRadius: '4px',
              background: '#111',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.9)',
              zIndex: 4,
            }} />

            {/* 상단 호 — 종이 앞으로 나온 금속 와이어 */}
            <div style={{
              position: 'absolute', top: '2px', left: '0', width: '14px', height: '19px',
              borderRadius: '7px 7px 0 0',
              border: '2.5px solid #3C3C3C',
              borderBottom: 'none',
              background: 'linear-gradient(160deg, #FFFFFF 0%, #E8E8E8 18%, #C4C4C4 36%, #787878 54%, #B0B0B0 72%, #DCDCDC 86%, #F5F5F5 100%)',
              boxShadow: '0 4px 8px rgba(0,0,0,0.45), inset 0 2px 3px rgba(255,255,255,0.85)',
              zIndex: 5,
            }} />

          </div>
        ))}
      </div>
    </div>
  );
}

// ── 섹션별 노트 카드 ──────────────────────────────────────────────
function NotebookCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ boxShadow: '0 6px 28px rgba(0,0,0,0.22), 0 2px 6px rgba(0,0,0,0.12)' }}
    >
      <SpringCoils />
      <div className="notebook-paper">
        <div className="relative py-6 pb-8 pl-12 pr-4 sm:pl-16 sm:pr-6">
          <div
            className="absolute inset-y-0 pointer-events-none"
            style={{ left: '36px', width: '1.5px', background: 'rgba(252,165,165,0.65)' }}
          />
          {children}
        </div>
      </div>
    </div>
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
    description: 'AI·ML, 블록체인, 반도체, 로보틱스 분야의 최신 논문 분석, 심층 인사이트, 기술 뉴스를 매일 자체 발행하는 기술 블로그.',
    inLanguage: ['ko', 'en'],
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: 'https://www.aiinsightnote.com/wiki?q={search_term_string}' },
      'query-input': 'required name=search_term_string',
    },
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

      {/* ── 책상 배경 ────────────────────────────────────────────── */}
      <main className="min-h-screen py-6 pb-24" style={{ background: '#C8C0B0' }}>
        <div className="max-w-5xl mx-auto px-3 sm:px-4 space-y-6">

          {/* 헤더 */}
          <SiteHeader locale={locale} id="site-header" />

          {/* 인사이트 슬라이더 — 노트 카드 */}
          <NotebookCard>
            <Suspense fallback={<div className="h-64 bg-white/60 rounded-xl animate-pulse" />}>
              <InsightSliderSection locale={locale} />
            </Suspense>
          </NotebookCard>

          {/* 최신 기술 뉴스 — 노트 카드 */}
          <NotebookCard>
            <Suspense fallback={
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[1,2,3,4,5,6,7,8].map(i => (
                  <div key={i} className="bg-white/60 rounded-xl p-3.5 h-20 animate-pulse" />
                ))}
              </div>
            }>
              <LatestNewsSection locale={locale} />
            </Suspense>
          </NotebookCard>

          {/* 최신 논문 분석 — 노트 카드 */}
          <NotebookCard>
            <Suspense fallback={
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[1,2,3].map(i => (
                  <div key={i} className="bg-white/60 rounded-xl p-4 h-28 animate-pulse" />
                ))}
              </div>
            }>
              <LatestPapersSection locale={locale} />
            </Suspense>
          </NotebookCard>

          {/* 사이트 소개 */}
          <div className="bg-gradient-to-br from-indigo-50 to-slate-50 rounded-xl border border-indigo-100 px-6 py-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-700 mb-2">
              {isEn ? 'About AI Insight Note' : 'AI Insight Note 소개'}
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed mb-4">
              {isEn
                ? 'A technical blog publishing daily original analysis on AI, machine learning, blockchain, semiconductors, and robotics — covering the latest research papers, industry insights, and tech news.'
                : 'AI·ML, 블록체인, 반도체, 로보틱스 분야의 최신 논문 분석, 심층 인사이트, 기술 뉴스를 매일 자체 발행하는 기술 블로그입니다.'}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { href: '/insights', label: isEn ? 'Insights' : '인사이트', desc: isEn ? 'Deep-dive analysis' : '심층 분석 칼럼' },
                { href: '/papers',   label: isEn ? 'Papers' : '논문 분석',  desc: isEn ? 'AI paper reviews'  : 'AI 논문 리뷰' },
                { href: '/news',     label: isEn ? 'News' : '뉴스',         desc: isEn ? 'Daily tech news'   : '매일 기술 뉴스' },
                { href: '/wiki',     label: isEn ? 'Wiki' : '위키',         desc: isEn ? 'IT knowledge base' : 'IT 지식 베이스' },
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
