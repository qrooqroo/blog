'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState, Suspense } from 'react';

function Spinner() {
  const [loading, setLoading] = useState(false);
  const pathname              = usePathname();
  const searchParams          = useSearchParams();
  const prevPath              = useRef(pathname + searchParams.toString());

  useEffect(() => {
    const current = pathname + searchParams.toString();
    if (current !== prevPath.current) {
      setLoading(false);
      prevPath.current = current;
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href) return;
      if (
        href.startsWith('http') || href.startsWith('//') ||
        href.startsWith('#')   || href.startsWith('mailto:') ||
        href.startsWith('tel:')
      ) return;
      if (href.split('?')[0] === pathname) return;
      setLoading(true);
    };
    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [pathname]);

  if (!loading) return null;

  return (
    <>
      <style>{`
        @keyframes face-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        style={{ backgroundColor: 'rgba(248,250,252,0.82)', backdropFilter: 'blur(4px)' }}
      >
        <div className="flex flex-col items-center gap-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/ai-face.png"
            alt=""
            width={120}
            height={120}
            style={{ borderRadius: '50%', animation: 'face-spin 3s linear infinite' }}
          />
          <span className="text-sm text-slate-500 font-medium tracking-wide">불러오는 중...</span>
        </div>
      </div>
    </>
  );
}

export default function NavigationSpinner() {
  return (
    <Suspense>
      <Spinner />
    </Suspense>
  );
}
