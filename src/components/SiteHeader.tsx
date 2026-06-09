'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useWidgetsVisible } from '@/lib/useWidgetsVisible';
import { getDictionary, isValidLocale, defaultLocale } from '@/lib/i18n/dictionaries';

export default function SiteHeader({ locale: localeProp, id, className }: { locale?: string; id?: string; className?: string }) {
  const params = useParams<{ locale?: string }>();
  const rawLocale = localeProp ?? params?.locale ?? defaultLocale;
  const locale = isValidLocale(rawLocale) ? rawLocale : defaultLocale;
  const dict = getDictionary(locale);

  const { visible, toggle } = useWidgetsVisible();

  return (
    <div
      {...(id ? { id } : {})}
      className={className ?? 'bg-white rounded-xl border border-slate-200 px-6 sm:px-10 py-5 flex items-center justify-between overflow-hidden relative'}
    >
      {/* Left: Logo + Divider + Subtitle */}
      <div className="flex items-center gap-5 sm:gap-7 min-w-0">
        <Link href="/" className="flex items-center flex-shrink-0">
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
        </Link>

        <div className="hidden sm:block w-px h-7 bg-slate-200 flex-shrink-0" />

        <p className="hidden sm:block text-sm text-slate-400 whitespace-nowrap">
          {dict.site.subtitle}
        </p>
      </div>

      {/* Right: Toggle + Icons + Dot grid */}
      <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0">
        {/* 위젯 온오프 토글 버튼 (한국어 전용) */}
        {locale === 'ko' && (
          <button
            onClick={toggle}
            title={visible ? dict.nav.widgetsHide : dict.nav.widgetsShow}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
              visible
                ? 'border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300'
                : 'border-indigo-200 text-indigo-400 hover:text-indigo-600 hover:border-indigo-300'
            }`}
          >
            {visible ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            )}
            {dict.nav.widgets}
          </button>
        )}

        {/* Decorative icons (md 이상에서만) */}
        <div className="hidden md:flex items-center gap-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
            <line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <polyline points="8 11 11 14 16 9"/>
          </svg>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"/>
            <line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/>
            <line x1="2" y1="20" x2="22" y2="20"/>
          </svg>
        </div>

        {/* Dot grid → sitemap link */}
        <Link
          href="/sitemap.xml"
          title="사이트맵"
          className="hidden md:block w-20 h-10 opacity-30 hover:opacity-60 transition-opacity cursor-pointer"
          style={{
            backgroundImage: 'radial-gradient(circle, #94a3b8 1px, transparent 1px)',
            backgroundSize: '8px 8px',
          }}
        />
      </div>
    </div>
  );
}
