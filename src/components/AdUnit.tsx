'use client';

import { useEffect, useRef } from 'react';

interface Props {
  slot: string;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export default function AdUnit({ slot, className = '' }: Props) {
  const insRef = useRef<HTMLModElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {}

    const ins = insRef.current;
    const wrap = wrapRef.current;
    if (!ins || !wrap) return;

    // filled 상태가 될 때만 래퍼를 표시 — 빈 공간 깜빡임 없음
    const observer = new MutationObserver(() => {
      if (ins.getAttribute('data-ad-status') === 'filled') {
        wrap.style.display = 'block';
      }
    });
    observer.observe(ins, { attributes: true, attributeFilter: ['data-ad-status'] });
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={wrapRef} style={{ display: 'none' }} className={`overflow-hidden text-center ${className}`}>
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-4600038940266134"
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
