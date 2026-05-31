import { cache } from 'react';
import { getNewsBySlug, getRelatedNews } from '@/lib/news';
import { formatDate } from '@/lib/articles';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import MarkdownRenderer from '@/components/MarkdownRenderer';

interface Props {
  params: Promise<{ slug: string }>;
}

const getCachedArticle = cache((slug: string) => getNewsBySlug(slug));

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const article = await getCachedArticle(slug);
  if (!article) return {};

  const title = `${article.title} | AI Insight Note`;
  const description = (article.excerpt ?? '').trim().slice(0, 155) || article.title;
  const canonical = `https://www.aiinsightnote.com/news/${slug}`;
  const imageUrl = article.image?.startsWith('http')
    ? article.image
    : `https://www.aiinsightnote.com${article.image ?? ''}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'AI Insight Note',
      images: [{ url: imageUrl, width: 800, height: 400, alt: article.title }],
      type: 'article' as const,
      locale: 'ko_KR',
    },
    twitter: {
      card: 'summary_large_image' as const,
      title,
      description,
      images: [imageUrl],
    },
  };
}

const CATEGORY_COLORS: Record<string, string> = {
  'AI': 'bg-violet-50 text-violet-700',
  '비트코인': 'bg-amber-50 text-amber-700',
  '경제': 'bg-blue-50 text-blue-700',
  'IT': 'bg-indigo-50 text-indigo-700',
  '뉴스': 'bg-slate-100 text-slate-600',
};

export default async function NewsSlugPage({ params }: Props) {
  const { slug } = await params;
  const article = await getCachedArticle(slug);
  if (!article) notFound();

  const related = await getRelatedNews(article.category, slug, 3);

  const tagColor = CATEGORY_COLORS[article.category] ?? 'bg-slate-100 text-slate-600';

  return (
    <div className="max-w-3xl mx-auto">
      {/* 브레드크럼 */}
      <nav className="flex items-center gap-1.5 text-sm text-slate-400 mb-6 flex-wrap">
        <Link href="/" className="hover:text-indigo-500 transition-colors">홈</Link>
        <span>›</span>
        <Link href="/news" className="hover:text-indigo-500 transition-colors">뉴스</Link>
        <span>›</span>
        <span className="text-slate-600 truncate">{article.title}</span>
      </nav>

      {/* 기사 */}
      <article className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {article.image && <img src={article.image} alt={article.title} className="w-full h-64 object-cover" />}

        <div className="p-6 md:p-8">
          <div className="flex items-center gap-2.5 mb-4">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tagColor}`}>
              {article.category}
            </span>
            <time className="text-sm text-slate-400">{formatDate(article.date)}</time>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight mb-6">
            {article.title}
          </h1>

          {article.markdown_content ? (
            <MarkdownRenderer className="prose text-slate-700 text-[0.95rem]">
              {article.markdown_content.replace(/^\s*#{1,6}[^\n]*\n?/, '')}
            </MarkdownRenderer>
          ) : (
            <div
              className="prose text-slate-700 text-[0.95rem] leading-8"
              dangerouslySetInnerHTML={{ __html: article.content ?? '' }}
            />
          )}
        </div>
      </article>

      {/* 관련 뉴스 */}
      {related.length > 0 && (
        <section className="mt-10">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="w-1 h-5 bg-indigo-500 rounded-full" />
            <h2 className="text-base font-black text-slate-800">관련 뉴스</h2>
          </div>
          <div className="flex flex-col gap-2">
            {related.map(a => (
              <Link
                key={a.id}
                href={`/news/${a.slug}`}
                className="block px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:text-indigo-600 hover:border-indigo-200 hover:shadow-sm transition-all line-clamp-2 leading-snug"
              >
                {a.title}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
