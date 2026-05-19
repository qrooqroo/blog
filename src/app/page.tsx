export const dynamic = 'force-dynamic';

import { getRecentArticles } from '@/lib/articles';
import InfiniteArticleList from '@/components/InfiniteArticleList';
import SiteHeader from '@/components/SiteHeader';
import SearchBar from '@/components/SearchBar';

export default async function HomePage() {
  // image_ok=true 항목만 서버에서 필터링 (기본 이미지/null 제외)
  const initialArticles = await getRecentArticles(9, true);

  return (
    <div className="space-y-6">
      <SiteHeader />
      <SearchBar />
      <InfiniteArticleList initialArticles={initialArticles} />
    </div>
  );
}
