interface Repo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  stargazers_count: number;
  html_url: string;
  language: string | null;
}

async function fetchTrendingRepos(): Promise<Repo[]> {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  try {
    const res = await fetch(
      `https://api.github.com/search/repositories?q=topic:ai+topic:machine-learning+created:>${since}&sort=stars&order=desc&per_page=5`,
      {
        headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/vnd.github.v3+json' },
        next: { revalidate: 3600 },
      }
    );
    if (!res.ok) return [];
    const json = await res.json();
    return (json.items ?? []) as Repo[];
  } catch { return []; }
}

export default async function GithubTrendingWidget() {
  const repos = await fetchTrendingRepos();

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">GitHub AI 트렌딩</p>
      {repos.length === 0 ? (
        <p className="text-xs text-slate-400">불러오는 중…</p>
      ) : (
        <div className="flex flex-col divide-y divide-slate-100">
          {repos.map(repo => (
            <a
              key={repo.id}
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 first:pt-0 last:pb-0 group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-700 group-hover:text-indigo-600 transition-colors truncate">
                    {repo.name}
                  </p>
                  {repo.description && (
                    <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{repo.description}</p>
                  )}
                </div>
                <span className="text-xs text-amber-500 flex-shrink-0">★ {repo.stargazers_count.toLocaleString()}</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
