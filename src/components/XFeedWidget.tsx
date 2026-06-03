'use client';

import { useState, useEffect, useRef } from 'react';

const ACCOUNTS = [
  { handle: 'elonmusk',      name: 'Elon Musk' },
  { handle: 'sama',          name: 'Sam Altman' },
  { handle: 'JensenHuang',   name: 'Jensen Huang' },
  { handle: 'karpathy',      name: 'Karpathy' },
  { handle: 'ylecun',        name: 'Yann LeCun' },
  { handle: 'AnthropicAI',   name: 'Anthropic' },
  { handle: 'GoogleDeepMind',name: 'DeepMind' },
  { handle: 'nvidia',        name: 'NVIDIA' },
];

declare global {
  interface Window {
    twttr?: { widgets: { load: (el?: Element | null) => void } };
  }
}

export default function XFeedWidget({ locale = 'ko' }: { locale?: string }) {
  const [active, setActive] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = () => window.twttr?.widgets.load(containerRef.current);

    if (!document.querySelector('script[src="https://platform.twitter.com/widgets.js"]')) {
      const s = document.createElement('script');
      s.src = 'https://platform.twitter.com/widgets.js';
      s.async = true;
      s.onload = init;
      document.body.appendChild(s);
    } else {
      init();
    }
  }, [active]);

  const label = locale === 'en' ? 'X Voices' : 'X 피드';

  return (
    <div className="rounded-2xl bg-gradient-to-r from-slate-50 via-zinc-50 to-slate-100 border border-slate-200 shadow-sm px-3 pt-3 pb-3">
      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-2.5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-slate-800 flex-shrink-0">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
        <span className="text-sm font-bold text-slate-700">{label}</span>
      </div>

      {/* 탭 */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {ACCOUNTS.map((acc, i) => (
          <button
            key={acc.handle}
            onClick={() => setActive(i)}
            className={`px-2.5 py-0.5 text-xs rounded-full font-medium transition-colors ${
              i === active
                ? 'bg-slate-800 text-white'
                : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            @{acc.handle}
          </button>
        ))}
      </div>

      {/* 타임라인 */}
      <div
        ref={containerRef}
        key={active}
        className="rounded-xl overflow-hidden bg-white"
        style={{ height: 420 }}
      >
        <a
          className="twitter-timeline"
          data-height="420"
          data-theme="light"
          href={`https://twitter.com/${ACCOUNTS[active].handle}`}
        >
          @{ACCOUNTS[active].handle}
        </a>
      </div>
    </div>
  );
}
