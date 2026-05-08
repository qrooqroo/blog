import Link from 'next/link';
import { Article } from '@/types';
import { formatDate } from '@/lib/articles';

const CATEGORY_COLORS: Record<string, string> = {
  '경제': 'bg-blue-600',
  '정치': 'bg-red-600',
  '사회': 'bg-green-600',
  '건강': 'bg-teal-600',
  '스포츠': 'bg-orange-500',
  'IT': 'bg-purple-600',
  '문화': 'bg-pink-600',
};

interface Props {
  article: Article;
  size?: 'normal' | 'small';
}

export default function ArticleCard({ article, size = 'normal' }: Props) {
  const badgeColor = CATEGORY_COLORS[article.category] ?? 'bg-gray-600';

  return (
    <Link href={`/post/${article.slug}`} className="group block bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      {/* 이미지 */}
      <div className={`overflow-hidden ${size === 'small' ? 'h-36' : 'h-44'} bg-gray-100`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* 내용 */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs font-bold text-white px-2 py-0.5 rounded ${badgeColor}`}>
            {article.category}
          </span>
          <span className="text-xs text-gray-400">{formatDate(article.date)}</span>
        </div>
        <h3 className={`font-bold text-gray-900 leading-snug group-hover:text-red-600 transition-colors line-clamp-2 ${size === 'small' ? 'text-sm' : 'text-base'}`}>
          {article.title}
        </h3>
        {size === 'normal' && (
          <p className="mt-1.5 text-sm text-gray-500 line-clamp-2 leading-relaxed">
            {article.excerpt}
          </p>
        )}
      </div>
    </Link>
  );
}
