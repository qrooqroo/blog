export const dynamic = 'force-dynamic';

import { getRecentArticles } from '@/lib/articles';
import InfiniteArticleList from '@/components/InfiniteArticleList';
import SiteHeader from '@/components/SiteHeader';

export default async function HomePage() {
  const initialArticles = await getRecentArticles(9);

  return (
    <div className="space-y-8">
      <SiteHeader />
      <InfiniteArticleList initialArticles={initialArticles} />
    </div>
  );
}
