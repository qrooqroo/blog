export const dynamic = 'force-dynamic';

import { getAllNews } from '@/lib/news';
import ArticleCard from '@/components/ArticleCard';

export default async function NewsPage() {
  const articles = await getAllNews();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900">뉴스</h1>
        <p className="text-sm text-slate-400 mt-0.5">총 {articles.length}개의 글</p>
      </div>

      {articles.length === 0 ? (
        <p className="text-sm text-slate-400 py-16 text-center">아직 작성된 글이 없습니다.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {articles.map(a => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      )}
    </div>
  );
}
