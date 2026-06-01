interface HNPost {
  title: string;
  url: string;
  author: string;
  points: number;
}

async function fetchHNAIPosts(): Promise<HNPost[]> {
  try {
    const res = await fetch(
      'https://hn.algolia.com/api/v1/search?query=AI+LLM&tags=story&hitsPerPage=10&numericFilters=points>10',
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return [];
    const json = await res.json();
    return (json.hits ?? [])
      .slice(0, 7)
      .map((h: any) => ({
        title: h.title,
        url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
        author: h.author,
        points: h.points,
      }));
  } catch {
    return [];
  }
}

export default async function HackerNewsAIWidget({ locale = 'ko' }: { locale?: string }) {
  const posts = await fetchHNAIPosts();
  const isEn = locale === 'en';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col h-full">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">
        Hacker News AI
      </p>
      {posts.length === 0 ? (
        <p className="text-xs text-slate-400">{isEn ? 'Loading…' : '불러오는 중…'}</p>
      ) : (
        <div className="flex flex-col divide-y divide-slate-100">
          {posts.map((post, i) => (
            <a
              key={i}
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 first:pt-0 last:pb-0 group"
            >
              <p className="text-xs font-medium text-slate-700 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                {post.title}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                ▲ {post.points} · {post.author}
              </p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
