import type { Metadata } from 'next';
import { Noto_Sans_KR } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import Footer from '@/components/Footer';

const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AI Insight Note',
  description: 'AI와 나눈 대화, 발견한 인사이트, 기록할 가치 있는 생각들을 모아둔 노트입니다.',
  other: {
    'google-adsense-account': 'ca-pub-4600038940266134',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={`${notoSansKR.className} bg-slate-50 min-h-screen`}>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4600038940266134"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <main className="max-w-5xl mx-auto px-4 py-10 pb-16">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
