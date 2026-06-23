export const dynamic = 'force-dynamic';
export const maxDuration = 25; // 부하 시 행을 300초→25초로 캡: 함수 동시성 빠르게 회복

import { getAllNews } from '@/lib/news';
import NewsSlider from '@/components/NewsSlider';
import NewsCategoryTabs from '@/components/NewsCategoryTabs';
import { Article } from '@/types';
import { headers, cookies } from 'next/headers';
import { isValidLocale, defaultLocale } from '@/lib/i18n/dictionaries';

async function getLocale() {
  const h = await headers();
  const c = await cookies();
  const raw = h.get('x-locale') ?? c.get('NEXT_LOCALE')?.value ?? defaultLocale;
  return isValidLocale(raw) ? raw : defaultLocale;
}

export default async function NewsPage() {
  const [articles, locale] = await Promise.all([getAllNews(), getLocale()]);
  const isEn = locale === 'en';

  const sliderArticles = articles.slice(0, 5);
  const sliderIds = new Set(sliderArticles.map(a => a.id));

  // 슬라이더에 노출된 기사는 탭에서 제외
  const tabArticles: Article[] = [];
  const byCategory: Record<string, Article[]> = {};
  for (const a of articles) {
    if (sliderIds.has(a.id)) continue;
    tabArticles.push(a);
    if (!byCategory[a.category]) byCategory[a.category] = [];
    byCategory[a.category].push(a);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black text-slate-900">{isEn ? 'News' : '뉴스'}</h1>

      {articles.length === 0 ? (
        <p className="text-sm text-slate-400 py-16 text-center">
          {isEn ? 'No articles yet.' : '아직 작성된 글이 없습니다.'}
        </p>
      ) : (
        <div className="space-y-8">
          <NewsSlider articles={sliderArticles} isEn={isEn} />
          <NewsCategoryTabs byCategory={byCategory} allArticles={tabArticles} isEn={isEn} />
        </div>
      )}
    </div>
  );
}
