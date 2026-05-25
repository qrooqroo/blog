interface ArxivEntry {
  id: string;
  title: string;
  authors: string;
  link: string;
}

function extractTag(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
  return (m?.[1] ?? '')
    .trim()
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ');
}

function parseAtom(xml: string): ArxivEntry[] {
  const entries: ArxivEntry[] = [];
  for (const m of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
    const e = m[1];
    const rawId = extractTag(e, 'id');
    const absUrl = rawId.replace('http://', 'https://');
    const authors = [...e.matchAll(/<name>(.*?)<\/name>/g)]
      .map(a => a[1].trim())
      .slice(0, 2)
      .join(', ');
    entries.push({
      id: rawId,
      title: extractTag(e, 'title'),
      authors: authors || '—',
      link: absUrl,
    });
  }
  return entries.slice(0, 5);
}

async function fetchArxivPapers(): Promise<ArxivEntry[]> {
  try {
    const res = await fetch(
      'https://export.arxiv.org/api/query?search_query=cat:cs.AI+OR+cat:cs.LG&sortBy=submittedDate&sortOrder=descending&start=0&max_results=5',
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    return parseAtom(await res.text());
  } catch { return []; }
}

export default async function ArxivWidget() {
  const papers = await fetchArxivPapers();

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">최신 AI 논문 · arXiv</p>
      {papers.length === 0 ? (
        <p className="text-xs text-slate-400">불러오는 중…</p>
      ) : (
        <div className="flex flex-col divide-y divide-slate-100">
          {papers.map(paper => (
            <a
              key={paper.id}
              href={paper.link}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 first:pt-0 last:pb-0 group"
            >
              <p className="text-xs font-bold text-slate-700 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                {paper.title}
              </p>
              <p className="text-xs text-slate-400 mt-0.5 truncate">{paper.authors}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
