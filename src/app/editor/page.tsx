'use client';

import { useState, useEffect, useCallback } from 'react';

// ─── 타입 ────────────────────────────────────────────────────────────────────
type Mode = 'conversation' | 'analysis';
type Role = 'user' | 'ai';
type Category = 'AI 대화' | '논문 분석' | '스타트업 AI 적용';

interface Turn {
  id: string;
  role: Role;
  content: string;
}

interface Draft {
  title: string;
  category: Category;
  excerpt: string;
  aiName: string;
  mode: Mode;
  turns: Turn[];
  analysisContent: string;
  savedAt: string;
}

const STORAGE_KEY = 'ai-insight-editor-draft';

const CATEGORIES: Category[] = ['AI 대화', '논문 분석', '스타트업 AI 적용'];

const CATEGORY_ICONS: Record<Category, string> = {
  'AI 대화': '💬',
  '논문 분석': '📄',
  '스타트업 AI 적용': '🏢',
};

// ─── 유틸 ────────────────────────────────────────────────────────────────────
function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

function turnsToHtml(turns: Turn[], aiName: string): string {
  return turns
    .map(t => {
      const label = t.role === 'user' ? '나' : aiName;
      const cls = t.role === 'user' ? 'user' : 'ai';
      const content = t.content
        .split('\n\n')
        .map(p => `<p>${p.replace(/\n/g, '<br />')}</p>`)
        .join('');
      return `<div class="conv-turn conv-${cls}"><span class="conv-label">${label}</span><div class="conv-content">${content}</div></div>`;
    })
    .join('\n');
}

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
    .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
    .split('\n\n')
    .map(p => {
      if (p.startsWith('<h') || p.startsWith('<ul') || p.startsWith('<blockquote')) return p;
      return p.trim() ? `<p>${p.replace(/\n/g, '<br />')}</p>` : '';
    })
    .join('\n');
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 40) +
    '-' + Date.now().toString(36);
}

function generateArticleCode(draft: Draft): string {
  const html =
    draft.mode === 'conversation'
      ? `<div class="ai-conversation">\n${turnsToHtml(draft.turns, draft.aiName)}\n</div>`
      : mdToHtml(draft.analysisContent);

  const slug = generateSlug(draft.title);
  const date = new Date().toISOString().split('T')[0];

  const escaped = (s: string) =>
    s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\${/g, '\\${');

  return `// src/data/articles.ts 의 raw 배열에 추가하세요:

{
  id: /* 마지막 id + 1 */,
  title: \`${escaped(draft.title)}\`,
  slug: '${slug}',
  category: '${draft.category}',
  excerpt: \`${escaped(draft.excerpt)}\`,
  content: \`${escaped(html)}\`,
  date: '${date}',
},`;
}

// ─── 컴포넌트 ─────────────────────────────────────────────────────────────────
export default function EditorPage() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('AI 대화');
  const [excerpt, setExcerpt] = useState('');
  const [aiName, setAiName] = useState('Claude');
  const [mode, setMode] = useState<Mode>('conversation');
  const [turns, setTurns] = useState<Turn[]>([
    { id: generateId(), role: 'user', content: '' },
    { id: generateId(), role: 'ai', content: '' },
  ]);
  const [analysisContent, setAnalysisContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedAt, setSavedAt] = useState('');

  // 초안 불러오기
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const d: Draft = JSON.parse(raw);
      setTitle(d.title || '');
      setCategory(d.category || 'AI 대화');
      setExcerpt(d.excerpt || '');
      setAiName(d.aiName || 'Claude');
      setMode(d.mode || 'conversation');
      setTurns(d.turns?.length ? d.turns : [{ id: generateId(), role: 'user', content: '' }]);
      setAnalysisContent(d.analysisContent || '');
      setSavedAt(d.savedAt || '');
    } catch { /* ignore */ }
  }, []);

  // 자동 저장
  const save = useCallback(() => {
    const now = new Date().toLocaleTimeString('ko-KR');
    const draft: Draft = { title, category, excerpt, aiName, mode, turns, analysisContent, savedAt: now };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    setSavedAt(now);
  }, [title, category, excerpt, aiName, mode, turns, analysisContent]);

  useEffect(() => {
    const timer = setTimeout(save, 1500);
    return () => clearTimeout(timer);
  }, [save]);

  // 턴 조작
  const addTurn = (role: Role) => {
    setTurns(prev => [...prev, { id: generateId(), role, content: '' }]);
  };
  const removeTurn = (id: string) => {
    setTurns(prev => prev.filter(t => t.id !== id));
  };
  const updateTurn = (id: string, content: string) => {
    setTurns(prev => prev.map(t => t.id === id ? { ...t, content } : t));
  };

  const resetDraft = () => {
    if (!confirm('초안을 초기화하시겠습니까?')) return;
    setTitle(''); setCategory('AI 대화'); setExcerpt(''); setAiName('Claude');
    setMode('conversation');
    setTurns([{ id: generateId(), role: 'user', content: '' }, { id: generateId(), role: 'ai', content: '' }]);
    setAnalysisContent('');
    localStorage.removeItem(STORAGE_KEY);
  };

  const copyCode = () => {
    const draft: Draft = { title, category, excerpt, aiName, mode, turns, analysisContent, savedAt };
    navigator.clipboard.writeText(generateArticleCode(draft));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 미리보기 HTML
  const previewHtml =
    mode === 'conversation'
      ? `<div class="ai-conversation">${turnsToHtml(turns, aiName)}</div>`
      : mdToHtml(analysisContent);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 상단 툴바 */}
      <div className="sticky top-0 z-50 bg-white border-b border-slate-200 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <a href="/" className="text-slate-400 hover:text-slate-600 text-sm">← 홈</a>
            <span className="text-slate-300">|</span>
            <span className="text-sm font-bold text-slate-700">✍️ AI 대화 편집기</span>
            {savedAt && (
              <span className="text-xs text-slate-400">자동저장: {savedAt}</span>
            )}
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
              className="px-3 py-1.5 text-sm rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
            >
              🗑️ 초기화
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* 메타 정보 */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">기본 정보</h2>

          {/* 제목 */}
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="제목을 입력하세요..."
            className="w-full text-2xl font-black text-slate-900 placeholder-slate-300 border-none outline-none bg-transparent"
          />

          <div className="flex flex-wrap gap-4">
            {/* 카테고리 */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">카테고리</label>
              <div className="flex gap-2">
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
            </div>

            {/* AI 이름 (대화 모드만) */}
            {mode === 'conversation' && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">AI 모델</label>
                <select
                  value={aiName}
                  onChange={e => setAiName(e.target.value)}
                  className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-700 bg-white outline-none"
                >
                  {['Claude', 'GPT-4o', 'GPT-4', 'Gemini', 'Llama', '기타'].map(n => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* 요약 */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500">요약 (한 두 문장)</label>
            <textarea
              value={excerpt}
              onChange={e => setExcerpt(e.target.value)}
              placeholder="이 글의 핵심 내용을 짧게 요약해주세요..."
              rows={2}
              className="w-full text-sm text-slate-700 placeholder-slate-300 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400 resize-none"
            />
          </div>
        </div>

        {/* 작성 모드 전환 */}
        <div className="flex gap-2">
          <button
            onClick={() => setMode('conversation')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${mode === 'conversation' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            💬 대화 모드
          </button>
          <button
            onClick={() => setMode('analysis')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${mode === 'analysis' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            📝 분석 모드
          </button>
        </div>

        {/* 편집 영역 */}
        {!showPreview ? (
          <>
            {mode === 'conversation' ? (
              <div className="space-y-3">
                {turns.map((turn, idx) => (
                  <div
                    key={turn.id}
                    className={`rounded-xl border p-4 space-y-2 ${turn.role === 'user' ? 'bg-white border-slate-200' : 'bg-indigo-50 border-indigo-100'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${turn.role === 'user' ? 'bg-slate-100 text-slate-600' : 'bg-indigo-100 text-indigo-700'}`}>
                          {turn.role === 'user' ? '👤 나' : `🤖 ${aiName}`}
                        </span>
                        <span className="text-xs text-slate-400">#{idx + 1}</span>
                      </div>
                      <button
                        onClick={() => removeTurn(turn.id)}
                        className="text-xs text-slate-400 hover:text-red-500 transition-colors px-2 py-0.5 rounded"
                      >
                        삭제
                      </button>
                    </div>
                    <textarea
                      value={turn.content}
                      onChange={e => updateTurn(turn.id, e.target.value)}
                      placeholder={turn.role === 'user' ? '질문이나 메시지를 입력하세요...' : `${aiName}의 답변을 입력하세요...`}
                      rows={4}
                      className="w-full text-sm text-slate-700 placeholder-slate-400 bg-transparent border-none outline-none resize-none leading-relaxed"
                    />
                  </div>
                ))}

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => addTurn('user')}
                    className="flex-1 py-2.5 text-sm font-semibold rounded-xl border-2 border-dashed border-slate-300 text-slate-500 hover:border-slate-400 hover:text-slate-700 transition-colors"
                  >
                    + 나의 메시지 추가
                  </button>
                  <button
                    onClick={() => addTurn('ai')}
                    className="flex-1 py-2.5 text-sm font-semibold rounded-xl border-2 border-dashed border-indigo-200 text-indigo-400 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
                  >
                    + {aiName} 답변 추가
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-500">마크다운 지원 (# 제목, **굵게**, `코드`, &gt; 인용)</span>
                </div>
                <textarea
                  value={analysisContent}
                  onChange={e => setAnalysisContent(e.target.value)}
                  placeholder={`## 개요\n\n분석 내용을 마크다운으로 작성하세요...\n\n## 핵심 내용\n\n## 분석 및 인사이트`}
                  rows={24}
                  className="w-full text-sm text-slate-700 placeholder-slate-300 font-mono border-none outline-none resize-none leading-7"
                />
              </div>
            )}
          </>
        ) : (
          /* 미리보기 */
          <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8">
            {title && <h1 className="text-2xl font-black text-slate-900 mb-2">{title}</h1>}
            {excerpt && (
              <div className="ai-bubble pl-5 mb-8 py-3 bg-indigo-50 rounded-r-xl">
                <p className="text-sm text-indigo-800 font-medium">{excerpt}</p>
              </div>
            )}
            <div
              className="prose-ai"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        )}
      </div>

      {/* 내보내기 모달 */}
      {showExport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="font-black text-slate-900">📤 내보내기</h3>
              <button onClick={() => setShowExport(false)} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <p className="text-sm text-slate-500">
                아래 코드를 복사해서 <code className="bg-slate-100 px-1 rounded text-xs">src/data/articles.ts</code>의
                <code className="bg-slate-100 px-1 rounded text-xs ml-1">raw</code> 배열 끝에 붙여넣으세요.
              </p>
              <pre className="bg-slate-900 text-green-400 text-xs rounded-xl p-4 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {generateArticleCode({ title, category, excerpt, aiName, mode, turns, analysisContent, savedAt })}
              </pre>
            </div>
            <div className="p-6 border-t border-slate-200 flex gap-3">
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
