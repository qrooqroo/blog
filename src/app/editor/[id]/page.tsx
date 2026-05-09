import { notFound } from 'next/navigation';
import { getArticleById } from '@/lib/articles';
import EditorClient from '@/components/EditorClient';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditPage({ params }: Props) {
  const { id } = await params;
  const article = await getArticleById(Number(id));
  if (!article) notFound();
  return <EditorClient article={article} />;
}
