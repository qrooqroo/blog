import Link from 'next/link';
import { Article } from '@/types';
import { formatDate } from '@/lib/articles';

const CATEGORY_COLORS: Record<string, string> = {
  '경제': 'bg-blue-600', '정치': 'bg-red-600', '사회': 'bg-green-600',
  '건강': 'bg-teal-600', '스포츠': 'bg-orange-500', 'IT': 'bg-purple-600', '문화': 'bg-pink-600',
};

export default function FeaturedArticle({ article }: { article: Article }) {
  const badgeColor = CATEGORY_COLORS[article.category] ?? 'bg-gray-600';

  return (
    <Link href={`/post/${article.slug}`} className="group block relative rounded-xl overflow-hidden bg-gray-900 shadow-lg h-[420px]">
      {/* 배경 이미지 */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={article.image}
        alt={article.title}
        className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
      />

      {/* 그라디언트 오버레이 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

      {/* 콘텐츠 */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs font-black text-white bg-red-600 px-2.5 py-1 rounded">주요기사</span>
          <span className={`text-xs font-bold text-white px-2 py-0.5 rounded ${badgeColor}`}>
            {article.category}
          </span>
          <span className="text-xs text-gray-300">{formatDate(article.date)}</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-white leading-tight mb-3 group-hover:text-red-300 transition-colors">
          {article.title}
        </h2>
        <p className="text-sm text-gray-300 line-clamp-2 leading-relaxed">
          {article.excerpt}
        </p>
      </div>
    </Link>
  );
}
