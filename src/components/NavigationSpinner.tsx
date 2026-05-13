'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState, Suspense } from 'react';

function Spinner() {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prevPath = useRef(pathname + searchParams.toString());

  // 경로 바뀌면 로딩 종료
  useEffect(() => {
    const current = pathname + searchParams.toString();
    if (current !== prevPath.current) {
      setLoading(false);
      prevPath.current = current;
    }
  }, [pathname, searchParams]);

  // 링크 클릭 시 로딩 시작
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      // 외부 링크·해시·mail·tel 제외
      if (
        href.startsWith('http') ||
        href.startsWith('//') ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:')
      ) return;

      // 현재 페이지와 동일한 경로면 제외
      const targetPath = href.split('?')[0];
      if (targetPath === pathname) return;

      setLoading(true);
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [pathname]);

  if (!loading) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(248, 250, 252, 0.75)', backdropFilter: 'blur(3px)' }}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-slate-500 font-medium">불러오는 중...</span>
      </div>
    </div>
  );
}

export default function NavigationSpinner() {
  return (
    <Suspense>
      <Spinner />
    </Suspense>
  );
}
