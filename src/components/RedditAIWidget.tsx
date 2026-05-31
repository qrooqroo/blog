'use client';

import { useEffect, useState } from 'react';

interface RedditPost {
  title: string;
  url: string;
  score: number;
  num_comments: number;
}

export default function RedditAIWidget({ locale = 'ko' }: { locale?: string }) {
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [loading, setLoading] = useState(true);
  const isEn = locale === 'en';

  useEffect(() => {
    fetch('https://www.reddit.com/r/artificial/hot.json?limit=10&raw_json=1', {
      headers: { 'User-Agent': 'aiinsightnote/1.0' },
    })
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (!json) return;
        const items: RedditPost[] = json.data.children
          .filter((c: any) => !c.data.stickied)
          .slice(0, 6)
          .map((c: any) => ({
            title: c.data.title,
            url: `https://reddit.com${c.data.permalink}`,
            score: c.data.score,
            num_comments: c.data.num_comments,
          }));
        setPosts(items);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col h-full">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">
        {isEn ? 'Reddit AI' : 'Reddit AI'}
      </p>
      {loading ? (
        <p className="text-xs text-slate-400">{isEn ? 'Loading…' : '불러오는 중…'}</p>
      ) : posts.length === 0 ? (
        <p className="text-xs text-slate-400">{isEn ? 'No posts.' : '게시물 없음'}</p>
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
