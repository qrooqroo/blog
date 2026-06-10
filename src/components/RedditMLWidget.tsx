interface DevPost {
  title: string;
  url: string;
  positive_reactions_count: number;
  comments_count: number;
  user: { name: string };
}

async function fetchDevPosts(): Promise<DevPost[]> {
  try {
    const [ml, ai] = await Promise.all([
      fetch('https://dev.to/api/articles?tag=machinelearning&per_page=6&top=7', {
        headers: { 'User-Agent': 'aiinsightnote/1.0' },
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(5000),
      }),
      fetch('https://dev.to/api/articles?tag=ai&per_page=6&top=7', {
        headers: { 'User-Agent': 'aiinsightnote/1.0' },
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(5000),
      }),
    ]);
    const [mlData, aiData] = await Promise.all([
      ml.ok ? ml.json() : [],
      ai.ok ? ai.json() : [],
    ]);
    const seen = new Set<string>();
    const merged: DevPost[] = [];
    for (const post of [...mlData, ...aiData]) {
      if (!seen.has(post.url)) {
        seen.add(post.url);
        merged.push(post);
      }
      if (merged.length === 6) break;
    }
    return merged;
  } catch {
    return [];
  }
}

export default async function RedditMLWidget({ locale = 'ko' }: { locale?: string }) {
  const posts = await fetchDevPosts();
  const isEn = locale === 'en';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col h-full">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">
        {isEn ? 'Dev.to AI Trending' : 'Dev.to 인기글'}
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
                ♥ {post.positive_reactions_count.toLocaleString()} · {isEn ? 'comments' : '댓글'} {post.comments_count}
              </p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
