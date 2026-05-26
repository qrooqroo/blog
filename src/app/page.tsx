export const dynamic = 'force-dynamic';

import { headers } from 'next/headers';
import Script from 'next/script';
import Link from 'next/link';
import NavigationSpinner from '@/components/NavigationSpinner';
import Footer from '@/components/Footer';
import { getAllInsights } from '@/lib/insights';
import { getRecentPapers } from '@/lib/papers';
import { formatDate } from '@/lib/format';
import SiteHeader from '@/components/SiteHeader';
import InsightSlider from '@/components/InsightSlider';
import MarketBar from '@/components/MarketBar';
import WeatherWidget from '@/components/WeatherWidget';
import CalendarWidget from '@/components/CalendarWidget';
import GithubTrendingWidget from '@/components/GithubTrendingWidget';
import HuggingFaceWidget from '@/components/HuggingFaceWidget';
import RedditMLWidget from '@/components/RedditMLWidget';
import HNAILaunchWidget from '@/components/HNAILaunchWidget';
import AmazonAffiliateWidget from '@/components/AmazonAffiliateWidget';
import WidgetsPanel from '@/components/WidgetsPanel';
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
      <main className="max-w-5xl mx-auto px-4 py-10 pb-16">
        <div className="space-y-10">
          <SiteHeader locale={locale} />

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

          <WidgetsPanel locale={locale}>
            <MarketBar />
            <div className="flex flex-col sm:flex-row gap-4 items-stretch">
              <WeatherWidget />
              <CalendarWidget />
            </div>
          </WidgetsPanel>

          {papers.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Row 1 col 1: Papers */}
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
                      <p className="text-xs text-slate-400 mt-auto">{formatDate(paper.date)}</p>
                    </Link>
                  );
                })}
              </div>
              {/* Row 1 col 2: GitHub Trending */}
              <Suspense fallback={<div className="bg-white border border-slate-200 rounded-xl p-4 animate-pulse" />}>
                <GithubTrendingWidget locale={locale} />
              </Suspense>
              {/* Row 1 col 3: HuggingFace */}
              <Suspense fallback={<div className="bg-white border border-slate-200 rounded-xl p-4 animate-pulse" />}>
                <HuggingFaceWidget locale={locale} />
              </Suspense>
              {/* Row 2 col 1: HN AI Launch */}
              <Suspense fallback={<div className="bg-white border border-slate-200 rounded-xl p-4 animate-pulse" />}>
                <HNAILaunchWidget locale={locale} />
              </Suspense>
              {/* Row 2 col 2: Reddit ML */}
              <Suspense fallback={<div className="bg-white border border-slate-200 rounded-xl p-4 animate-pulse" />}>
                <RedditMLWidget locale={locale} />
              </Suspense>
              {/* Row 2 col 3: Amazon */}
              <AmazonAffiliateWidget />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
