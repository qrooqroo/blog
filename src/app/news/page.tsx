export const dynamic = 'force-dynamic';

import { getAllNews } from '@/lib/news';
import ArticleCard from '@/components/ArticleCard';
import NewsSlider from '@/components/NewsSlider';

export default async function NewsPage() {
  const articles = await getAllNews();

  const sliderArticles = articles.slice(0, 5);
  const restArticles = articles.slice(5);

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

          {restArticles.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="w-1 h-5 bg-indigo-500 rounded-full" />
                <h2 className="text-base font-black text-slate-800">더 보기</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {restArticles.map(a => (
                  <ArticleCard key={a.id} article={a} basePath="/news" />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
