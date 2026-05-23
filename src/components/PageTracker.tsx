'use client';
import { useEffect, useRef } from 'react';

export default function PageTracker({ slug }: { slug: string }) {
  const viewId = useRef<number | null>(null);
  const startAt = useRef<number>(Date.now());

  useEffect(() => {
    let active = true;

    // 페이지뷰 기록
    fetch('/api/analytics/pageview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug,
        referrer: document.referrer,
      }),
    })
      .then(r => r.json())
      .then(data => {
        if (active && data.id) viewId.current = data.id;
      })
      .catch(() => {});

    startAt.current = Date.now();

    // 체류시간 전송
    const sendDuration = () => {
      if (!viewId.current) return;
      const duration = Math.round((Date.now() - startAt.current) / 1000);
      // sendBeacon: 페이지 이탈 후에도 전송 보장
      navigator.sendBeacon(
        '/api/analytics/duration',
        JSON.stringify({ id: viewId.current, duration }),
      );
    };

    window.addEventListener('beforeunload', sendDuration);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') sendDuration();
    });

    return () => {
      active = false;
      sendDuration();
      window.removeEventListener('beforeunload', sendDuration);
    };
  // slug가 바뀌면 새 추적 시작
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  return null;
}
