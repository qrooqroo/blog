export const dynamic = 'force-dynamic';

import { getRecentArticles } from '@/lib/articles';
import ArticleCard from '@/components/ArticleCard';

export default async function HomePage() {
  const articles = await getRecentArticles(30);

  return (
    <div className="space-y-8">

      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">AI Insight Note</h1>
      </div>

      {/* 글 목록 */}
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
