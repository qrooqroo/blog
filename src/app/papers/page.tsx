export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import Link from 'next/link';
import { headers, cookies } from 'next/headers';
import { getAllPapers } from '@/lib/papers';
import { formatDate } from '@/lib/format';
import { isValidLocale, defaultLocale } from '@/lib/i18n/dictionaries';

export const metadata: Metadata = {
  title: { absolute: '논문 분석 | AI Insight Note' },
  description: 'AI, 머신러닝, 반도체, 로보틱스 등 최신 논문을 심층 분석한 아카이브.',
  alternates: { canonical: 'https://aiinsightnote.com/papers' },
};

async function getLocale() {
  const h = await headers();
  const c = await cookies();
  const raw = h.get('x-locale') ?? c.get('NEXT_LOCALE')?.value ?? defaultLocale;
  return isValidLocale(raw) ? raw : defaultLocale;
}

export default async function PapersPage() {
  const locale = await getLocale();
  const isEn = locale === 'en';
  const papers = await getAllPapers();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900">
          {isEn ? 'Papers' : '논문 분석'}
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          {isEn
            ? 'Deep dives into the latest research papers'
            : 'AI·ML·반도체·로보틱스 최신 논문 심층 분석'}
        </p>
      </div>

      {papers.length === 0 ? (
        <p className="text-sm text-slate-400 py-16 text-center">
          {isEn ? 'No papers yet.' : '아직 작성된 글이 없습니다.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {papers.map(paper => {
            const title = (isEn && paper.title_en) ? paper.title_en : paper.title;
            const excerpt = (isEn && paper.excerpt_en) ? paper.excerpt_en : paper.excerpt;
            return (
              <Link
                key={paper.id}
                href={`/papers/${paper.slug}`}
                className="group block bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-indigo-300 hover:shadow-md transition-all"
              >
                <div className="p-5 flex flex-col gap-3">
                  {paper.arxiv_id && (
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                      arXiv · {paper.paper_date ? formatDate(paper.paper_date) : ''}
                    </span>
                  )}
                  <h2 className="text-base font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors">
                    {title}
                  </h2>
                  <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{excerpt}</p>
                  <div className="flex items-center justify-between mt-auto pt-1">
                    <span className="text-xs text-slate-400">{paper.analyst}</span>
                    <span className="text-xs text-slate-300">{formatDate(paper.date)}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
