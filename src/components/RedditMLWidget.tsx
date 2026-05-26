interface RedditPost {
  title: string;
  url: string;
  score: number;
  num_comments: number;
}

async function getRedditToken(): Promise<string | null> {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  try {
    const res = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'aiinsightnote/1.0',
      },
      body: 'grant_type=client_credentials',
      next: { revalidate: 3300 }, // 토큰 유효기간 1시간, 55분마다 갱신
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.access_token ?? null;
  } catch {
    return null;
  }
}

async function fetchRedditML(): Promise<RedditPost[]> {
  try {
    const token = await getRedditToken();
    if (!token) return [];

    const res = await fetch(
      'https://oauth.reddit.com/r/MachineLearning/hot?limit=8&raw_json=1',
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'User-Agent': 'aiinsightnote/1.0',
        },
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
