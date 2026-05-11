import { notFound } from 'next/navigation';
import { getArticleById } from '@/lib/articles';
import { getNewsById } from '@/lib/news';
import EditorClient from '@/components/EditorClient';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditPage({ params }: Props) {
  const { id } = await params;
  const nid = Number(id);
  const article = (await getArticleById(nid)) ?? (await getNewsById(nid));
  if (!article) notFound();
  return <EditorClient article={article} />;
}
