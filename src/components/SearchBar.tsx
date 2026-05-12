'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

interface Result {
  id: number;
  title: string;
  slug: string;
  category: string;
  image: string;
  date: string;
}

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setResults([]); setOpen(false); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.results ?? []);
      setOpen(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(query), 300);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query, search]);

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="문서 검색..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition"
        />
        {loading && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full mt-2 left-0 right-0 z-50 bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
          {results.map(r => (
            <Link
              key={r.id}
              href={`/wiki/${r.slug}`}
              onClick={() => { setOpen(false); setQuery(''); }}
              className="flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 transition-colors border-b border-slate-100 last:border-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={r.image} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-slate-100" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{r.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">{r.category}</p>
              </div>
            </Link>
          ))}
          {results.length === 0 && (
            <p className="px-4 py-4 text-sm text-slate-400 text-center">검색 결과가 없습니다.</p>
          )}
        </div>
      )}

      {open && query.trim().length >= 2 && results.length === 0 && !loading && (
        <div className="absolute top-full mt-2 left-0 right-0 z-50 bg-white rounded-xl border border-slate-200 shadow-lg px-4 py-4 text-sm text-slate-400 text-center">
          검색 결과가 없습니다.
        </div>
      )}
    </div>
  );
}
