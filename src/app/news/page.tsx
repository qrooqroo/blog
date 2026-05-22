export const dynamic = 'force-dynamic';

import { getAllNews } from '@/lib/news';
import NewsSlider from '@/components/NewsSlider';
import NewsCategoryTabs from '@/components/NewsCategoryTabs';
import { Article } from '@/types';

export default async function NewsPage() {
  const articles = await getAllNews();

  const sliderArticles = articles.slice(0, 5);

  // 카테고리별 분류
  const byCategory: Record<string, Article[]> = {};
  for (const a of articles) {
    if (!byCategory[a.category]) byCategory[a.category] = [];
    byCategory[a.category].push(a);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900">뉴스</h1>
        <p className="text-sm text-slate-400 mt-0.5">총 {articles.length}개의 글</p>
      </div>

      {articles.length === 0 ? (
        <p className="text-sm text-slate-400 py-16 text-center">아직 작성된 글이 없습니다.</p>
      ) : (
        <>
          <NewsSlider articles={sliderArticles} />
          <NewsCategoryTabs byCategory={byCategory} />
        </>
      )}
    </div>
  );
}
