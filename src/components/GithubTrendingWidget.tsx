interface Repo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  stargazers_count: number;
  html_url: string;
  language: string | null;
}

async function searchRepos(query: string): Promise<Repo[]> {
  const res = await fetch(
    `https://api.github.com/search/repositories?q=${query}&sort=stars&order=desc&per_page=10`,
    {
      headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/vnd.github.v3+json' },
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(5000),
    }
  );
  if (!res.ok) return [];
  const json = await res.json();
  return (json.items ?? []) as Repo[];
}

const NON_ASCII_RE = /[^\x00-\x7F]/;

function isEnglish(repo: Repo): boolean {
  return !NON_ASCII_RE.test(repo.name) && !NON_ASCII_RE.test(repo.description ?? '');
}

async function fetchTrendingRepos(): Promise<Repo[]> {
  const day30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const day7  = new Date(Date.now() -  7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  try {
    const [newRepos, hotRepos] = await Promise.all([
      searchRepos(`topic:ai+created:>${day30}`),
      searchRepos(`topic:ai+stars:>500+pushed:>${day7}`),
    ]);
    const seen = new Set<number>();
    const merged: Repo[] = [];
    for (const repo of [...newRepos, ...hotRepos]) {
      if (!seen.has(repo.id) && isEnglish(repo)) {
        seen.add(repo.id);
        merged.push(repo);
      }
      if (merged.length === 7) break;
    }
    return merged;
  } catch { return []; }
}

export default async function GithubTrendingWidget({ locale = 'ko' }: { locale?: string }) {
  const repos = await fetchTrendingRepos();
  const isEn = locale === 'en';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col h-full">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">
        {isEn ? 'GitHub AI Trending' : 'GitHub AI 트렌드'}
      </p>
      {repos.length === 0 ? (
        <p className="text-xs text-slate-400">{isEn ? 'Loading…' : '불러오는 중…'}</p>
      ) : (
        <div className="flex flex-col divide-y divide-slate-100 overflow-hidden flex-1">
          {repos.map(repo => (
            <a
              key={repo.id}
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-1 items-center justify-between gap-2 py-1"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-700 group-hover:text-indigo-600 transition-colors truncate">
                  {repo.name}
                </p>
                {repo.description && (
                  <p className="text-xs text-slate-400 line-clamp-1">{repo.description}</p>
                )}
              </div>
              <span className="text-xs text-amber-500 flex-shrink-0">★ {repo.stargazers_count.toLocaleString()}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
