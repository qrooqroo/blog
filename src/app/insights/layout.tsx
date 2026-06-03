import Script from 'next/script';
import Footer from '@/components/Footer';
import NavigationSpinner from '@/components/NavigationSpinner';
import SiteNav from '@/components/SiteNav';
import { headers, cookies } from 'next/headers';
import { isValidLocale, defaultLocale } from '@/lib/i18n/dictionaries';

async function getLocale() {
  const h = await headers();
  const c = await cookies();
  const raw = h.get('x-locale') ?? c.get('NEXT_LOCALE')?.value ?? defaultLocale;
  return isValidLocale(raw) ? raw : defaultLocale;
}

export default async function InsightsLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();

  return (
    <>
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4600038940266134"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      <NavigationSpinner />
      <SiteNav locale={locale} />
      <main className="max-w-5xl mx-auto px-4 py-10 pb-16">
        {children}
      </main>
      <Footer />
    </>
  );
}
