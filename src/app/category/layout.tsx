import Footer from '@/components/Footer';
import NavigationSpinner from '@/components/NavigationSpinner';
import HomeSiteNav from '@/components/HomeSiteNav';
import SiteHeader from '@/components/SiteHeader';
import { headers, cookies } from 'next/headers';
import { isValidLocale, defaultLocale } from '@/lib/i18n/dictionaries';

async function getLocale() {
  const h = await headers();
  const c = await cookies();
  const raw = h.get('x-locale') ?? c.get('NEXT_LOCALE')?.value ?? defaultLocale;
  return isValidLocale(raw) ? raw : defaultLocale;
}

export default async function CategoryLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();

  return (
    <>
      <NavigationSpinner />
      <HomeSiteNav locale={locale} />
      <main className="max-w-5xl mx-auto px-4 py-10 pb-16">
        <div className="mb-8">
          <SiteHeader locale={locale} id="site-header" />
        </div>
        {children}
      </main>
      <Footer />
    </>
  );
}
