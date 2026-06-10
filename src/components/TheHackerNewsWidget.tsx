interface SecPost {
  title: string;
  url: string;
  date: string;
}

async function fetchTHN(): Promise<SecPost[]> {
  try {
    const res = await fetch('https://feeds.feedburner.com/TheHackersNews', {
      next: { revalidate: 600 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];
    const xml = await res.text();

    const posts: SecPost[] = [];
    const re = /<item>([\s\S]*?)<\/item>/g;
    let m;
    while ((m = re.exec(xml)) !== null && posts.length < 7) {
      const chunk = m[1];
      const title = chunk.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/)?.[1]?.trim() ?? '';
      const url = (
        chunk.match(/<feedburner:origLink>([\s\S]*?)<\/feedburner:origLink>/)?.[1]?.trim() ??
        chunk.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim() ?? ''
      );
      const date = chunk.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim() ?? '';
      if (title && url) posts.push({ title, url, date });
    }
    return posts;
  } catch {
    return [];
  }
}

export default async function TheHackerNewsWidget({ locale = 'ko' }: { locale?: string }) {
  const posts = await fetchTHN();
  const isEn = locale === 'en';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col h-full">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">
        The Hacker News
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
              <p className="text-[10px] text-slate-400 mt-0.5">thehackernews.com</p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
