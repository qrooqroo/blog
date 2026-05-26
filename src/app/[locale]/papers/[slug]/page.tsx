export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPaperBySlug } from '@/lib/papers';
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
  const paper = await getPaperBySlug(slug);
  if (!paper) return { title: '논문 분석 | AI Insight Note' };

  const isEn = locale === 'en';
  const title = (isEn && paper.title_en) ? paper.title_en : paper.title;
  const description = (isEn && paper.excerpt_en) ? paper.excerpt_en : (paper.excerpt ?? paper.content.slice(0, 160).replace(/\n/g, ' '));
  const url = `${SITE_URL}/${locale}/papers/${slug}`;

  return {
    title: { absolute: `${title} | AI Insight Note` },
    description,
    keywords: paper.tags ?? [],
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title,
      description,
      images: [],
      publishedTime: paper.date,
      tags: paper.tags ?? [],
      siteName: 'AI Insight Note',
      locale: isEn ? 'en_US' : 'ko_KR',
    },
  };
}

export default async function PaperPage({ params }: Props) {
  const { locale: raw, slug } = await params;
  const locale = isValidLocale(raw) ? raw : defaultLocale;
  const dict = getDictionary(locale);
  const paper = await getPaperBySlug(slug);

  if (!paper) return notFound();

  const isEn = locale === 'en';
  const title = (isEn && paper.title_en) ? paper.title_en : paper.title;
  const excerpt = (isEn && paper.excerpt_en) ? paper.excerpt_en : paper.excerpt;
  const content = (isEn && paper.content_en) ? paper.content_en : paper.content;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href={`/${locale}`} className="text-sm text-slate-400 hover:text-indigo-600 transition-colors block">
        {dict.pages.papers.back}
      </Link>

      <h1 className="text-2xl font-black text-slate-900 leading-snug">{title}</h1>

      <div className="flex items-center justify-between">
        {paper.analyst && (
          <p className="text-sm text-slate-500">by <span className="font-bold text-slate-700">{paper.analyst}</span></p>
        )}
        <span className="text-xs text-slate-400">{formatDate(paper.date)}</span>
      </div>

      {paper.arxiv_id ? (
        <a
          href={`https://arxiv.org/pdf/${paper.arxiv_id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1 hover:border-indigo-300 hover:bg-indigo-50 transition-colors group"
        >
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide group-hover:text-indigo-400 transition-colors">{dict.pages.papers.original} ↗</p>
          <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">{paper.paper_title}</p>
          <p className="text-xs text-slate-500">{paper.authors}</p>
          {paper.paper_date && (
            <p className="text-xs text-slate-400">{dict.pages.papers.published} {formatDate(paper.paper_date)}</p>
          )}
        </a>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">{dict.pages.papers.original}</p>
          <p className="text-sm font-bold text-slate-800">{paper.paper_title}</p>
          <p className="text-xs text-slate-500">{paper.authors}</p>
          {paper.paper_date && (
            <p className="text-xs text-slate-400">{dict.pages.papers.published} {formatDate(paper.paper_date)}</p>
          )}
        </div>
      )}

      <p className="text-base text-slate-600 leading-relaxed border-l-4 border-indigo-200 pl-4 italic">
        {excerpt}
      </p>

      <div className="prose prose-slate max-w-none">
        <MarkdownRenderer>{content}</MarkdownRenderer>
      </div>

      {paper.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
          {paper.tags.map(tag => (
            <span key={tag} className="text-xs bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
