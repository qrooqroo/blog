import Link from 'next/link';
import { Article } from '@/types';
import { formatDate } from '@/lib/articles';

const CATEGORY_COLORS: Record<string, string> = {
  '경제': 'bg-blue-50 text-blue-700',
  '정치': 'bg-red-50 text-red-700',
  '사회': 'bg-green-50 text-green-700',
  '건강': 'bg-teal-50 text-teal-700',
  '스포츠': 'bg-orange-50 text-orange-700',
  'IT': 'bg-violet-50 text-violet-700',
  '문화': 'bg-pink-50 text-pink-700',
};

interface Props {
  article: Article;
  size?: 'normal' | 'small';
}

export default function ArticleCard({ article, size = 'normal' }: Props) {
  const tagColor = CATEGORY_COLORS[article.category] ?? 'bg-slate-100 text-slate-600';

  return (
    <Link
      href={`/post/${article.id}`}
      className="group block bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-indigo-300 hover:shadow-md transition-all duration-200"
    >
      {/* 썸네일 */}
      <div className={`overflow-hidden bg-slate-100 ${size === 'small' ? 'h-36' : 'h-44'}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
        />
      </div>

      {/* 내용 */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2.5">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tagColor}`}>
            {article.category}
          </span>
          <span className="text-xs text-slate-400">{formatDate(article.date)}</span>
        </div>

        <h3 className={`font-bold text-slate-800 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2 ${size === 'small' ? 'text-sm' : 'text-[0.95rem]'}`}>
          {article.title}
        </h3>

        {size === 'normal' && (
          <p className="mt-2 text-sm text-slate-500 line-clamp-2 leading-relaxed whitespace-pre-wrap">
            {article.excerpt}
          </p>
        )}
      </div>
    </Link>
  );
}
