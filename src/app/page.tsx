export const dynamic = 'force-dynamic';

import { getArticlesByCategory } from '@/lib/articles';
import ArticleCard from '@/components/ArticleCard';
import Link from 'next/link';

export default async function HomePage() {
  const aiArticles = await getArticlesByCategory('AI 대화');

  return (
    <div className="space-y-10">

      {/* 히어로 */}
      <section className="text-center py-10">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
          AI와 함께 기록하는 인사이트 노트
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">AI Insight Note</h1>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          AI와 나눈 대화, 발견한 인사이트, 기록할 가치 있는 생각들을 모아둔 공간입니다.
        </p>
      </section>

      {/* AI 대화 섹션 */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span className="w-1 h-5 bg-indigo-500 rounded-full inline-block" />
            <h2 className="text-base font-black text-slate-800">AI 대화</h2>
          </div>
          <Link
            href="/news/category/AI%20%EB%8C%80%ED%99%94"
            className="text-xs text-slate-400 hover:text-indigo-500 transition-colors"
          >
            전체 보기 →
          </Link>
        </div>

        {aiArticles.length === 0 ? (
          <p className="text-sm text-slate-400 py-8 text-center">아직 작성된 글이 없습니다.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {aiArticles.map(a => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
