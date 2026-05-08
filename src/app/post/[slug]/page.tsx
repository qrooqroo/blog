import { getArticleBySlug, getAllArticles, formatDate } from '@/lib/articles';
import ArticleCard from '@/components/ArticleCard';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllArticles().map(a => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return {};
  return { title: `${article.title} - AI Insight Note`, description: article.excerpt };
}

const CATEGORY_COLORS: Record<string, string> = {
  '경제': 'bg-blue-600', '정치': 'bg-red-600', '사회': 'bg-green-600',
  '건강': 'bg-teal-600', '스포츠': 'bg-orange-500', 'IT': 'bg-purple-600', '문화': 'bg-pink-600',
};

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const related = getAllArticles()
    .filter(a => a.category === article.category && a.id !== article.id)
    .slice(0, 4);

  const badgeColor = CATEGORY_COLORS[article.category] ?? 'bg-gray-600';

  return (
    <div className="max-w-3xl mx-auto">
      {/* 브레드크럼 */}
      <nav className="text-sm text-gray-400 mb-4 flex items-center gap-1.5">
        <Link href="/" className="hover:text-red-600">홈</Link>
        <span>›</span>
        <Link href={`/category/${encodeURIComponent(article.category)}`} className="hover:text-red-600">{article.category}</Link>
        <span>›</span>
        <span className="text-gray-600 truncate">{article.title}</span>
      </nav>

      {/* 기사 헤더 */}
      <article className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* 히어로 이미지 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={article.image} alt={article.title} className="w-full h-64 object-cover" />

        <div className="p-6 md:p-8">
          {/* 카테고리 + 날짜 */}
          <div className="flex items-center gap-3 mb-4">
            <span className={`text-xs font-bold text-white px-2.5 py-1 rounded ${badgeColor}`}>
              {article.category}
            </span>
            <time className="text-sm text-gray-400">{formatDate(article.date)}</time>
          </div>

          {/* 제목 */}
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight mb-4">
            {article.title}
          </h1>

          {/* 요약 */}
          <p className="text-base text-gray-500 leading-relaxed border-l-4 border-red-500 pl-4 mb-8 bg-red-50 py-3 rounded-r">
            {article.excerpt}
          </p>

          {/* 본문 */}
          <div
            className="prose prose-gray max-w-none text-base leading-8 text-gray-700"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>
      </article>

      {/* 관련 기사 */}
      {related.length > 0 && (
        <section className="mt-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1 h-5 bg-red-600 rounded-full" />
            <h2 className="text-lg font-black text-gray-900">관련 기사</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map(a => (
              <ArticleCard key={a.id} article={a} size="small" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
