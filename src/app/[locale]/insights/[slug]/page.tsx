export const revalidate = 3600;

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getInsightBySlug } from '@/lib/insights';
import { formatDate } from '@/lib/format';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { getDictionary, isValidLocale, defaultLocale } from '@/lib/i18n/dictionaries';

const SITE_URL = 'https://aiinsightnote.com';

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = isValidLocale(raw) ? raw : defaultLocale;
  const insight = await getInsightBySlug(slug);
  if (!insight) return { title: '인사이트 | AI Insight Note' };

  const isEn = locale === 'en';
  const title = (isEn && insight.title_en) ? insight.title_en : insight.title;
  const description = (isEn && insight.excerpt_en) ? insight.excerpt_en : (insight.excerpt ?? insight.content.slice(0, 160).replace(/\n/g, ' '));
  const canonicalSlug = (isEn && insight.slug_en) ? insight.slug_en : insight.slug;
  const url = `${SITE_URL}/${locale}/insights/${canonicalSlug}`;

  return {
    title: { absolute: `${title} | AI Insight Note` },
    description,
    keywords: insight.tags ?? [],
    alternates: { canonical: url },
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
  };
}

export default async function InsightPage({ params }: Props) {
  const { locale: raw, slug } = await params;
  const locale = isValidLocale(raw) ? raw : defaultLocale;
  const dict = getDictionary(locale);
  const insight = await getInsightBySlug(slug);

  if (!insight) return notFound();

  const isEn = locale === 'en';
  const title = (isEn && insight.title_en) ? insight.title_en : insight.title;
  const excerpt = (isEn && insight.excerpt_en) ? insight.excerpt_en : insight.excerpt;
  const content = (isEn && insight.content_en) ? insight.content_en : insight.content;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Link href={`/${locale}/insights`} className="text-sm text-slate-400 hover:text-indigo-600 transition-colors block mb-4">
        {dict.pages.insights.back}
      </Link>

      <div>
        <h1 className="text-2xl font-black text-slate-900 leading-snug">{title}</h1>
      </div>

      {insight.image && (
        <div className="relative h-64 rounded-xl overflow-hidden bg-slate-200">
          <img src={insight.image} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      <p className="text-base text-slate-600 leading-relaxed border-l-4 border-indigo-200 pl-4 italic">
        {excerpt}
      </p>

      <div className="prose prose-slate max-w-none">
        <MarkdownRenderer>{content}</MarkdownRenderer>
      </div>
    </div>
  );
}
