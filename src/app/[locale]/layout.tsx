import type { Metadata } from 'next';
import Script from 'next/script';
import Footer from '@/components/Footer';
import NavigationSpinner from '@/components/NavigationSpinner';
import HomeSiteNav from '@/components/HomeSiteNav';
import SiteHeader from '@/components/SiteHeader';
import { isValidLocale, defaultLocale } from '@/lib/i18n/dictionaries';

export const metadata: Metadata = {
  openGraph: {
    siteName: 'AI Insight Note',
    type: 'website',
  },
};

export function generateStaticParams() {
  return [{ locale: 'ko' }, { locale: 'en' }];
}

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : defaultLocale;

  return (
    <>
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4600038940266134"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      <NavigationSpinner />
      <HomeSiteNav locale={locale} />
      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8">
          <SiteHeader locale={locale} id="site-header" />
        </div>
        {children}
      </main>
      <Footer />
    </>
  );
}
