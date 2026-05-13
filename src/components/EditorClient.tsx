'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { tableFor } from '@/lib/table-utils';
import { Article } from '@/types';

// ── 카테고리 ──────────────────────────────────────────────
const ARTICLE_CATEGORIES = ['AI 대화', '논문 분석', '스타트업 AI 적용'];
const ALL_CATEGORIES     = ['AI 대화', '논문 분석', '스타트업 AI 적용', '뉴스'];
const CATEGORY_ICONS: Record<string, string> = {
  'AI 대화': '💬', '논문 분석': '📄', '스타트업 AI 적용': '🏢', '뉴스': '📰',
};

// ── 마크다운 → HTML ───────────────────────────────────────
function normalizeBar(s: string): string { return s.replace(/│/g, '|'); }
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
    if (cur.startsWith('```')) {
      const lang = cur.slice(3).trim();
      i++;
      const codeLines: string[] = [];
      while (i < lines.length && !lines[i].trim().startsWith('```')) { codeLines.push(lines[i]); i++; }
      if (i < lines.length) i++;
      const escaped = codeLines.join('\n').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const header = lang ? `<div style="background:#2d2d2d;padding:5px 14px;font-size:0.72rem;color:#858585;font-family:ui-monospace,monospace;border-bottom:1px solid #3d3d3d">${lang}</div>` : '';
      const key = `\x02${codeBlocks.length}\x03`;
      codeBlocks.push(`<div style="border-radius:8px;overflow:hidden;margin:0.8em 0;border:1px solid #3d3d3d">${header}<pre style="background:#1e1e1e;color:#d4d4d4;padding:1em 1.2em;margin:0;overflow-x:auto;font-size:0.82rem;line-height:1.6;font-family:ui-monospace,monospace"><code style="color:#d4d4d4;background:none;padding:0;border-radius:0;font-size:inherit;font-family:inherit;font-weight:500">${escaped}</code></pre></div>`);
      out.push('', key, '');
      continue;
    }
    if ((cur.includes('|') || cur.includes('│')) && isSeparatorRow(next)) {
      const headerCells = parseRow(cur);
      i += 2;
      const bodyRows: string[][] = [];
      while (i < lines.length) {
        const row = lines[i].trim();
        if (!row.startsWith('|') && !row.startsWith('│')) break;
        bodyRows.push(parseRow(row)); i++;
      }
      const thead = `<thead><tr>${headerCells.map(h => `<th>${h}</th>`).join('')}</tr></thead>`;
      const tbody = `<tbody>${bodyRows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>`;
      out.push(`<table>${thead}${tbody}</table>`);
      continue;
    }
    out.push(lines[i]); i++;
  }
  const H1S = 'font-size:1.4rem;font-weight:900;color:#0f172a;margin:0.7em 0 0.15em;display:block';
  const H2S = 'font-size:1.15rem;font-weight:800;color:#1e293b;margin:0.8em 0 0.15em;border-bottom:2px solid #e2e8f0;padding-bottom:0.2em;display:block';
  const H3S = 'font-size:1rem;font-weight:700;color:#334155;margin:0.6em 0 0.1em;display:block';
  const raw = out.join('\n')
    .replace(/^###\s*(.+)$/gm, `<div style="${H3S}">$1</div>`)
    .replace(/^##\s*(.+)$/gm,  `<div style="${H2S}">$1</div>`)
    .replace(/^#\s*(.+)$/gm,   `<div style="${H1S}">$1</div>`)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/[ \t]*---+[ \t]*/gm, '\n\n<hr style="border:none;border-top:2px solid #e2e8f0;margin:1em 0" />\n\n')
    .replace(/^> (.+)$/gm, '<blockquote style="border-left:3px solid #6366f1;padding:0.5em 1em;background:#f5f3ff;margin:0.8em 0;border-radius:0 6px 6px 0;color:#4338ca">$1</blockquote>')
    .replace(/^- (.+)$/gm, '<div class="_li" style="display:flex;gap:0.65em;align-items:baseline;margin:0 0 1px 0;line-height:1.4;font-size:0.95rem;color:#334155"><span style="color:#6366f1;font-weight:700;flex-shrink:0">•</span><span>$1</span></div>')
    .replace(/^(\d+)\.\s*(.+)$/gm, '<div class="_ol" style="position:relative;padding:0 0 0 1.8em;margin:0 0 3px 0;line-height:1.4;font-size:0.95rem;color:#334155"><span style="position:absolute;left:0;color:#6366f1;font-weight:700">$1.</span>$2</div>')
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
  return raw.replace(/\x02(\d+)\x03/g, (_, idx) => codeBlocks[parseInt(idx)]);
}

function generateSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9가-힣\s]/g, '').replace(/\s+/g, '-').slice(0, 40) + '-' + Date.now().toString(36);
}

// ── Props ─────────────────────────────────────────────────
interface Props {
  article?: Article;
}

const STORAGE_KEY = 'ai-insight-editor-draft';

export default function EditorClient({ article }: Props) {
  const isEdit  = !!article;
  const router  = useRouter();

  const [title,    setTitle]    = useState(article?.title    ?? '');
  const [category, setCategory] = useState<string>(article?.category ?? '');
  const [excerpt,  setExcerpt]  = useState(article?.excerpt  ?? '');
  const [content,  setContent]  = useState(article?.markdown_content ?? '');
  const [slugInput,   setSlugInput]   = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [savedAt,     setSavedAt]     = useState('');
  const [saving,      setSaving]      = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [dbCategories, setDbCategories] = useState<string[]>([]);

  // 카테고리 목록을 DB에서 동적으로 로드
  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(data => {
        if (data.categories) {
          setDbCategories(data.categories.map((c: { name: string }) => c.name));
        }
      })
      .catch(() => {});
  }, []);

  // 신규 글: 초안 불러오기
  useEffect(() => {
    if (isEdit) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const d = JSON.parse(raw);
      setTitle(d.title || ''); setCategory(d.category || '');
      setExcerpt(d.excerpt || ''); setContent(d.content || '');
      setSavedAt(d.savedAt || '');
    } catch { /* ignore */ }
  }, [isEdit]);

  // 신규 글: 자동 저장
  const autosave = useCallback(() => {
    if (isEdit) return;
    const now = new Date().toLocaleTimeString('ko-KR');
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ title, category, excerpt, content, savedAt: now }));
    setSavedAt(now);
  }, [isEdit, title, category, excerpt, content]);

  useEffect(() => {
    if (isEdit) return;
    const t = setTimeout(autosave, 1500);
    return () => clearTimeout(t);
  }, [autosave, isEdit]);

  // ── 저장 / 발행 ──────────────────────────────────────────
  const handleSave = async () => {
    if (!title.trim())   { alert('제목을 입력해주세요.');   return; }
    if (!content.trim()) { alert('내용을 입력해주세요.');   return; }

    setSaving(true); setResult(null);

    try {
      const html = mdToHtml(content);

      if (isEdit) {
        // 편집: 원본 카테고리 기준으로 어느 테이블인지 결정
        const table = tableFor(article!.category);
        const res = await fetch(`/api/articles/${article!.id}?table=${table}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, category, excerpt, content: html, markdown_content: content }),
        });
        const data = await res.json();
        setResult(res.ok
          ? { ok: true,  msg: '수정 완료! 블로그에 바로 반영됩니다.' }
          : { ok: false, msg: data.error ?? '수정 실패' });
      } else {
        // 신규: 마크다운 → HTML 변환 후 POST
        const slug = slugInput.trim() || generateSlug(title);
        const date = new Date().toISOString().split('T')[0];
        const res = await fetch('/api/publish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, slug, category, excerpt, content: html, markdown_content: content, date }),
        });
        const data = await res.json();
        if (res.ok) {
          localStorage.removeItem(STORAGE_KEY);
          router.push('/');
        } else {
          setResult({ ok: false, msg: data.error ?? '발행 실패' });
        }
      }
    } catch {
      setResult({ ok: false, msg: '네트워크 오류가 발생했습니다.' });
    } finally {
      setSaving(false);
    }
  };

  const resetDraft = () => {
    if (!confirm('초안을 초기화하시겠습니까?')) return;
    setTitle(''); setCategory(''); setExcerpt(''); setContent('');
    localStorage.removeItem(STORAGE_KEY); setSavedAt('');
  };

  const handleDelete = async () => {
    if (!confirm(`"${title}" 글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) return;
    setSaving(true);
    try {
      const table = tableFor(article!.category);
      const res = await fetch(`/api/articles/${article!.id}?table=${table}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/');
      } else {
        const data = await res.json();
        setResult({ ok: false, msg: data.error ?? '삭제 실패' });
      }
    } catch {
      setResult({ ok: false, msg: '네트워크 오류가 발생했습니다.' });
    } finally {
      setSaving(false);
    }
  };

  // DB에서 로드된 카테고리 우선, 없으면 하드코딩 폴백
  const editCategories   = dbCategories.length > 0 ? dbCategories : ALL_CATEGORIES;
  const displayCategories = isEdit ? editCategories : (dbCategories.length > 0 ? dbCategories : ARTICLE_CATEGORIES);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* 툴바 */}
      <div className="sticky top-0 z-50 bg-white border-b border-slate-200 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <a href={isEdit ? `/wiki/${article!.slug}` : '/'} className="text-slate-400 hover:text-slate-600 text-sm transition-colors">
              ← {isEdit ? '글로 돌아가기' : '홈'}
            </a>
            <span className="text-slate-200">|</span>
            <span className="text-sm font-bold text-slate-700">
              {isEdit ? '✏️ 글 편집' : '✍️ 새 글 작성'}
            </span>
            <a href="/editor/categories" className="text-xs text-slate-400 hover:text-indigo-500 transition-colors">
              카테고리 관리
            </a>
            {!isEdit && savedAt && <span className="text-xs text-slate-400">저장됨 {savedAt}</span>}
            {isEdit && <span className="text-xs text-slate-400 bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full border border-amber-200">편집 모드</span>}
          </div>
          <div className="flex items-center gap-2">
            {isEdit && (
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 outline-none focus:border-indigo-400 transition-colors"
              >
                {editCategories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            )}
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${showPreview ? 'bg-slate-700 text-white border-slate-700' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}
            >
              {showPreview ? '✏️ 편집' : '👁️ 미리보기'}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-1.5 text-sm font-bold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (isEdit ? '저장 중...' : '발행 중...') : (isEdit ? '💾 저장하기' : '🚀 발행하기')}
            </button>
            {isEdit ? (
              <button onClick={handleDelete} disabled={saving} className="px-3 py-1.5 text-sm rounded-lg border border-red-300 text-red-500 hover:bg-red-50 disabled:opacity-50 transition-colors">
                🗑️ 삭제
              </button>
            ) : (
              <button onClick={resetDraft} className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors">
                🗑️
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 결과 알림 */}
      {result && (
        <div className={`px-4 py-3 text-sm font-medium flex items-center justify-between ${result.ok ? 'bg-green-50 text-green-700 border-b border-green-200' : 'bg-red-50 text-red-700 border-b border-red-200'}`}>
          <span>{result.ok ? '✅' : '❌'} {result.msg}</span>
          <button onClick={() => setResult(null)} className="ml-4 opacity-60 hover:opacity-100 text-lg leading-none">×</button>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-5">

        {/* 편집 모드: slug 표시 */}
        {isEdit && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
            <span className="font-semibold">slug:</span> <code className="bg-amber-100 px-1.5 py-0.5 rounded text-xs">{article!.slug}</code>
            <span className="ml-3 text-amber-500 text-xs">slug는 URL 유지를 위해 변경되지 않습니다.</span>
          </div>
        )}

        {/* 메타 */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <input
            type="text" value={title} onChange={e => setTitle(e.target.value)}
            placeholder="제목을 입력하세요..."
            className="w-full text-2xl font-black text-slate-900 placeholder-slate-300 border-none outline-none bg-transparent"
          />
          <div className="flex flex-wrap gap-2">
            {displayCategories.map(c => (
              <button
                key={c} onClick={() => setCategory(c)}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${category === c ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                {CATEGORY_ICONS[c] ?? ''} {c}
              </button>
            ))}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">참고 링크</span>
              <span className="text-xs text-slate-300">(선택 · 한 줄에 URL 하나씩)</span>
            </div>
            <textarea
              value={excerpt} onChange={e => setExcerpt(e.target.value)}
              placeholder={"https://example.com\nhttps://github.com/..."}
              rows={3}
              className="w-full text-sm text-slate-600 placeholder-slate-300 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400 resize-y transition-colors font-mono"
            />
          </div>
          {!isEdit && (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Slug</span>
                <span className="text-xs text-slate-300">(선택 · 비우면 자동 생성)</span>
              </div>
              <input
                value={slugInput}
                onChange={e => setSlugInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="예: bittorrent"
                className="w-full text-sm text-slate-600 placeholder-slate-300 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400 transition-colors font-mono"
              />
            </div>
          )}
        </div>

        {/* 편집 / 미리보기 */}
        {!showPreview ? (
          <div className="bg-white rounded-xl border border-slate-200">
            {!isEdit && (
              <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-100 text-xs text-slate-400 font-mono flex-wrap gap-y-1">
                {[['#', '제목'], ['**굵게**', ''], ['*기울임*', ''], ['`코드`', ''], ['> 인용', ''], ['- 목록', '']].map(([syn]) => (
                  <span key={syn} className="bg-slate-50 px-2 py-0.5 rounded">{syn}</span>
                ))}
              </div>
            )}
            {isEdit && !article?.markdown_content && (
              <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100 text-xs text-amber-600 bg-amber-50 rounded-t-xl">
                <span>⚠️</span>
                <span>이 글은 원본 마크다운이 없습니다. 마크다운으로 새로 작성하면 저장 시 변환됩니다.</span>
              </div>
            )}
            <textarea
              value={content} onChange={e => setContent(e.target.value)}
              placeholder={isEdit ? '' : `## 개요\n\n내용을 마크다운으로 작성하세요...\n\n## 핵심 내용\n\n## 분석 및 인사이트`}
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
            <MarkdownRenderer className="prose-ai">{content}</MarkdownRenderer>
          </div>
        )}
      </div>
    </div>
  );
}
