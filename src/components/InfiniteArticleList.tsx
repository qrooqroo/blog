'use client';

import { useEffect, useRef, useState } from 'react';
import ArticleCard from '@/components/ArticleCard';
import { Article } from '@/types';

const LIMIT = 9;

const DEFAULT_IMAGE_URLS = new Set([
  'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80&fit=crop',
  'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80&fit=crop',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80&fit=crop',
  'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80&fit=crop',
  'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&q=80&fit=crop',
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80&fit=crop',
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80&fit=crop',
  'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80&fit=crop',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80&fit=crop',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80&fit=crop',
]);

function isDefaultImg(url: string | null | undefined) {
  if (!url) return true;
  return DEFAULT_IMAGE_URLS.has(url);
}

interface Props {
  initialArticles: Article[];
  filterDefaults?: boolean;
  apiPath?: string;
}

export default function InfiniteArticleList({ initialArticles, filterDefaults = false, apiPath = '/api/articles' }: Props) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [loading,  setLoading]  = useState(false);
  const [hasMore,  setHasMore]  = useState(initialArticles.length === LIMIT);

  // ref로 최신 값 유지 — observer 콜백에서 stale closure 방지
  const pageRef     = useRef(2);
  const loadingRef  = useRef(false);
  const hasMoreRef  = useRef(initialArticles.length === LIMIT);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        if (!entries[0].isIntersecting) return;
        if (loadingRef.current || !hasMoreRef.current) return;

        loadingRef.current = true;
        setLoading(true);

        try {
          const res  = await fetch(`${apiPath}?page=${pageRef.current}&limit=${LIMIT}`);
          const data = await res.json();
          const raw: Article[] = data.articles ?? [];
          const next = filterDefaults ? raw.filter(a => !isDefaultImg(a.image)) : raw;

          setArticles(prev => {
            const seen = new Set(prev.map(a => a.id));
            return [...prev, ...next.filter(a => !seen.has(a.id))];
          });
          pageRef.current += 1;

          if (raw.length < LIMIT) {
            hasMoreRef.current = false;
            setHasMore(false);
          }
        } catch {
          hasMoreRef.current = false;
          setHasMore(false);
        } finally {
          loadingRef.current = false;
          setLoading(false);
        }
      },
      { rootMargin: '300px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []); // 컴포넌트 생애 동안 observer 유지

  return (
    <>
      {articles.length === 0 ? (
        <p className="text-sm text-slate-400 py-16 text-center">아직 작성된 글이 없습니다.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {articles.map(a => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      )}

      <div ref={sentinelRef} className="h-4" />

      {loading && (
        <div className="flex justify-center py-6">
          <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!hasMore && articles.length > LIMIT && (
        <p className="text-center text-xs text-slate-300 py-4">모든 글을 불러왔습니다.</p>
      )}
    </>
  );
}
