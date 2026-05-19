import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import EditorClient from '@/components/EditorClient';

export default async function EditorPage() {
  const host = (await headers()).get('host') ?? '';
  if (!host.startsWith('localhost') && !host.startsWith('127.0.0.1')) notFound();

  return (
    <Suspense>
      <EditorClient />
    </Suspense>
  );
}
