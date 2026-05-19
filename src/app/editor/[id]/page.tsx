export const dynamic = 'force-dynamic';

import { redirect, notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { getArticleById } from '@/lib/articles';
import { getNewsById } from '@/lib/news';

interface Props {
  params: Promise<{ id: string }>;
}

// /editor/{id} → /wiki/{slug}/edit 리다이렉트
export default async function EditRedirectPage({ params }: Props) {
  const host = (await headers()).get('host') ?? '';
  if (!host.startsWith('localhost') && !host.startsWith('127.0.0.1')) notFound();

  const { id } = await params;
  const nid = Number(id);
  const article = (await getArticleById(nid)) ?? (await getNewsById(nid));
  if (!article) notFound();
  redirect(`/wiki/${article.slug}/edit`);
}
