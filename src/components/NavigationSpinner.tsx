'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState, Suspense } from 'react';

function Spinner() {
  const [loading, setLoading]   = useState(false);
  const [width, setWidth]       = useState(0);
  const pathname                = usePathname();
  const searchParams            = useSearchParams();
  const prevPath                = useRef(pathname + searchParams.toString());
  const animFrameRef            = useRef<number>(0);
  const timeoutRef              = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const current = pathname + searchParams.toString();
    if (current !== prevPath.current) {
      setLoading(false);
      setWidth(0);
      prevPath.current = current;
    }
  }, [pathname, searchParams]);

  // 5초 안전망 타임아웃
  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => {
      setLoading(false);
      setWidth(0);
    }, 5000);
    return () => clearTimeout(timer);
  }, [loading]);

  // width 애니메이션: 0 → 85% (느리게), 완료 시 100% → hide
  useEffect(() => {
    if (!loading) return;
    let current = 0;
    const tick = () => {
      current = Math.min(current + (85 - current) * 0.04, 84);
      setWidth(current);
      animFrameRef.current = requestAnimationFrame(tick);
    };
    animFrameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [loading]);

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
      setWidth(0);
    };
    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [pathname]);

  if (!loading) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999]"
      style={{ height: '3px', pointerEvents: 'none' }}
    >
      <div
        style={{
          height: '100%',
          width: `${width}%`,
          background: 'linear-gradient(90deg, #6366f1, #22d3ee)',
          transition: 'width 0.1s linear',
          boxShadow: '0 0 8px rgba(99,102,241,0.8)',
        }}
      />
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
