'use client';

import dynamic from 'next/dynamic';

const GraphicsScene = dynamic(() => import('./Scene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-400 text-sm">
      로딩 중…
    </div>
  ),
});

export default function ClientLoader() {
  return <GraphicsScene />;
}
