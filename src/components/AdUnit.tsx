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

    // unfilled 상태가 확정될 때만 래퍼를 숨김 — ins가 보여야 AdSense가 크기를 잡고 처리함
    const observer = new MutationObserver(() => {
      if (ins.getAttribute('data-ad-status') === 'unfilled') {
        wrap.style.display = 'none';
      }
    });
    observer.observe(ins, { attributes: true, attributeFilter: ['data-ad-status'] });
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className={`overflow-hidden text-center ${className}`}>
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
