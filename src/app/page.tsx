export const dynamic = 'force-dynamic';

import { getRecentArticles } from '@/lib/articles';
import InfiniteArticleList from '@/components/InfiniteArticleList';

export default async function HomePage() {
  const initialArticles = await getRecentArticles(9);

  return (
    <div className="space-y-8">
      <div className="rounded-xl overflow-hidden h-40 sm:h-52">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/site_title.png"
          alt="AI Insight Note"
          className="w-full h-full object-cover"
          style={{ objectPosition: 'center 30%' }}
        />
      </div>
      <InfiniteArticleList initialArticles={initialArticles} />
    </div>
  );
}
