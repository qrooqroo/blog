export const dynamic = 'force-dynamic';
export const maxDuration = 25; // 부하 시 행을 300초→25초로 캡: 함수 동시성 빠르게 회복

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { headers, cookies } from 'next/headers';
import { getInsightBySlug, getRecentInsights } from '@/lib/insights';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import AdUnit from '@/components/AdUnit';
import InsightRelated from '@/components/InsightRelated';
import { isValidLocale, defaultLocale, getDictionary } from '@/lib/i18n/dictionaries';

const SITE_URL = 'https://aiinsightnote.com';

interface Props {
  params: Promise<{ slug: string }>;
}

async function getLocale(): Promise<string> {
  const h = await headers();
  const c = await cookies();
  const fromHeader = h.get('x-locale');
  const fromCookie = c.get('NEXT_LOCALE')?.value;
  const raw = fromHeader ?? fromCookie ?? defaultLocale;
  return isValidLocale(raw) ? raw : defaultLocale;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const insight = await getInsightBySlug(slug);
  if (!insight) return { title: '인사이트 | AI Insight Note' };

  const isEn = locale === 'en';
  const title = (isEn && insight.title_en) ? insight.title_en : insight.title;
  const description = (isEn && insight.excerpt_en)
    ? insight.excerpt_en
    : (insight.excerpt ?? insight.content.slice(0, 160).replace(/\n/g, ' '));
  const url = `${SITE_URL}/insights/${slug}`;

  return {
    title: { absolute: `${title} | AI Insight Note` },
    description,
    keywords: insight.tags ?? [],
    alternates: {
      canonical: url,
      languages: {
        'ko': url,
        'en': url,
        'x-default': url,
      },
    },
    openGraph: {
      type: 'article',
      url,
      title,
      description,
      images: insight.image ? [{ url: insight.image, width: 800, height: 450, alt: title }] : [],
      publishedTime: insight.date,
      tags: insight.tags ?? [],
      siteName: 'AI Insight Note',
      locale: isEn ? 'en_US' : 'ko_KR',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: insight.image ? [insight.image] : [],
    },
  };
}

export default async function InsightPage({ params }: Props) {
  const { slug } = await params;
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const insight = await getInsightBySlug(slug);

  if (!insight) return notFound();

  const recentInsights = await getRecentInsights(7);
  const related = recentInsights.filter(i => i.slug !== slug).slice(0, 3);

  const isEn = locale === 'en';
  const title = (isEn && insight.title_en) ? insight.title_en : insight.title;
  const excerpt = (isEn && insight.excerpt_en) ? insight.excerpt_en : insight.excerpt;
  const content = (isEn && insight.content_en) ? insight.content_en : insight.content;

  const canonical = `https://www.aiinsightnote.com/insights/${slug}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: excerpt?.slice(0, 160) ?? title,
    datePublished: insight.date,
    dateModified: insight.date,
    url: canonical,
    ...(insight.image ? { image: [insight.image] } : {}),
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
    <div className="max-w-3xl mx-auto space-y-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link href="/insights" className="text-sm text-slate-400 hover:text-indigo-600 transition-colors block mb-4">
        {dict.pages.insights.back}
      </Link>

      <div>
        <h1 className="text-2xl font-black text-slate-900 leading-snug select-text">{title}</h1>
      </div>

      {insight.image && (
        <div className="relative h-64 rounded-xl overflow-hidden bg-slate-200">
          <img src={insight.image} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      <p className="text-base text-slate-600 leading-relaxed border-l-4 border-indigo-200 pl-4 italic select-text">
        {excerpt}
      </p>

      <AdUnit slot="2748808542" className="my-4" />

      <div className="prose prose-slate max-w-none">
        <MarkdownRenderer>{content}</MarkdownRenderer>
      </div>

      <AdUnit slot="6963385825" className="mt-6" />

      <InsightRelated items={related} isEn={isEn} />
    </div>
  );
}
