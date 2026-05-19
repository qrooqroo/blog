'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  id: number;
  slug: string;
}

export default function PublishButton({ id, slug }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handlePublish = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    try {
      const res = await fetch(`/api/articles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: true }),
      });
      if (res.ok) {
        setDone(true);
        setTimeout(() => router.refresh(), 600);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePublish}
      disabled={loading || done}
      className={`flex-1 py-1.5 text-xs font-bold rounded-lg shadow transition-all
        ${done
          ? 'bg-green-500 text-white'
          : 'bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-60'
        }`}
    >
      {done ? '✓ 발행됨' : loading ? '...' : '🚀 발행'}
    </button>
  );
}
