import { cache } from 'react';
import { getNewsBySlug, getRelatedNews } from '@/lib/news';
import { formatDate } from '@/lib/articles';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { getDictionary, isValidLocale, defaultLocale } from '@/lib/i18n/dictionaries';

const ANALYST_EN: Record<string, string> = {
  '이준혁': 'Maren Cole',
  '박서연': 'Zoe Strand',
  '김도현': 'Leo Vane',
};

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

const getCachedArticle = cache((slug: string) => getNewsBySlug(slug));

export async function generateMetadata({ params }: Props) {
  const { locale: raw, slug } = await params;
  const locale = isValidLocale(raw) ? raw : defaultLocale;
  const article = await getCachedArticle(slug);
  if (!article) return {};

  const title = `${article.title} | AI Insight Note`;
  const description = (article.excerpt ?? '').trim().slice(0, 155) || article.title;
  const canonical = `https://www.aiinsightnote.com/${locale}/news/${slug}`;
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
      locale: locale === 'ko' ? 'ko_KR' : 'en_US',
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
  const { locale: raw, slug } = await params;
  const locale = isValidLocale(raw) ? raw : defaultLocale;
  const dict = getDictionary(locale);

  const article = await getCachedArticle(slug);
  if (!article) notFound();

  const related = await getRelatedNews(article.category, slug, 3);

  const tagColor = CATEGORY_COLORS[article.category] ?? 'bg-slate-100 text-slate-600';

  return (
    <div className="max-w-3xl mx-auto">
      <nav className="flex items-center gap-1.5 text-sm text-slate-400 mb-6 flex-wrap">
        <Link href={`/${locale}`} className="hover:text-indigo-500 transition-colors">{dict.nav.home}</Link>
        <span>›</span>
        <Link href={`/${locale}/news`} className="hover:text-indigo-500 transition-colors">{dict.nav.news}</Link>
        <span>›</span>
        <span className="text-slate-600 truncate">{article.title}</span>
      </nav>

      <article className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {article.image && <img src={article.image} alt={article.title} className="w-full h-64 object-cover" />}

        <div className="p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight mb-3">
            {article.title}
          </h1>
          <div className="flex items-center justify-end gap-3 mb-6 text-xs text-slate-400">
            {article.analyst && (
              <span className="font-medium text-slate-500">
                {isEn
                  ? `by ${ANALYST_EN[article.analyst] ?? article.analyst}`
                  : `${article.analyst} 기자`}
              </span>
            )}
            <time>{formatDate(article.date)}</time>
          </div>

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

      {related.length > 0 && (
        <section className="mt-10">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="w-1 h-5 bg-indigo-500 rounded-full" />
            <h2 className="text-base font-black text-slate-800">{dict.nav.relatedNews}</h2>
          </div>
          <div className="flex flex-col gap-2">
            {related.map(a => (
              <Link
                key={a.id}
                href={`/${locale}/news/${a.slug}`}
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
