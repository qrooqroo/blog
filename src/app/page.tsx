import { getFeaturedArticle, getAllArticles } from '@/lib/articles';
import { CATEGORIES } from '@/data/articles';
import FeaturedArticle from '@/components/FeaturedArticle';
import ArticleCard from '@/components/ArticleCard';
import Link from 'next/link';

export default function HomePage() {
  const featured = getFeaturedArticle();
  const allArticles = getAllArticles();
  const rest = allArticles.filter(a => a.id !== featured.id);

  const byCategory = CATEGORIES.map(cat => ({
    cat,
    articles: allArticles.filter(a => a.category === cat).slice(0, 4),
  }));

  return (
    <div className="space-y-10">
      {/* 주요 뉴스 */}
      <section>
        <SectionTitle title="주요 뉴스" href="/" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <FeaturedArticle article={featured} />
          </div>
          <div className="flex flex-col gap-3">
            {rest.slice(0, 3).map(a => (
              <Link key={a.id} href={`/post/${a.slug}`}
                className="group flex gap-3 bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.image} alt={a.title} className="w-20 h-16 object-cover rounded flex-shrink-0" />
                <div className="min-w-0">
                  <span className="text-xs text-red-600 font-bold">{a.category}</span>
                  <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-red-600 transition-colors mt-0.5">
                    {a.title}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 카테고리별 섹션 */}
      {byCategory.map(({ cat, articles }) => (
        <section key={cat}>
          <SectionTitle title={cat} href={`/category/${encodeURIComponent(cat)}`} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {articles.map(a => (
              <ArticleCard key={a.id} article={a} size="small" />
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
      <div className="flex items-center gap-2">
        <span className="w-1 h-5 bg-red-600 rounded-full inline-block" />
        <h2 className="text-lg font-black text-gray-900">{title}</h2>
      </div>
      <Link href={href} className="text-xs text-gray-400 hover:text-red-600 transition-colors">
        더보기 →
      </Link>
    </div>
  );
}
