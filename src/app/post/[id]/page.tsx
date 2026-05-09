import { getArticleById, getAllArticles, formatDate } from '@/lib/articles';
import ArticleCard from '@/components/ArticleCard';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const article = await getArticleById(Number(id));
  if (!article) return {};
  return { title: `${article.title} - AI Insight Note`, description: article.excerpt };
}

const CATEGORY_COLORS: Record<string, string> = {
  '경제': 'bg-blue-50 text-blue-700',
  '정치': 'bg-red-50 text-red-700',
  '사회': 'bg-green-50 text-green-700',
  '건강': 'bg-teal-50 text-teal-700',
  '스포츠': 'bg-orange-50 text-orange-700',
  'IT': 'bg-violet-50 text-violet-700',
  '문화': 'bg-pink-50 text-pink-700',
  'AI 대화': 'bg-indigo-50 text-indigo-700',
  '논문 분석': 'bg-purple-50 text-purple-700',
  '스타트업 AI 적용': 'bg-cyan-50 text-cyan-700',
};

export default async function PostPage({ params }: Props) {
  const { id } = await params;
  const [article, allArticles] = await Promise.all([
    getArticleById(Number(id)),
    getAllArticles(),
  ]);

  if (!article) notFound();

  const related = allArticles
    .filter(a => a.category === article.category && a.id !== article.id)
    .slice(0, 3);

  const tagColor = CATEGORY_COLORS[article.category] ?? 'bg-slate-100 text-slate-600';

  return (
    <div className="max-w-3xl mx-auto">
      {/* 브레드크럼 */}
      <nav className="flex items-center gap-1.5 text-sm text-slate-400 mb-6">
        <Link href="/" className="hover:text-indigo-500 transition-colors">홈</Link>
        <span>›</span>
        <Link href={`/news/category/${encodeURIComponent(article.category)}`} className="hover:text-indigo-500 transition-colors">
          {article.category}
        </Link>
        <span>›</span>
        <span className="text-slate-600 truncate">{article.title}</span>
      </nav>

      {/* 기사 */}
      <article className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={article.image} alt={article.title} className="w-full h-64 object-cover" />

        <div className="p-6 md:p-8">
          <div className="flex items-center gap-2.5 mb-4">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tagColor}`}>
              {article.category}
            </span>
            <time className="text-sm text-slate-400">{formatDate(article.date)}</time>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight mb-5">
            {article.title}
          </h1>

          <div className="ai-bubble pl-5 mb-8 py-3 bg-indigo-50 rounded-r-xl">
            <p className="text-sm text-indigo-800 leading-relaxed font-medium whitespace-pre-wrap">
              {article.excerpt}
            </p>
          </div>

          <div
            className="prose text-slate-700 text-[0.95rem] leading-8"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>
      </article>

      {/* 관련 노트 */}
      {related.length > 0 && (
        <section className="mt-10">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="w-1 h-5 bg-indigo-500 rounded-full" />
            <h2 className="text-base font-black text-slate-800">관련 노트</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {related.map(a => (
              <ArticleCard key={a.id} article={a} size="small" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
