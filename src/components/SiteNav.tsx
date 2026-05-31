'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/insights', ko: '인사이트', en: 'Insights' },
  { href: '/papers',   ko: '논문 분석', en: 'Papers' },
  { href: '/news',     ko: '뉴스',      en: 'News' },
];

export default function SiteNav({ locale = 'ko', navClassName }: { locale?: string; navClassName?: string }) {
  const pathname = usePathname();
  const isEn = locale === 'en';

  return (
    <nav className={navClassName ?? 'sticky top-0 z-50 bg-white border-b border-slate-200'}>
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-0.5 flex-shrink-0 py-3">
          <span className="font-black tracking-tight text-indigo-600 text-lg leading-none">AI</span>
          <span className="font-black tracking-tight text-slate-900 text-lg leading-none ml-1">INSIGHT NOTE</span>
        </Link>

        <div className="flex items-center gap-1">
          {NAV_LINKS.map(item => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                {isEn ? item.en : item.ko}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
