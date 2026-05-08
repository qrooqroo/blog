import Link from 'next/link';
import { CATEGORIES } from '@/data/articles';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row gap-8 justify-between">
          <div>
            <span className="text-xl font-black text-white">생각의 날개</span>
            <p className="mt-2 text-sm">세상의 온갖 잡지식을 담다</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-300 mb-3">카테고리</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <Link key={cat} href={`/category/${encodeURIComponent(cat)}`}
                  className="text-xs px-2 py-1 bg-gray-800 rounded hover:bg-red-600 hover:text-white transition-colors">
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6 text-xs text-center">
          © 2026 생각의 날개. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
