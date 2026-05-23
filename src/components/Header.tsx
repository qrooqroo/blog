import Link from 'next/link';
import { CATEGORIES } from '@/data/articles';

export default function Header() {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4">
        {/* 로고 */}
        <div className="flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-2.5">
            {/* AI 아이콘 */}
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
                <circle cx="9" cy="14" r="1" fill="white" stroke="none"/>
                <circle cx="15" cy="14" r="1" fill="white" stroke="none"/>
              </svg>
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">
              AI Insight Note
            </span>
          </Link>
        </div>

        {/* 카테고리 탭 */}
        <nav className="flex gap-1 overflow-x-auto pb-3 scrollbar-none -mx-1 px-1">
          <Link
            href="/"
            className="flex-shrink-0 px-3 py-1.5 text-sm font-semibold rounded-md text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
          >
            홈
          </Link>
          <Link
            href="/news"
            className="flex-shrink-0 px-3 py-1.5 text-sm font-medium rounded-md text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
          >
            뉴스
          </Link>
          <Link
            href="/wiki"
            className="flex-shrink-0 px-3 py-1.5 text-sm font-medium rounded-md text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
          >
            위키
          </Link>
          <Link
            href="/insights"
            className="flex-shrink-0 px-3 py-1.5 text-sm font-medium rounded-md text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
          >
            인사이트
          </Link>
          <Link
            href="/stocks"
            className="flex-shrink-0 px-3 py-1.5 text-sm font-medium rounded-md text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
          >
            증권·주식
          </Link>
          {CATEGORIES.map(cat => (
            <Link
              key={cat}
              href={`/news/category/${encodeURIComponent(cat)}`}
              className="flex-shrink-0 px-3 py-1.5 text-sm font-medium rounded-md text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
            >
              {cat}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
