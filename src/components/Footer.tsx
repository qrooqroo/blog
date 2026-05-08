import Link from 'next/link';
import { CATEGORIES } from '@/data/articles';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white mt-16">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row gap-8 justify-between">
          {/* 브랜드 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
                  <circle cx="9" cy="14" r="1" fill="white" stroke="none"/>
                  <circle cx="15" cy="14" r="1" fill="white" stroke="none"/>
                </svg>
              </div>
              <span className="font-black text-slate-900">AI Insight Note</span>
            </div>
            <p className="text-sm text-slate-400 max-w-xs">
              AI와 나눈 대화와 인사이트를 기록하는 공간
            </p>
          </div>

          {/* 카테고리 */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">카테고리</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <Link
                  key={cat}
                  href={`/category/${encodeURIComponent(cat)}`}
                  className="text-xs px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 mt-8 pt-6 text-xs text-slate-400 text-center">
          © 2026 AI Insight Note. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
