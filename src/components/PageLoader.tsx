'use client';

import { useLayoutEffect, useEffect, useRef, useState } from 'react';

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
    if (drops[i] * fontSize > h && Math.random() > 0.975) drops[i] = Math.floor(Math.random() * -30);
    drops[i]++;
  }
}

export default function PageLoader() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setSize();
    window.addEventListener('resize', setSize);

    const fontSize = 14;
    const cols = Math.floor(canvas.width / fontSize);
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
  }, []);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 700);
    const hideTimer = setTimeout(() => {
      setVisible(false);
      document.documentElement.classList.add('pg-loaded');
    }, 1200);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#020814',
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.5s ease',
        pointerEvents: fading ? 'none' : 'auto',
      }}
    >
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0 }} />
    </div>
  );
}
