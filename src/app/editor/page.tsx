'use client';

import { useState, useEffect, useCallback } from 'react';

type Category = 'AI 대화' | '논문 분석' | '스타트업 AI 적용';

interface Draft {
  title: string;
  category: Category;
  excerpt: string;
  content: string;
  savedAt: string;
}

const STORAGE_KEY = 'ai-insight-editor-draft';
const CATEGORIES: Category[] = ['AI 대화', '논문 분석', '스타트업 AI 적용'];
const CATEGORY_ICONS: Record<Category, string> = {
  'AI 대화': '💬',
  '논문 분석': '📄',
  '스타트업 AI 적용': '🏢',
};

function normalizeBar(s: string): string {
  return s.replace(/│/g, '|');
}

function isSeparatorRow(line: string): boolean {
  const n = normalizeBar(line);
  return n.startsWith('|') && /^[\|\s\-:]+$/.test(n) && n.includes('-');
}

function parseRow(line: string): string[] {
  return normalizeBar(line).split('|').slice(1, -1).map(c => c.trim());
}

function mdToHtml(md: string): string {
  const lines = md.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const out: string[] = [];
  const codeBlocks: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const cur  = lines[i].trim();
    const next = i + 1 < lines.length ? lines[i + 1].trim() : '';

    // 코드 블록 감지: ``` 로 시작
    if (cur.startsWith('```')) {
      const lang = cur.slice(3).trim();
      i++;
      const codeLines: string[] = [];
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // 닫는 ``` 스킵
      const escaped = codeLines.join('\n')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const badge = lang
        ? `<span style="display:block;font-size:0.7rem;color:#94a3b8;margin-bottom:0.5em;font-family:monospace">${lang}</span>`
        : '';
      const key = `\x02${codeBlocks.length}\x03`;
      codeBlocks.push(`<pre style="background:#1e293b;color:#e2e8f0;padding:1em 1.2em;border-radius:8px;overflow-x:auto;font-size:0.82rem;line-height:1.6;margin:0.8em 0;font-family:ui-monospace,monospace">${badge}<code>${escaped}</code></pre>`);
      out.push('', key, ''); // 앞뒤 빈 줄로 분리 보장
      continue;
    }

    // 표 감지: 현재 줄이 | 포함 + 다음 줄이 구분선
    if ((cur.includes('|') || cur.includes('│')) && isSeparatorRow(next)) {
      const headerCells = parseRow(cur);
      i += 2; // 헤더 + 구분선 스킵

      const bodyRows: string[][] = [];
      while (i < lines.length) {
        const row = lines[i].trim();
        if (!row.startsWith('|') && !row.startsWith('│')) break;
        bodyRows.push(parseRow(row));
        i++;
      }

      const thead = `<thead><tr>${headerCells.map(h => `<th>${h}</th>`).join('')}</tr></thead>`;
      const tbody = `<tbody>${bodyRows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>`;
      out.push(`<table>${thead}${tbody}</table>`);
      continue;
    }

    out.push(lines[i]);
    i++;
  }

  const H1S = 'font-size:1.4rem;font-weight:900;color:#0f172a;margin:0.7em 0 0.15em;display:block';
  const H2S = 'font-size:1.15rem;font-weight:800;color:#1e293b;margin:0.8em 0 0.15em;border-bottom:2px solid #e2e8f0;padding-bottom:0.2em;display:block';
  const H3S = 'font-size:1rem;font-weight:700;color:#334155;margin:0.6em 0 0.1em;display:block';

  const raw = out.join('\n')
    .replace(/^###\s*(.+)$/gm, `<div style="${H3S}">$1</div>`)
    .replace(/^##\s*(.+)$/gm, `<div style="${H2S}">$1</div>`)
    .replace(/^#\s*(.+)$/gm, `<div style="${H1S}">$1</div>`)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/[ \t]*---+[ \t]*/gm, '\n\n<hr style="border:none;border-top:2px solid #e2e8f0;margin:1em 0" />\n\n')
    .replace(/^> (.+)$/gm, '<blockquote style="border-left:3px solid #6366f1;padding:0.5em 1em;background:#f5f3ff;margin:0.8em 0;border-radius:0 6px 6px 0;color:#4338ca">$1</blockquote>')
    .replace(/^- (.+)$/gm, '<div class="_li" style="position:relative;padding:0 0 0 1.2em;margin:0 0 3px 0;line-height:1.4;font-size:0.95rem;color:#334155"><span style="position:absolute;left:0;color:#6366f1;font-weight:700">•</span>$1</div>')
    .replace(/^(\d+)\.\s*(.+)$/gm, '<div class="_ol" style="position:relative;padding:0 0 0 1.8em;margin:0 0 3px 0;line-height:1.4;font-size:0.95rem;color:#334155"><span style="position:absolute;left:0;color:#334155;font-weight:600">$1.</span>$2</div>')
    .split('\n\n')
    .map(p => {
      const t = p.trim();
      if (!t) return '';
      if (t.startsWith('<div') || t.startsWith('<blockquote') || t.startsWith('<table') || t.startsWith('<hr') || /^\x02\d+\x03$/.test(t)) return t;
      const html = t.replace(/\n/g, '<br />')
        .replace(/<br \/>(<div class="_li"|<div class="_ol")/g, '$1')
        .replace(/(<\/div>)<br \/>/g, '$1');
      return `<div style="margin-bottom:0.5em;line-height:1.7;font-size:0.95rem;color:#334155">${html}</div>`;
    })
    .join('\n');

  // 코드 블록 플레이스홀더 복원
  return raw.replace(/\x02(\d+)\x03/g, (_, idx) => codeBlocks[parseInt(idx)]);
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 40) + '-' + Date.now().toString(36);
}

function generateArticleCode(draft: Draft): string {
  const html = mdToHtml(draft.content);
  const slug = generateSlug(draft.title);
  const date = new Date().toISOString().split('T')[0];
  const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\${/g, '\\${');

  return `// src/data/articles.ts 의 raw 배열 끝에 추가하세요:

{
  id: /* 마지막 id + 1 */,
  title: \`${esc(draft.title)}\`,
  slug: '${slug}',
  category: '${draft.category}',
  excerpt: \`${esc(draft.excerpt)}\`,
  content: \`${esc(html)}\`,
  date: '${date}',
},`;
}

export default function EditorPage() {
  const [title, setTitle]     = useState('');
  const [category, setCategory] = useState<Category>('AI 대화');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [showPreview, setShowPreview]     = useState(false);
  const [showExport, setShowExport]       = useState(false);
  const [copied, setCopied]               = useState(false);
  const [savedAt, setSavedAt]             = useState('');
  const [publishing, setPublishing]       = useState(false);
  const [publishResult, setPublishResult] = useState<{ ok: boolean; msg: string } | null>(null);

  // 초안 불러오기
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const d: Draft = JSON.parse(raw);
      setTitle(d.title || '');
      setCategory(d.category || 'AI 대화');
      setExcerpt(d.excerpt || '');
      setContent(d.content || '');
      setSavedAt(d.savedAt || '');
    } catch { /* ignore */ }
  }, []);

  // 자동 저장
  const save = useCallback(() => {
    const now = new Date().toLocaleTimeString('ko-KR');
    const draft: Draft = { title, category, excerpt, content, savedAt: now };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    setSavedAt(now);
  }, [title, category, excerpt, content]);

  useEffect(() => {
    const t = setTimeout(save, 1500);
    return () => clearTimeout(t);
  }, [save]);

  const publish = async () => {
    if (!title.trim()) { alert('제목을 입력해주세요.'); return; }
    if (!excerpt.trim()) { alert('요약을 입력해주세요.'); return; }
    if (!content.trim()) { alert('내용을 입력해주세요.'); return; }
    if (!confirm(`"${title}" 글을 발행하시겠습니까?\n\n발행 후 1~2분 내에 블로그에 반영됩니다.`)) return;

    setPublishing(true);
    setPublishResult(null);

    const slug = generateSlug(title);
    const html = mdToHtml(content);
    const date = new Date().toISOString().split('T')[0];

    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, slug, category, excerpt, content: html, date }),
      });
      const data = await res.json();
      if (res.ok) {
        setPublishResult({ ok: true, msg: `발행 완료! 1~2분 후 블로그에 반영됩니다.` });
        localStorage.removeItem(STORAGE_KEY);
      } else {
        setPublishResult({ ok: false, msg: data.error ?? '발행 실패' });
      }
    } catch {
      setPublishResult({ ok: false, msg: '네트워크 오류가 발생했습니다.' });
    } finally {
      setPublishing(false);
    }
  };

  const resetDraft = () => {
    if (!confirm('초안을 초기화하시겠습니까?')) return;
    setTitle(''); setCategory('AI 대화'); setExcerpt(''); setContent('');
    localStorage.removeItem(STORAGE_KEY);
    setSavedAt('');
  };

  // 내보내기 (fallback용 유지)
  const copyCode = () => {
    navigator.clipboard.writeText(generateArticleCode({ title, category, excerpt, content, savedAt }));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* 툴바 */}
      <div className="sticky top-0 z-50 bg-white border-b border-slate-200 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <a href="/" className="text-slate-400 hover:text-slate-600 text-sm transition-colors">← 홈</a>
            <span className="text-slate-200">|</span>
            <span className="text-sm font-bold text-slate-700">✍️ 편집기</span>
            {savedAt && <span className="text-xs text-slate-400">저장됨 {savedAt}</span>}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${showPreview ? 'bg-slate-700 text-white border-slate-700' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}
            >
              {showPreview ? '✏️ 편집' : '👁️ 미리보기'}
            </button>
            <button
              onClick={publish}
              disabled={publishing}
              className="px-4 py-1.5 text-sm font-bold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {publishing ? '발행 중...' : '🚀 발행하기'}
            </button>
            <button
              onClick={resetDraft}
              className="px-3 py-1.5 text-sm rounded-lg border border-red-200 text-red-400 hover:bg-red-50 transition-colors"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>

      {/* 발행 결과 알림 */}
      {publishResult && (
        <div className={`px-4 py-3 text-sm font-medium flex items-center justify-between ${publishResult.ok ? 'bg-green-50 text-green-700 border-b border-green-200' : 'bg-red-50 text-red-700 border-b border-red-200'}`}>
          <span>{publishResult.ok ? '✅' : '❌'} {publishResult.msg}</span>
          <button onClick={() => setPublishResult(null)} className="ml-4 opacity-60 hover:opacity-100 text-lg leading-none">×</button>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-5">

        {/* 메타 */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">

          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="제목을 입력하세요..."
            className="w-full text-2xl font-black text-slate-900 placeholder-slate-300 border-none outline-none bg-transparent"
          />

          {/* 카테고리 */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${category === c ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                {CATEGORY_ICONS[c]} {c}
              </button>
            ))}
          </div>

          {/* 요약 */}
          <textarea
            value={excerpt}
            onChange={e => setExcerpt(e.target.value)}
            placeholder="설명을 입력하세요..."
            rows={4}
            className="w-full text-sm text-slate-600 placeholder-slate-300 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400 resize-y transition-colors"
          />
        </div>

        {/* 편집 / 미리보기 */}
        {!showPreview ? (
          <div className="bg-white rounded-xl border border-slate-200">
            {/* 마크다운 힌트 */}
            <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-100 text-xs text-slate-400 font-mono flex-wrap gap-y-1">
              {[['#', '제목'], ['**굵게**', ''], ['*기울임*', ''], ['`코드`', ''], ['> 인용', ''], ['- 목록', '']].map(([syn]) => (
                <span key={syn} className="bg-slate-50 px-2 py-0.5 rounded">{syn}</span>
              ))}
            </div>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder={`## 개요\n\n내용을 마크다운으로 작성하세요...\n\n## 핵심 내용\n\n## 분석 및 인사이트`}
              rows={30}
              className="w-full px-5 py-4 text-sm text-slate-700 placeholder-slate-300 font-mono border-none outline-none resize-none leading-7 rounded-b-xl"
            />
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8">
            {title && <h1 className="text-2xl font-black text-slate-900 mb-4">{title}</h1>}
            {excerpt && (
              <div className="ai-bubble pl-5 mb-8 py-3 bg-indigo-50 rounded-r-xl">
                <p className="text-sm text-indigo-800 font-medium whitespace-pre-wrap">{excerpt}</p>
              </div>
            )}
            <div className="prose-ai" dangerouslySetInnerHTML={{ __html: mdToHtml(content) }} />
          </div>
        )}
      </div>

      {/* 내보내기 모달 */}
      {showExport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="font-black text-slate-900">📤 내보내기</h3>
              <button onClick={() => setShowExport(false)} className="text-slate-400 hover:text-slate-600 text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100">×</button>
            </div>
            <div className="p-5 overflow-y-auto flex-1 space-y-3">
              <p className="text-sm text-slate-500">
                아래 코드를 복사해서{' '}
                <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs text-indigo-600">src/data/articles.ts</code>의{' '}
                <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs text-indigo-600">raw</code> 배열 끝에 붙여넣으세요.
              </p>
              <pre className="bg-slate-900 text-green-400 text-xs rounded-xl p-4 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {generateArticleCode({ title, category, excerpt, content, savedAt })}
              </pre>
            </div>
            <div className="p-5 border-t border-slate-200 flex gap-3">
              <button
                onClick={copyCode}
                className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-colors ${copied ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
              >
                {copied ? '✅ 복사됨!' : '📋 코드 복사'}
              </button>
              <button
                onClick={() => setShowExport(false)}
                className="px-6 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
