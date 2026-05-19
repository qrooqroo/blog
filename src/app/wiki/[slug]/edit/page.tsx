export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getArticleBySlug } from '@/lib/articles';
import { getNewsBySlug } from '@/lib/news';
import EditorClient from '@/components/EditorClient';
import { headers } from 'next/headers';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function WikiEditPage({ params }: Props) {
  const host = (await headers()).get('host') ?? '';
  if (!host.startsWith('localhost') && !host.startsWith('127.0.0.1')) notFound();

  const { slug } = await params;
  const article = (await getArticleBySlug(slug)) ?? (await getNewsBySlug(slug));
  if (!article) notFound();
  return <Suspense><EditorClient article={article} /></Suspense>;
}
