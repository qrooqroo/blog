export const dynamic = 'force-dynamic';

import { getFeaturedArticle, getAllArticles } from '@/lib/articles';
import { CATEGORIES } from '@/data/articles';
import FeaturedArticle from '@/components/FeaturedArticle';
import ArticleCard from '@/components/ArticleCard';
import Link from 'next/link';

export default async function NewsPage() {
  const [featured, allArticles] = await Promise.all([
    getFeaturedArticle(),
    getAllArticles(),
  ]);

  const rest = featured ? allArticles.filter(a => a.id !== featured.id) : allArticles;

  const byCategory = CATEGORIES.map(cat => ({
    cat,
    articles: allArticles.filter(a => a.category === cat).slice(0, 3),
  }));

  return (
    <div className="space-y-12">

      {/* 히어로 */}
      <section className="text-center py-8">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
          AI와 함께 기록하는 인사이트 노트
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">AI Insight Note</h1>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          AI와 나눈 대화, 발견한 인사이트, 기록할 가치 있는 생각들을 모아둔 공간입니다.
        </p>
        <div className="flex items-center justify-center gap-6 mt-5 text-sm text-slate-400">
          <span><strong className="text-slate-700">{allArticles.length}</strong>개의 노트</span>
          <span><strong className="text-slate-700">{CATEGORIES.length}</strong>개의 카테고리</span>
        </div>
      </section>

      {/* 최신 노트 */}
      {featured && (
        <section>
          <SectionTitle title="최신 노트" href="/news" />
          <div className="space-y-4">
            <FeaturedArticle article={featured} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {rest.slice(0, 3).map(a => (
                <ArticleCard key={a.id} article={a} size="small" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 카테고리별 섹션 */}
      {byCategory.map(({ cat, articles }) => (
        <section key={cat}>
          <SectionTitle title={cat} href={`/news/category/${encodeURIComponent(cat)}`} />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {articles.map(a => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function SectionTitle({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2.5">
        <span className="w-1 h-5 bg-indigo-500 rounded-full inline-block" />
        <h2 className="text-base font-black text-slate-800">{title}</h2>
      </div>
      <Link href={href} className="text-xs text-slate-400 hover:text-indigo-500 transition-colors">
        전체 보기 →
      </Link>
    </div>
  );
}
