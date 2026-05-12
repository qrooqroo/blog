import Link from 'next/link';
import { CATEGORIES } from '@/data/articles';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white mt-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="my-8 text-xs text-slate-400 text-center">
          © 2026 AI Insight Note. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
