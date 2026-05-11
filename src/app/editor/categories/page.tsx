import Link from 'next/link';
import CategoriesClient from '@/components/CategoriesClient';

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="sticky top-0 z-50 bg-white border-b border-slate-200 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/editor" className="text-slate-400 hover:text-slate-600 text-sm transition-colors">
            ← 에디터
          </Link>
          <span className="text-slate-200">|</span>
          <span className="text-sm font-bold text-slate-700">카테고리 관리</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <CategoriesClient />
      </div>
    </div>
  );
}
