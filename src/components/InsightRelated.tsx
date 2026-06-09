import Link from 'next/link';
import type { Insight } from '@/lib/insights';

interface Props {
  items: Insight[];
  locale?: string;
  isEn?: boolean;
}

export default function InsightRelated({ items, locale, isEn = false }: Props) {
  if (items.length === 0) return null;

  const basePath = locale ? `/${locale}/insights` : '/insights';

  return (
    <div className="mt-12 pt-8 border-t border-slate-200">
      <h2 className="text-base font-bold text-slate-400 uppercase tracking-widest mb-6">
        {isEn ? 'More Insights' : '더 읽어보기'}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {items.map((item) => {
          const title = (isEn && item.title_en) ? item.title_en : item.title;
          const excerpt = (isEn && item.excerpt_en) ? item.excerpt_en : item.excerpt;
          return (
            <Link
              key={item.slug}
              href={`${basePath}/${item.slug}`}
              className="group block rounded-xl overflow-hidden border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all"
            >
              {item.image && (
                <div className="h-36 bg-slate-100 overflow-hidden">
                  <img
                    src={item.image}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-4">
                <p className="text-sm font-bold text-slate-800 leading-snug line-clamp-2 group-hover:text-indigo-700 transition-colors">
                  {title}
                </p>
                {excerpt && (
                  <p className="mt-1.5 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {excerpt}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
