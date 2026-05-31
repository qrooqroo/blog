import Link from 'next/link';
import { getRecentAiNews } from '@/lib/news';

const LAB_BADGE: Record<string, { label: string; cls: string }> = {
  'openai.com':       { label: 'OpenAI',    cls: 'bg-emerald-100 text-emerald-700' },
  'anthropic.com':    { label: 'Anthropic', cls: 'bg-amber-100 text-amber-700' },
  'deepmind.google':  { label: 'DeepMind',  cls: 'bg-blue-100 text-blue-700' },
  'ai.meta.com':      { label: 'Meta AI',   cls: 'bg-indigo-100 text-indigo-700' },
  'research.google':  { label: 'Google',    cls: 'bg-sky-100 text-sky-700' },
};

function detectLab(url?: string | null) {
  if (!url) return null;
  for (const [domain, info] of Object.entries(LAB_BADGE)) {
    if (url.includes(domain)) return info;
  }
  return null;
}

export default async function AiLabNewsWidget({ locale = 'ko' }: { locale?: string }) {
  const articles = await getRecentAiNews(6);
  const isEn = locale === 'en';

  return (
    <div>
      {articles.length === 0 ? (
        <p className="text-sm text-slate-400 py-4 text-center">
          {isEn ? 'No articles yet.' : '아직 작성된 기사가 없습니다.'}
        </p>
      ) : (
        <div className="overflow-hidden">
          <div className="animate-marquee whitespace-nowrap">
            {/* 끊김 없는 루프를 위해 두 번 렌더링 */}
            {[...articles, ...articles].map((a, i) => (
              <Link
                key={i}
                href={`/${locale}/news/${a.slug}`}
                className="inline-flex items-center px-8 py-3.5 group hover:bg-indigo-50 transition-colors"
              >
                <span className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600 group-hover:underline transition-colors">
                  {a.title}
                </span>
                <span className="text-slate-300 ml-8">·</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
