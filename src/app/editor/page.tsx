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

function mdToHtml(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .split('\n\n')
    .map(p => {
      if (p.startsWith('<h') || p.startsWith('<li') || p.startsWith('<blockquote')) return p;
      return p.trim() ? `<p>${p.replace(/\n/g, '<br />')}</p>` : '';
    })
    .join('\n');
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
  const [showPreview, setShowPreview]   = useState(false);
  const [showExport, setShowExport]     = useState(false);
  const [copied, setCopied]             = useState(false);
  const [savedAt, setSavedAt]           = useState('');

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

  const resetDraft = () => {
    if (!confirm('초안을 초기화하시겠습니까?')) return;
    setTitle(''); setCategory('AI 대화'); setExcerpt(''); setContent('');
    localStorage.removeItem(STORAGE_KEY);
    setSavedAt('');
  };

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
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${showPreview ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}
            >
              {showPreview ? '✏️ 편집' : '👁️ 미리보기'}
            </button>
            <button
              onClick={() => setShowExport(true)}
              className="px-3 py-1.5 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              📤 내보내기
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
            placeholder="한 두 문장으로 요약해주세요..."
            rows={2}
            className="w-full text-sm text-slate-600 placeholder-slate-300 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400 resize-none transition-colors"
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
                <p className="text-sm text-indigo-800 font-medium">{excerpt}</p>
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
