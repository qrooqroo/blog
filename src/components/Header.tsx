import Link from 'next/link';
import { CATEGORIES } from '@/data/articles';

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        {/* 상단: 로고 */}
        <div className="flex items-center py-3 border-b border-gray-100">
          <Link href="/">
            <span className="text-2xl font-black text-red-600 tracking-tight">AI Insight Note</span>
          </Link>
        </div>

        {/* 하단: 카테고리 네비게이션 */}
        <nav className="flex gap-1 overflow-x-auto py-2 scrollbar-none">
          <Link
            href="/"
            className="flex-shrink-0 px-4 py-1.5 text-sm font-semibold rounded text-white bg-red-600 hover:bg-red-700 transition-colors"
          >
            전체
          </Link>
          {CATEGORIES.map(cat => (
            <Link
              key={cat}
              href={`/category/${encodeURIComponent(cat)}`}
              className="flex-shrink-0 px-4 py-1.5 text-sm font-medium rounded text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              {cat}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
