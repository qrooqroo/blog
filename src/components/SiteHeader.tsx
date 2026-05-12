export default function SiteHeader() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 px-6 sm:px-10 py-5 flex items-center justify-between overflow-hidden relative">
      {/* Left: Logo + Divider + Subtitle */}
      <div className="flex items-center gap-5 sm:gap-7 min-w-0">
        <div className="flex items-center flex-shrink-0">
          <span
            className="font-black tracking-tight leading-none"
            style={{ fontSize: '1.6rem', color: '#4f46e5' }}
          >
            AI
          </span>
          <span
            className="font-black tracking-tight leading-none ml-1.5"
            style={{ fontSize: '1.6rem', color: '#0f172a' }}
          >
            INSIGHT NOTE
          </span>
        </div>

        <div className="hidden sm:block w-px h-7 bg-slate-200 flex-shrink-0" />

        <p className="hidden sm:block text-sm text-slate-400 whitespace-nowrap">
          AI · Web3 · 기술 트렌드와 인사이트를 한눈에
        </p>
      </div>

      {/* Right: Icons + Dot grid */}
      <div className="hidden md:flex items-center gap-6 flex-shrink-0">
        {/* Icons */}
        <div className="flex items-center gap-4">
          {/* Cube */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
            <line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>

          {/* Shield */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <polyline points="8 11 11 14 16 9"/>
          </svg>

          {/* Bar chart */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"/>
            <line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/>
            <line x1="2" y1="20" x2="22" y2="20"/>
          </svg>
        </div>

        {/* Dot grid */}
        <div
          className="w-20 h-10 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle, #94a3b8 1px, transparent 1px)',
            backgroundSize: '8px 8px',
          }}
        />
      </div>
    </div>
  );
}
