'use client';
import { useEffect, useState } from 'react';
import SiteHeader from './SiteHeader';

export default function HomeSiteNav({ locale }: { locale: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const header = document.getElementById('site-header');
    if (!header) return;

    const check = () => {
      const rect = header.getBoundingClientRect();
      setVisible(rect.top < 0);
    };

    window.addEventListener('scroll', check, { passive: true });
    check();
    return () => window.removeEventListener('scroll', check);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 shadow-sm transition-transform duration-150"
      style={{ transform: visible ? 'translateY(0)' : 'translateY(-100%)' }}
      aria-hidden={!visible}
    >
      <SiteHeader
        locale={locale}
        className="max-w-5xl mx-auto px-4 py-5 flex items-center justify-between overflow-hidden relative"
      />
    </div>
  );
}
