export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getInsightBySlug } from '@/lib/insights';
import { formatDate } from '@/lib/format';
import MarkdownRenderer from '@/components/MarkdownRenderer';

const SITE_URL = 'https://aiinsightnote.com';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const insight = await getInsightBySlug(slug);
  if (!insight) return { title: '인사이트 | AI Insight Note' };

  const url = `${SITE_URL}/insights/${slug}`;
  const description = insight.excerpt ?? insight.content.slice(0, 160).replace(/\n/g, ' ');

  return {
    title: { absolute: `${insight.title} | AI Insight Note` },
    description,
    keywords: insight.tags ?? [],
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title: insight.title,
      description,
      images: insight.image ? [{ url: insight.image, width: 800, height: 450, alt: insight.title }] : [],
      publishedTime: insight.date,
      tags: insight.tags ?? [],
      siteName: 'AI Insight Note',
      locale: 'ko_KR',
    },
    twitter: {
      card: 'summary_large_image',
      title: insight.title,
      description,
      images: insight.image ? [insight.image] : [],
    },
  };
}

export default async function InsightPage({ params }: Props) {
  const { slug } = await params;
  const insight = await getInsightBySlug(slug);

  if (!insight) return notFound();

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* 뒤로가기 */}
      <Link href="/insights" className="text-sm text-slate-400 hover:text-indigo-600 transition-colors block mb-4">
        ← 인사이트 목록
      </Link>

      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 leading-snug">{insight.title}</h1>
      </div>

      {/* 썸네일 */}
      {insight.image && (
        <div className="relative h-64 rounded-xl overflow-hidden bg-slate-200">
          <img src={insight.image} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      {/* 요약 */}
      <p className="text-base text-slate-600 leading-relaxed border-l-4 border-indigo-200 pl-4 italic">
        {insight.excerpt}
      </p>

      {/* 본문 */}
      <div className="prose prose-slate max-w-none">
        <MarkdownRenderer>{insight.content}</MarkdownRenderer>
      </div>
    </div>
  );
}
