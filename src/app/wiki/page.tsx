export const dynamic = 'force-dynamic';

import { getRecentArticles } from '@/lib/articles';
import InfiniteArticleList from '@/components/InfiniteArticleList';
import SearchBar from '@/components/SearchBar';

export default async function WikiPage() {
  const initialArticles = await getRecentArticles(9, true);

  return (
    <div className="space-y-6">
      <SearchBar />
      <InfiniteArticleList initialArticles={initialArticles} />
    </div>
  );
}
