import type { Metadata } from 'next';
import Script from 'next/script';
import Footer from '@/components/Footer';
import NavigationSpinner from '@/components/NavigationSpinner';

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

export default async function LocaleLayout({ children }: Props) {
  return (
    <>
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4600038940266134"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      <NavigationSpinner />
      <main className="max-w-5xl mx-auto px-4 py-10 pb-16">
        {children}
      </main>
      <Footer />
    </>
  );
}
