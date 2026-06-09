'use client';

import { useEffect, useRef } from 'react';

const CHAR_POOL = '01001011010010110100101001010110100101101001011010010101001011010011010100110101001101001100110001100011000110101010011';

export default function MatrixLoader() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
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

    let frameId: number;
    let lastTime = 0;

    const draw = (now: number) => {
      frameId = requestAnimationFrame(draw);
      if (now - lastTime < 40) return;
      lastTime = now;

      ctx.fillStyle = 'rgba(2, 8, 20, 0.07)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px 'Courier New', monospace`;

      for (let i = 0; i < drops.length; i++) {
        const ch = CHAR_POOL[Math.floor(Math.random() * CHAR_POOL.length)];
        const x  = i * fontSize;
        const y  = drops[i] * fontSize;

        if (y >= 0 && y < canvas.height) {
          ctx.fillStyle = colColors[i];
          ctx.fillText(ch, x, y);
        }

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = Math.floor(Math.random() * -30);
        }
        drops[i]++;
      }
    };

    frameId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', setSize);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[9999]" style={{ background: '#020814' }}>
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
