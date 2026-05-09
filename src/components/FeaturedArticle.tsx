import Link from 'next/link';
import { Article } from '@/types';
import { formatDate } from '@/lib/articles';

const CATEGORY_COLORS: Record<string, string> = {
  '경제': 'bg-blue-100 text-blue-700',
  '정치': 'bg-red-100 text-red-700',
  '사회': 'bg-green-100 text-green-700',
  '건강': 'bg-teal-100 text-teal-700',
  '스포츠': 'bg-orange-100 text-orange-700',
  'IT': 'bg-violet-100 text-violet-700',
  '문화': 'bg-pink-100 text-pink-700',
};

export default function FeaturedArticle({ article }: { article: Article }) {
  const tagColor = CATEGORY_COLORS[article.category] ?? 'bg-slate-100 text-slate-600';

  return (
    <Link
      href={`/post/${article.slug}`}
      className="group block bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-indigo-300 hover:shadow-lg transition-all duration-200"
    >
      <div className="md:flex">
        {/* 이미지 */}
        <div className="md:w-2/5 h-52 md:h-auto overflow-hidden bg-slate-100 flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
          />
        </div>

        {/* 내용 */}
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                최신 노트
              </span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tagColor}`}>
                {article.category}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 leading-tight mb-3 group-hover:text-indigo-600 transition-colors">
              {article.title}
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 whitespace-pre-wrap">
              {article.excerpt}
            </p>
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
            <span className="text-xs text-slate-400">{formatDate(article.date)}</span>
            <span className="text-xs font-semibold text-indigo-600 group-hover:underline">
              읽기 →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
