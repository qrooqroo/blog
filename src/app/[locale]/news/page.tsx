export const dynamic = 'force-dynamic';

import { getAllNews } from '@/lib/news';
import NewsSlider from '@/components/NewsSlider';
import NewsCategoryTabs from '@/components/NewsCategoryTabs';
import { Article } from '@/types';
import { getDictionary, isValidLocale, defaultLocale } from '@/lib/i18n/dictionaries';

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function NewsPage({ params }: Props) {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : defaultLocale;
  const dict = getDictionary(locale);
  const articles = await getAllNews();

  const sliderArticles = articles.slice(0, 5);
  const sliderIds = new Set(sliderArticles.map(a => a.id));

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
      <h1 className="text-2xl font-black text-slate-900">{dict.pages.news.title}</h1>

      {articles.length === 0 ? (
        <p className="text-sm text-slate-400 py-16 text-center">{dict.pages.news.empty}</p>
      ) : (
        <div className="space-y-8">
          <NewsSlider articles={sliderArticles} />
          <NewsCategoryTabs byCategory={byCategory} allArticles={tabArticles} />
        </div>
      )}
    </div>
  );
}
