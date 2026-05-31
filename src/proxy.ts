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

  // ?lang= override: set 1-year cookie and redirect to clean URL
  const langParam = searchParams.get('lang');
  if (langParam && isValidLocale(langParam)) {
    const url = request.nextUrl.clone();
    url.searchParams.delete('lang');
    const existingLocale = locales.find(l => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
    if (existingLocale) {
      url.pathname = pathname.slice(`/${existingLocale}`.length) || '/';
    }
    const res = NextResponse.redirect(url);
    res.cookies.set('NEXT_LOCALE', langParam, { path: '/', maxAge: 365 * 24 * 3600 });
    return res;
  }

  const locale = detectLocale(request);
  const newHeaders = new Headers(request.headers);
  newHeaders.set('x-locale', locale);

  const res = NextResponse.next({ request: { headers: newHeaders } });

  // Auto-set short-lived locale cookie so client-side navigation retains locale
  const existingCookie = request.cookies.get('NEXT_LOCALE')?.value;
  if (!existingCookie || !isValidLocale(existingCookie)) {
    res.cookies.set('NEXT_LOCALE', locale, { path: '/', maxAge: 3600, sameSite: 'lax' });
  }

  return res;
}

export const config = {
  matcher: [
    '/((?!_next|api|editor|uploads|spinner|favicon\\.ico|globals\\.css).*)',
  ],
};
