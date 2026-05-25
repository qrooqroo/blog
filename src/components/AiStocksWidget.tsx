const MicrosoftIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="11" height="11" fill="#F25022" />
    <rect x="13" y="0" width="11" height="11" fill="#7FBA00" />
    <rect x="0" y="13" width="11" height="11" fill="#00A4EF" />
    <rect x="13" y="13" width="11" height="11" fill="#FFB900" />
  </svg>
);

const AI_STOCKS: { symbol: string; name: string; icon: string | null; IconComponent?: () => React.ReactElement }[] = [
  { symbol: 'NVDA', name: 'Nvidia', icon: 'https://cdn.simpleicons.org/nvidia/76b900' },
  { symbol: 'MSFT', name: 'Microsoft', icon: null, IconComponent: MicrosoftIcon },
  { symbol: 'GOOGL', name: 'Google', icon: 'https://cdn.simpleicons.org/google/4285F4' },
  { symbol: 'META', name: 'Meta', icon: 'https://cdn.simpleicons.org/meta/0082FB' },
  { symbol: 'TSLA', name: 'Tesla', icon: 'https://cdn.simpleicons.org/tesla/E31937' },
];

import React from 'react';

export default function AiStocksWidget() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="grid grid-cols-5 gap-2">
        {AI_STOCKS.map(({ symbol, name, icon, IconComponent }) => (
          <div key={symbol} className="flex flex-col items-center gap-1.5">
            <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
              {IconComponent ? <IconComponent /> : (
                <img src={icon!} alt={name} className="w-5 h-5 object-contain" />
              )}
            </div>
            <span className="text-xs font-semibold text-slate-600">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
