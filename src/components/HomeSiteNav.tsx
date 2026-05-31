'use client';
import { useEffect, useState } from 'react';
import SiteNav from './SiteNav';

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
      className="fixed top-0 left-0 right-0 z-50 transition-transform duration-150"
      style={{ transform: visible ? 'translateY(0)' : 'translateY(-100%)' }}
      aria-hidden={!visible}
    >
      <SiteNav locale={locale} navClassName="bg-white border-b border-slate-200" />
    </div>
  );
}
