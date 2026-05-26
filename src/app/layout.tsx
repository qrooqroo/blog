import type { Metadata } from 'next';
import { Noto_Sans_KR } from 'next/font/google';
import { headers } from 'next/headers';
import './globals.css';

const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://aiinsightnote.com'),
  title: {
    default: 'AI Insight Note',
    template: '%s | AI Insight Note',
  },
  description: 'AI와 나눈 대화, 발견한 인사이트, 기록할 가치 있는 생각들을 모아둔 노트입니다.',
  openGraph: {
    siteName: 'AI Insight Note',
    type: 'website',
  },
  other: {
    'google-adsense-account': 'ca-pub-4600038940266134',
    'google-site-verification': 'RCrxGvqvk_0sXfzsZu7P50DvLNr5SSED-Iki5mJee64',
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const locale = headersList.get('x-locale') ?? 'ko';

  return (
    <html lang={locale}>
      <body className={`${notoSansKR.className} bg-slate-50 min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
