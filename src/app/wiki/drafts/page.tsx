export const dynamic = 'force-dynamic';

import { getDraftArticles } from '@/lib/articles';
import InfiniteArticleList from '@/components/InfiniteArticleList';
import SiteHeader from '@/components/SiteHeader';

export default async function DraftsPage() {
  const initial = await getDraftArticles(9);

  return (
    <div className="space-y-6">
      <SiteHeader />
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
          초안
        </span>
        <h2 className="text-sm text-slate-500">발행 전 문서 목록</h2>
      </div>
      <InfiniteArticleList initialArticles={initial} apiPath="/api/articles/drafts" />
    </div>
  );
}
