export const dynamic = 'force-dynamic';

import { getRecentArticles } from '@/lib/articles';
import InfiniteArticleList from '@/components/InfiniteArticleList';
import SiteHeader from '@/components/SiteHeader';
import SearchBar from '@/components/SearchBar';

export default async function HomePage() {
  const initialArticles = await getRecentArticles(9);

  return (
    <div className="space-y-6">
      <SiteHeader />
      <SearchBar />
      <InfiniteArticleList initialArticles={initialArticles} />
    </div>
  );
}
