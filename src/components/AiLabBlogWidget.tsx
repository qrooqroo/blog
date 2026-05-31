interface BlogPost {
  title: string;
  url: string;
  lab: string;
  badge: string;
  date: number;
}

const FEEDS = [
  { lab: 'OpenAI',    badge: 'bg-emerald-100 text-emerald-700', url: 'https://openai.com/blog/rss.xml' },
  { lab: 'Anthropic', badge: 'bg-amber-100 text-amber-700',     url: 'https://www.anthropic.com/rss.xml' },
  { lab: 'DeepMind',  badge: 'bg-blue-100 text-blue-700',       url: 'https://deepmind.google/blog/feed/basic/' },
  { lab: 'Meta AI',   badge: 'bg-indigo-100 text-indigo-700',   url: 'https://ai.meta.com/blog/rss/' },
];

function parseItems(xml: string, lab: string, badge: string): BlogPost[] {
  const posts: BlogPost[] = [];
  const re = /<(?:item|entry)>([\s\S]*?)<\/(?:item|entry)>/g;
  let m;
  while ((m = re.exec(xml)) !== null && posts.length < 5) {
    const chunk = m[1];
    const rawTitle = chunk.match(/<title(?:\s[^>]*)?>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/)?.[1] ?? '';
    const title = rawTitle.trim()
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
    const url = (
      chunk.match(/<link[^>]+href="([^"]+)"/)?.[1] ??
      chunk.match(/<link(?:\s[^>]*)?>([^<\s]+)/)?.[1] ??
      ''
    ).trim();
    const rawDate =
      chunk.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] ??
      chunk.match(/<published>([\s\S]*?)<\/published>/)?.[1] ??
      chunk.match(/<updated>([\s\S]*?)<\/updated>/)?.[1] ?? '';
    const date = rawDate ? new Date(rawDate.trim()).getTime() : 0;
    if (title && url) posts.push({ title, url, lab, badge, date });
  }
  return posts;
}

async function fetchLabBlogs(): Promise<BlogPost[]> {
  const results = await Promise.allSettled(
    FEEDS.map(async ({ lab, badge, url }) => {
      const res = await fetch(url, { next: { revalidate: 3600 } });
      if (!res.ok) return [] as BlogPost[];
      const text = await res.text();
      return parseItems(text, lab, badge);
    })
  );
  const posts = results.flatMap(r => r.status === 'fulfilled' ? r.value : []);
  posts.sort((a, b) => b.date - a.date);
  return posts;
}

export default async function AiLabBlogWidget({ locale = 'ko' }: { locale?: string }) {
  const posts = await fetchLabBlogs();
  const isEn = locale === 'en';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">
        {isEn ? 'AI Lab Blog' : 'AI 랩 블로그'}
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
              className="py-2 first:pt-0 last:pb-0 group flex items-start gap-2"
            >
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5 ${post.badge}`}>
                {post.lab}
              </span>
              <p className="text-xs font-medium text-slate-700 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                {post.title}
              </p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
