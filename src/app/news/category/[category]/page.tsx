import { getArticlesByCategory } from '@/lib/articles';
import { CATEGORIES } from '@/data/articles';
import { Category } from '@/types';
import ArticleCard from '@/components/ArticleCard';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ category: string }>;
}

export function generateStaticParams() {
  return CATEGORIES.map(cat => ({ category: cat }));
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const decoded = decodeURIComponent(category) as Category;

  if (!CATEGORIES.includes(decoded)) notFound();

  const articles = getArticlesByCategory(decoded);

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <span className="w-1 h-7 bg-indigo-500 rounded-full" />
        <div>
          <h1 className="text-2xl font-black text-slate-900">{decoded}</h1>
          <p className="text-sm text-slate-400 mt-0.5">총 {articles.length}개의 노트</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {articles.map(a => (
          <ArticleCard key={a.id} article={a} />
        ))}
      </div>
    </div>
  );
}
