interface LobstersPost {
  title: string;
  url: string;
  author: string;
}

async function fetchLobstersPosts(): Promise<LobstersPost[]> {
  try {
    const res = await fetch('https://lobste.rs/t/ai.rss', {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const xml = await res.text();

    const posts: LobstersPost[] = [];
    const re = /<item>([\s\S]*?)<\/item>/g;
    let m;
    while ((m = re.exec(xml)) !== null && posts.length < 7) {
      const chunk = m[1];
      const title = chunk.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/)?.[1]?.trim() ?? '';
      const url = chunk.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim() ?? '';
      const rawAuthor = chunk.match(/<author>([\s\S]*?)<\/author>/)?.[1]?.trim() ?? '';
      // "domain via username" 형식에서 username만 추출
      const author = rawAuthor.includes(' via ') ? rawAuthor.split(' via ')[1] : rawAuthor;
      if (title && url) posts.push({ title, url, author });
    }
    return posts;
  } catch {
    return [];
  }
}

export default async function LobstersWidget({ locale = 'ko' }: { locale?: string }) {
  const posts = await fetchLobstersPosts();
  const isEn = locale === 'en';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col h-full">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">
        Lobste.rs AI
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
              <p className="text-[10px] text-slate-400 mt-0.5">{post.author}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
