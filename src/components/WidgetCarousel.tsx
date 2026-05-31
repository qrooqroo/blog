'use client';
import { useState, useEffect, useRef } from 'react';
import React from 'react';

const VISIBLE = 3;
const GAP = 12;
const INTERVAL = 4000;
const DURATION = 300;

export default function WidgetCarousel({ children }: { children: React.ReactNode }) {
  const childArray = React.Children.toArray(children);
  const count = childArray.length;
  // 끝에 앞쪽 VISIBLE개를 복제해 붙여 무한 좌향 루프 구현
  const items = [...childArray, ...childArray.slice(0, VISIBLE)];

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

  // 복제 구간에 진입하면 트랜지션 완료 후 조용히 되감기
  useEffect(() => {
    if (index < count) return;
    const id = setTimeout(() => {
      setTransitioning(false);
      setIndex(index - count);
    }, DURATION);
    return () => clearTimeout(id);
  }, [index, count]);

  // 되감기 직후 다음 프레임에서 트랜지션 복구
  useEffect(() => {
    if (transitioning) return;
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => setTransitioning(true))
    );
    return () => cancelAnimationFrame(id);
  }, [transitioning]);

  const transform = `translateX(calc(${-index} * (100% + ${GAP}px) / ${VISIBLE}))`;

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
            style={{ width: `calc((100% - ${(VISIBLE - 1) * GAP}px) / ${VISIBLE})` }}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}
