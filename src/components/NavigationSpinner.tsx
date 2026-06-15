'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useLayoutEffect, useRef, useState, Suspense } from 'react';

const CHAR_POOL = '01001011010010110100101001010110100101101001011010010101001011010011010100110101001101001100110001100011000110101010011';

function drawFrame(
  ctx: CanvasRenderingContext2D,
  drops: number[],
  colColors: string[],
  fontSize: number,
  w: number,
  h: number,
) {
  ctx.fillStyle = 'rgba(2, 8, 20, 0.07)';
  ctx.fillRect(0, 0, w, h);
  ctx.font = `${fontSize}px 'Courier New', monospace`;
  for (let i = 0; i < drops.length; i++) {
    const y = drops[i] * fontSize;
    if (y >= 0 && y < h) {
      ctx.fillStyle = colColors[i];
      ctx.fillText(CHAR_POOL[Math.floor(Math.random() * CHAR_POOL.length)], i * fontSize, y);
    }
    if (drops[i] * fontSize > h && Math.random() > 0.975) {
      drops[i] = Math.floor(Math.random() * -30);
    }
    drops[i]++;
  }
}

function Spinner() {
  const [loading, setLoading]   = useState(false);
  const pathname                = usePathname();
  const searchParams            = useSearchParams();
  const prevPath                = useRef(pathname + searchParams.toString());
  const canvasRef               = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const current = pathname + searchParams.toString();
    if (current !== prevPath.current) {
      setLoading(false);
      prevPath.current = current;
    }
  }, [pathname, searchParams]);

  // 최대 8초 후 강제 해제 — 서버 렌더링 지연으로 pathname이 늦게 업데이트될 때 방지
  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => setLoading(false), 8000);
    return () => clearTimeout(timer);
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
    };
    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [pathname]);

  useLayoutEffect(() => {
    if (!loading) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setSize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setSize();
    window.addEventListener('resize', setSize);

    const fontSize = 14;
    const cols     = Math.floor(canvas.width / fontSize);
    const totalRows = Math.floor(canvas.height / fontSize);

    const drops = Array.from({ length: cols }, () =>
      Math.random() < 0.5
        ? Math.floor(Math.random() * totalRows)
        : Math.floor(Math.random() * -totalRows)
    );

    const colColors = Array.from({ length: cols }, () => {
      const r = Math.random();
      if (r > 0.88) return '#818cf8';
      if (r > 0.68) return '#60a5fa';
      return '#22d3ee';
    });

    // Draw initial frame before first browser paint so canvas is never blank
    ctx.fillStyle = '#020814';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawFrame(ctx, drops, colColors, fontSize, canvas.width, canvas.height);

    let frameId: number;
    let lastTime = 0;

    const draw = (now: number) => {
      frameId = requestAnimationFrame(draw);
      if (now - lastTime < 40) return;
      lastTime = now;
      drawFrame(ctx, drops, colColors, fontSize, canvas.width, canvas.height);
    };

    frameId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', setSize);
    };
  }, [loading]);

  if (!loading) return null;

  return (
    <>
      <div className="fixed inset-0 z-[9999]" style={{ background: '#020814' }}>
        <canvas ref={canvasRef} className="absolute inset-0" />
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
