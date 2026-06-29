import { cache } from 'react';
import { getNewsBySlug, getRelatedNewsBySource } from '@/lib/news';
import { formatDate } from '@/lib/articles';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { headers, cookies } from 'next/headers';
import { isValidLocale } from '@/lib/i18n/dictionaries';
import AdUnit from '@/components/AdUnit';

export const maxDuration = 25; // 부하 시 행을 300초→25초로 캡: 함수 동시성 빠르게 회복

const ANALYST_EN: Record<string, string> = {
  '이준혁': 'Maren Cole',
  '박서연': 'Zoe Strand',
  '김도현': 'Leo Vane',
};

interface Props {
  params: Promise<{ slug: string }>;
}

const getCachedArticle = cache((slug: string) => getNewsBySlug(slug));

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const article = await getCachedArticle(slug);
  if (!article) return {};

  const h = await headers();
  const c = await cookies();
  const locale = h.get('x-locale') ?? c.get('NEXT_LOCALE')?.value ?? 'ko';
  const isEn = isValidLocale(locale) && locale === 'en';

  const displayTitle = isEn ? (article.title_en ?? article.title) : article.title;
  const displayExcerpt = isEn ? (article.excerpt_en ?? article.excerpt) : article.excerpt;
  const title = `${displayTitle} | AI Insight Note`;
  const description = (displayExcerpt ?? '').trim().slice(0, 155) || displayTitle;
  const canonical = `https://www.aiinsightnote.com/news/${slug}`;
  const imageUrl = article.image?.startsWith('http')
    ? article.image
    : `https://www.aiinsightnote.com${article.image ?? ''}`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        'ko': canonical,
        'en': canonical,
        'x-default': canonical,
      },
    },
    // 자동 생성 뉴스는 저가치 콘텐츠로 분류돼 전면 색인 제외 (사용자에겐 정상 노출)
    robots: { index: false, follow: true },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'AI Insight Note',
      images: [{ url: imageUrl, width: 800, height: 400, alt: displayTitle }],
      type: 'article' as const,
      locale: isEn ? 'en_US' : 'ko_KR',
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

const CATEGORY_EN: Record<string, string> = {
  'AI': 'AI',
  'IT': 'IT',
  '비트코인': 'Bitcoin',
  '경제': 'Economy',
  '뉴스': 'News',
};

export default async function NewsSlugPage({ params }: Props) {
  const { slug } = await params;
  const h = await headers();
  const c = await cookies();
  const locale = h.get('x-locale') ?? c.get('NEXT_LOCALE')?.value ?? 'ko';
  const isEn = isValidLocale(locale) && locale === 'en';

  const article = await getCachedArticle(slug);
  if (!article) notFound();

  const related = await getRelatedNewsBySource(article.source_url, slug, 10);

  const tagColor = CATEGORY_COLORS[article.category] ?? 'bg-slate-100 text-slate-600';

  const canonical = `https://www.aiinsightnote.com/news/${slug}`;
  const imageUrl = article.image?.startsWith('http')
    ? article.image
    : article.image ? `https://www.aiinsightnote.com${article.image}` : undefined;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: isEn ? (article.title_en ?? article.title) : article.title,
    description: (article.excerpt ?? '').trim().slice(0, 160) || article.title,
    datePublished: article.date,
    dateModified: article.date,
    url: canonical,
    ...(imageUrl ? { image: [imageUrl] } : {}),
    author: {
      '@type': 'Organization',
      name: 'AI Insight Note',
      url: 'https://www.aiinsightnote.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'AI Insight Note',
      url: 'https://www.aiinsightnote.com',
    },
    inLanguage: isEn ? 'en' : 'ko',
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
  };

  return (
    <div className="max-w-3xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* 브레드크럼 */}
      <nav className="flex items-center gap-1.5 text-sm text-slate-400 mb-6 flex-wrap">
        <Link href="/" className="hover:text-indigo-500 transition-colors">{isEn ? 'Home' : '홈'}</Link>
        <span>›</span>
        <Link href="/news" className="hover:text-indigo-500 transition-colors">{isEn ? 'News' : '뉴스'}</Link>
        <span>›</span>
        <span className="text-slate-600 truncate">{isEn ? (article.title_en ?? article.title) : article.title}</span>
      </nav>

      {/* 기사 */}
      <article className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {article.image && <img src={article.image} alt={article.title} className="w-full h-64 object-cover" />}

        <div className="p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight mb-3">
            {isEn ? (article.title_en ?? article.title) : article.title}
          </h1>
          <div className="flex items-center justify-end gap-3 mb-6 text-xs text-slate-400">
            {article.analyst && (
              <span className="font-medium text-slate-500">
                {isEn ? `by ${ANALYST_EN[article.analyst] ?? article.analyst}` : `${article.analyst} 기자`}
              </span>
            )}
            <time>{formatDate(article.date)}</time>
          </div>

          <AdUnit slot="2748808542" className="mb-6" />

          {isEn && article.markdown_content_en ? (
            <MarkdownRenderer className="prose text-slate-700 text-[0.95rem]">
              {article.markdown_content_en}
            </MarkdownRenderer>
          ) : article.markdown_content ? (
            <MarkdownRenderer className="prose text-slate-700 text-[0.95rem]">
              {article.markdown_content.replace(/^\s*#{1,6}[^\n]*\n?/, '')}
            </MarkdownRenderer>
          ) : (
            <div
              className="prose text-slate-700 text-[0.95rem] leading-8"
              dangerouslySetInnerHTML={{ __html: article.content ?? '' }}
            />
          )}
          <AdUnit slot="6963385825" className="mt-6" />
        </div>
      </article>

      {/* 관련 뉴스 */}
      {related.length > 0 && (
        <section className="mt-10">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="w-1 h-5 bg-indigo-500 rounded-full" />
            <h2 className="text-base font-black text-slate-800">{isEn ? 'Related News' : '관련 뉴스'}</h2>
          </div>
          <div className="flex flex-col gap-2">
            {related.map(a => (
              <Link
                key={a.id}
                href={`/news/${a.slug}`}
                className="flex items-start justify-between gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl hover:text-indigo-600 hover:border-indigo-200 hover:shadow-sm transition-all group"
              >
                <span className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600 line-clamp-2 leading-snug flex-1">{isEn ? (a.title_en ?? a.title) : a.title}</span>
                <time className="text-xs text-slate-400 flex-shrink-0 mt-0.5">{formatDate(a.date)}</time>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
