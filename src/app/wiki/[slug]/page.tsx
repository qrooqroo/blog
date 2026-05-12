import { getArticleBySlug, getAllArticles, formatDate } from '@/lib/articles';
import { getNewsBySlug, getAllNews } from '@/lib/news';
import { supabase } from '@/lib/supabase';
import ArticleCard from '@/components/ArticleCard';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import MarkdownRenderer from '@/components/MarkdownRenderer';

interface CategoryInfo {
  id: number;
  name: string;
  parent?: { id: number; name: string } | null;
}

async function getCategoryInfo(name: string): Promise<CategoryInfo | null> {
  const { data } = await supabase
    .from('categories')
    .select('id, name, parent_id')
    .eq('name', name)
    .single();
  if (!data) return null;

  if (!data.parent_id) return { id: data.id, name: data.name, parent: null };

  const { data: parent } = await supabase
    .from('categories')
    .select('id, name')
    .eq('id', data.parent_id)
    .single();

  return { id: data.id, name: data.name, parent: parent ?? null };
}

interface Props {
  params: Promise<{ slug: string }>;
}

async function findArticle(slug: string) {
  return (await getArticleBySlug(slug)) ?? (await getNewsBySlug(slug));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const article = await findArticle(slug);
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

export default async function WikiPage({ params }: Props) {
  const { slug } = await params;

  const [article, allArticles, allNews] = await Promise.all([
    findArticle(slug),
    getAllArticles(),
    getAllNews(),
  ]);

  if (!article) notFound();

  const categoryInfo = await getCategoryInfo(article.category);
  const categoryId = categoryInfo?.id ?? null;

  const pool = [...allArticles, ...allNews];
  const related = pool
    .filter(a => a.category === article.category && a.slug !== article.slug)
    .slice(0, 3);

  const tagColor = CATEGORY_COLORS[article.category] ?? 'bg-slate-100 text-slate-600';

  return (
    <div className="max-w-3xl mx-auto">
      {/* 브레드크럼 */}
      <nav className="flex items-center gap-1.5 text-sm text-slate-400 mb-6 flex-wrap">
        <Link href="/" className="hover:text-indigo-500 transition-colors">홈</Link>
        <span>›</span>
        {categoryInfo?.parent && (
          <>
            <Link href={`/category/${categoryInfo.parent.id}`} className="hover:text-indigo-500 transition-colors">
              {categoryInfo.parent.name}
            </Link>
            <span>›</span>
          </>
        )}
        {categoryId ? (
          <Link href={`/category/${categoryId}`} className="hover:text-indigo-500 transition-colors">
            {article.category}
          </Link>
        ) : (
          <span>{article.category}</span>
        )}
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

          {article.excerpt && article.excerpt.trim() && (
            <div className="mb-8 rounded-xl border border-slate-200 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-400">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
                <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">참고 링크</span>
              </div>
              <div className="divide-y divide-slate-100">
                {article.excerpt.split('\n').filter(l => l.trim()).map((url, i) => (
                  <a key={i} href={url.trim()} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 transition-colors group">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-300 flex-shrink-0 group-hover:text-indigo-400 transition-colors">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                      <polyline points="15 3 21 3 21 9"/>
                      <line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                    <span className="text-sm text-indigo-600 group-hover:text-indigo-800 truncate transition-colors">
                      {url.trim()}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {article.markdown_content ? (
            <MarkdownRenderer className="prose text-slate-700 text-[0.95rem]">{article.markdown_content}</MarkdownRenderer>
          ) : (
            <div className="prose text-slate-700 text-[0.95rem] leading-8"
              dangerouslySetInnerHTML={{ __html: article.content }} />
          )}
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
