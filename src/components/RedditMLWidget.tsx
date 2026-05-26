interface RedditPost {
  title: string;
  url: string;
  score: number;
  num_comments: number;
}

async function fetchRedditML(): Promise<RedditPost[]> {
  try {
    const res = await fetch(
      'https://www.reddit.com/r/MachineLearning/hot.json?limit=8&raw_json=1',
      {
        headers: { 'User-Agent': 'aiinsightnote/1.0' },
        next: { revalidate: 300 },
      }
    );
    if (!res.ok) return [];
    const json = await res.json();
    return json.data.children
      .filter((c: any) => !c.data.stickied)
      .slice(0, 5)
      .map((c: any) => ({
        title: c.data.title,
        url: `https://reddit.com${c.data.permalink}`,
        score: c.data.score,
        num_comments: c.data.num_comments,
      }));
  } catch {
    return [];
  }
}

export default async function RedditMLWidget({ locale = 'ko' }: { locale?: string }) {
  const posts = await fetchRedditML();
  const isEn = locale === 'en';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">
        {locale === 'en' ? 'Reddit AI Trending' : 'Reddit 인기글'}
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
                ↑{post.score.toLocaleString()} · {isEn ? 'comments' : '댓글'} {post.num_comments}
              </p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
