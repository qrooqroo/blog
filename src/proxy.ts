import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { locales, defaultLocale, isValidLocale, type Locale } from '@/lib/i18n/dictionaries';

function detectLocale(request: NextRequest): Locale {
  const cookie = request.cookies.get('NEXT_LOCALE')?.value;
  if (cookie && isValidLocale(cookie)) return cookie;

  const country = request.headers.get('x-vercel-ip-country');
  if (country === 'KR') return 'ko';
  if (country && country !== 'KR') return 'en';

  const acceptLanguage = request.headers.get('accept-language') ?? '';
  const primary = acceptLanguage.split(',')[0]?.split(';')[0]?.trim().toLowerCase() ?? '';
  if (primary.startsWith('ko')) return 'ko';
  if (primary) return 'en';

  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // ?lang= override: set cookie and redirect to same clean URL (without lang param)
  const langParam = searchParams.get('lang');
  if (langParam && isValidLocale(langParam)) {
    const url = request.nextUrl.clone();
    url.searchParams.delete('lang');
    // Strip locale prefix from URL so it stays clean (e.g. /ko/insights → /insights)
    const existingLocale = locales.find(l => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
    if (existingLocale) {
      url.pathname = pathname.slice(`/${existingLocale}`.length) || '/';
    }
    const res = NextResponse.redirect(url);
    res.cookies.set('NEXT_LOCALE', langParam, { path: '/', maxAge: 365 * 24 * 3600 });
    return res;
  }

  // Already on a locale path: pass through and set x-locale header
  const pathnameHasLocale = locales.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );

  if (pathnameHasLocale) {
    const locale = pathname.split('/')[1];
    const response = NextResponse.next();
    response.headers.set('x-locale', isValidLocale(locale) ? locale : defaultLocale);
    return response;
  }

  const locale = detectLocale(request);

  // Root path: pass through to src/app/page.tsx with x-locale header (no redirect/rewrite)
  if (pathname === '/') {
    const response = NextResponse.next();
    response.headers.set('x-locale', locale);
    return response;
  }

  // Other non-locale paths: rewrite to locale version (URL stays clean)
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;
  const response = NextResponse.rewrite(url);
  response.headers.set('x-locale', locale);
  return response;
}

export const config = {
  matcher: [
    '/((?!_next|api|editor|uploads|spinner|favicon\\.ico|globals\\.css).*)',
  ],
};
