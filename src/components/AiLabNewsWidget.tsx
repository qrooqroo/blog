import { getRecentAiNews } from '@/lib/news';
import NewsVerticalTicker from './NewsVerticalTicker';

export default async function AiLabNewsWidget({ locale = 'ko' }: { locale?: string }) {
  const articles = await getRecentAiNews(10);
  if (!articles.length) return null;
  return <NewsVerticalTicker articles={articles} locale={locale} />;
}
