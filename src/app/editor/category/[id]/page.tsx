export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { supabase } from '@/lib/supabase';
import CategoryEditorClient from './CategoryEditorClient';

interface Props { params: Promise<{ id: string }> }

export default async function CategoryEditorPage({ params }: Props) {
  const host = (await headers()).get('host') ?? '';
  if (!host.startsWith('localhost') && !host.startsWith('127.0.0.1')) notFound();

  const { id } = await params;
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug, parent_id, excerpt, markdown_content, image')
    .eq('id', Number(id))
    .single();

  if (error || !data) notFound();

  return <CategoryEditorClient category={data as {
    id: number; name: string; slug: string; parent_id: number | null;
    excerpt: string; markdown_content: string; image: string;
  }} />;
}
