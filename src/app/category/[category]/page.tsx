import { getArticlesByCategory } from '@/lib/articles';
import { CATEGORIES } from '@/data/articles';
import { Category } from '@/types';
import ArticleCard from '@/components/ArticleCard';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ category: string }>;
}

export function generateStaticParams() {
  return CATEGORIES.map(cat => ({ category: encodeURIComponent(cat) }));
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const decoded = decodeURIComponent(category) as Category;

  if (!CATEGORIES.includes(decoded)) notFound();

  const articles = getArticlesByCategory(decoded);

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <span className="w-1 h-6 bg-red-600 rounded-full" />
        <h1 className="text-2xl font-black text-gray-900">{decoded}</h1>
        <span className="text-sm text-gray-400">총 {articles.length}개 기사</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {articles.map(a => (
          <ArticleCard key={a.id} article={a} />
        ))}
      </div>
    </div>
  );
}
