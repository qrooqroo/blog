import { getArticleBySlug, getPublishedArticles, getDraftArticles, formatDate } from '@/lib/articles';
import { getNewsBySlug, getAllNews } from '@/lib/news';
import { supabase } from '@/lib/supabase';
import ArticleCard from '@/components/ArticleCard';
import PublishButton from '@/components/PublishButton';
import SiteHeader from '@/components/SiteHeader';
import SearchBar from '@/components/SearchBar';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { parseTitleParts, resolveDisplayKo } from '@/lib/title-parser';
import { headers } from 'next/headers';

interface CategoryInfo {
  id: number;
  name: string;
  slug: string;
  parent?: { id: number; name: string; slug: string } | null;
}

async function getCategoryInfo(name: string): Promise<CategoryInfo | null> {
  const { data } = await supabase
    .from('categories')
    .select('id, name, slug, parent_id')
    .eq('name', name)
    .single();
  if (!data) return null;

  if (!data.parent_id) return { id: data.id, name: data.name, slug: data.slug, parent: null };

  const { data: parent } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('id', data.parent_id)
    .single();

  return { id: data.id, name: data.name, slug: data.slug, parent: parent ?? null };
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
  const host = (await headers()).get('host') ?? '';
  const isLocal = host.startsWith('localhost') || host.startsWith('127.0.0.1');

  // ── 초안 목록 페이지 (localhost 전용) ──
  if (slug === 'drafts') {
    if (!isLocal) notFound();
    const drafts = await getDraftArticles();
    return (
      <div className="space-y-6">
        <SiteHeader />
        <SearchBar />
        <div className="flex items-center gap-2.5">
          <span className="w-1 h-5 bg-amber-500 rounded-full" />
          <h2 className="text-base font-black text-slate-800">초안 문서</h2>
          <span className="text-sm text-slate-400">{drafts.length}개</span>
          <span className="ml-auto text-xs bg-amber-50 border border-amber-200 text-amber-600 px-2 py-0.5 rounded-full">
            localhost 전용
          </span>
        </div>
        {drafts.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <p className="text-slate-400 text-sm">초안 문서가 없습니다.</p>
            <Link href="/editor" className="inline-flex items-center gap-1.5 text-sm text-indigo-500 hover:text-indigo-700 transition-colors">
              ✍️ 새 문서 작성하기 →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {drafts.map(a => (
              <div key={a.id} className="relative group">
                <ArticleCard article={a} />
                <div className="absolute inset-x-3 bottom-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  <PublishButton id={a.id} slug={a.slug} />
                  <Link
                    href={`/editor/${a.id}`}
                    className="flex-1 py-1.5 text-xs font-bold rounded-lg shadow text-center bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                    onClick={e => e.stopPropagation()}
                  >
                    ✏️ 편집
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  const [article, allArticles, allNews] = await Promise.all([
    findArticle(slug),
    getPublishedArticles(),
    getAllNews(),
  ]);

  if (!article) redirect(`/editor?slug=${encodeURIComponent(slug)}`);

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
            <Link href={`/category/${categoryInfo.parent.slug}`} className="hover:text-indigo-500 transition-colors">
              {categoryInfo.parent.name}
            </Link>
            <span>›</span>
          </>
        )}
        {categoryInfo?.slug ? (
          <Link href={`/category/${categoryInfo.slug}`} className="hover:text-indigo-500 transition-colors">
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
          <div className="flex items-center justify-between gap-2.5 mb-4">
            <div className="flex items-center gap-2.5">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tagColor}`}>
                {article.category}
              </span>
              <time className="text-sm text-slate-400">{formatDate(article.date)}</time>
            </div>
            {isLocal && (
              <Link
                href={`/wiki/${article.slug}/edit`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                편집
              </Link>
            )}
          </div>

          {(() => {
            const parts = article.title_ko && article.title_en
              ? { ko: article.title_ko, en: article.title_en }
              : parseTitleParts(article.title);
            const displayKo = resolveDisplayKo(article.title, parts.ko);
            return (
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight mb-5 flex items-baseline gap-2 flex-wrap">
                {displayKo}
                {parts.en && (
                  <span className="text-base md:text-lg font-medium text-slate-400">
                    {parts.en}
                  </span>
                )}
              </h1>
            );
          })()}

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
            <MarkdownRenderer className="prose text-slate-700 text-[0.95rem]">
              {article.markdown_content.replace(/^\s*#{1,6}[^\n]*\n?/, '')}
            </MarkdownRenderer>
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
