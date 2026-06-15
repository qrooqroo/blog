import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 bg-slate-800">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <p className="text-xs text-white/70">© 2026 AI Insight Note. All rights reserved.</p>
        <div className="flex items-center gap-4 flex-shrink-0">
          <Link href="/about" className="text-xs text-white/60 hover:text-white transition-colors">
            About
          </Link>
          <Link href="/privacy" className="text-xs text-white/60 hover:text-white transition-colors">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
