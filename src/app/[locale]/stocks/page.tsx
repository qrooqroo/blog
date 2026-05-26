import StocksDashboard from '@/app/stocks/StocksDashboard';
import { getDictionary, isValidLocale, defaultLocale } from '@/lib/i18n/dictionaries';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : defaultLocale;
  const dict = getDictionary(locale);
  return {
    title: `${dict.pages.stocks.title} | AI Insight Note`,
    description: dict.pages.stocks.description,
  };
}

export default function StocksPage() {
  return <StocksDashboard />;
}
