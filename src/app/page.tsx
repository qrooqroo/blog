export const dynamic = 'force-dynamic';

import { getRecentArticles } from '@/lib/articles';
import InfiniteArticleList from '@/components/InfiniteArticleList';

export default async function HomePage() {
  const initialArticles = await getRecentArticles(9);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900">AI Insight Note</h1>
      </div>
      <InfiniteArticleList initialArticles={initialArticles} />
    </div>
  );
}
