'use client';
import { useState, useEffect, useRef } from 'react';
import React from 'react';

const GAP = 12;
const INTERVAL = 4000;
const DURATION = 300;
const SM = 640;

function useVisible() {
  const [visible, setVisible] = useState(typeof window !== 'undefined' && window.innerWidth < SM ? 1 : 3);
  useEffect(() => {
    const update = () => setVisible(window.innerWidth < SM ? 1 : 3);
    window.addEventListener('resize', update, { passive: true });
    return () => window.removeEventListener('resize', update);
  }, []);
  return visible;
}

export default function WidgetCarousel({ children }: { children: React.ReactNode }) {
  const childArray = React.Children.toArray(children);
  const count = childArray.length;
  const visible = useVisible();
  const items = [...childArray, ...childArray.slice(0, visible)];

  const [index, setIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setIndex(i => i + 1), INTERVAL);
  };

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  // visible 변경 시 index 리셋
  useEffect(() => {
    setIndex(0);
    startTimer();
  }, [visible]);

  useEffect(() => {
    if (index < count) return;
    const id = setTimeout(() => {
      setTransitioning(false);
      setIndex(index - count);
    }, DURATION);
    return () => clearTimeout(id);
  }, [index, count]);

  useEffect(() => {
    if (transitioning) return;
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => setTransitioning(true))
    );
    return () => cancelAnimationFrame(id);
  }, [transitioning]);

  const transform = `translateX(calc(${-index} * (100% + ${GAP}px) / ${visible}))`;

  return (
    <div className="overflow-hidden">
      <div
        className="flex items-stretch gap-3"
        style={{
          transform,
          transition: transitioning ? `transform ${DURATION}ms ease-in-out` : 'none',
        }}
      >
        {items.map((child, i) => (
          <div
            key={i}
            className="flex-none flex flex-col"
            style={{ width: `calc((100% - ${(visible - 1) * GAP}px) / ${visible})` }}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}
