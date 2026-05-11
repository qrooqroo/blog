'use client';

import { useState, useEffect, useCallback } from 'react';

interface Category {
  id: number;
  name: string;
  parent_id?: number | null;
  count: number;
}

type Mode = { type: 'idle' }
           | { type: 'editing'; id: number; name: string; input: string; parent_id: number | null }
           | { type: 'deleting'; name: string; count: number; target: string };

export default function CategoriesClient() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [mode, setMode]             = useState<Mode>({ type: 'idle' });
  const [newName, setNewName]       = useState('');
  const [newParentId, setNewParentId] = useState<number | null>(null);
  const [saving, setSaving]         = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    const res = await fetch('/api/categories');
    const data = await res.json();
    if (!res.ok) setError(data.error);
    else setCategories(data.categories);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const parentName = (parent_id: number | null | undefined) =>
    parent_id ? (categories.find(c => c.id === parent_id)?.name ?? '?') : null;

  // ── 추가 ──────────────────────────────────────────────────
  const handleAdd = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim(), parent_id: newParentId }),
    });
    const data = await res.json();
    if (!res.ok) alert(data.error);
    else { setNewName(''); setNewParentId(null); await load(); }
    setSaving(false);
  };

  // ── 이름 변경 ─────────────────────────────────────────────
  const handleRename = async () => {
    if (mode.type !== 'editing') return;
    const { id, name: oldName, input, parent_id } = mode;
    setSaving(true);
    const res = await fetch(`/api/categories/${encodeURIComponent(oldName)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newName: input.trim(), parent_id }),
    });
    const data = await res.json();
    if (!res.ok) alert(data.error);
    else { setMode({ type: 'idle' }); await load(); }
    setSaving(false);
  };

  // ── 삭제 ──────────────────────────────────────────────────
  const handleDelete = async () => {
    if (mode.type !== 'deleting') return;
    const { name, count, target } = mode;
    if (count > 0 && !target) { alert('이동할 카테고리를 선택해주세요.'); return; }
    setSaving(true);
    const res = await fetch(`/api/categories/${encodeURIComponent(name)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetCategory: target || null }),
    });
    const data = await res.json();
    if (!res.ok) alert(data.error);
    else { setMode({ type: 'idle' }); await load(); }
    setSaving(false);
  };

  const others = (name: string) => categories.filter(c => c.name !== name);

  // ── 렌더 ──────────────────────────────────────────────────
  if (loading) return <p className="text-slate-400 text-sm">불러오는 중...</p>;
  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
      <p className="font-semibold mb-1">오류</p>
      <p>{error}</p>
      <p className="mt-3 text-xs text-red-500">Supabase에 <code className="bg-red-100 px-1 rounded">categories</code> 테이블이 없거나 컬럼이 부족합니다.</p>
      <pre className="mt-2 bg-red-100 rounded p-3 text-xs overflow-x-auto whitespace-pre">{`-- 테이블 생성
CREATE TABLE categories (
  id        SERIAL PRIMARY KEY,
  name      TEXT UNIQUE NOT NULL,
  parent_id INTEGER REFERENCES categories(id)
);

-- 기존 데이터 마이그레이션 (parent_id 컬럼 추가)
ALTER TABLE categories ADD COLUMN parent_id INTEGER REFERENCES categories(id);

-- 기본 카테고리 삽입
INSERT INTO categories (name) VALUES
  ('AI 대화'),('논문 분석'),('스타트업 AI 적용'),('뉴스');`}</pre>
    </div>
  );

  return (
    <div className="space-y-6">

      {/* 새 카테고리 추가 */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
        <p className="text-sm font-semibold text-slate-700">새 카테고리 추가</p>
        <div className="flex gap-2">
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="카테고리 이름"
            className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400 transition-colors"
          />
          <button
            onClick={handleAdd}
            disabled={saving || !newName.trim()}
            className="px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            추가
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 w-20 flex-shrink-0">상위 카테고리</span>
          <select
            value={newParentId ?? ''}
            onChange={e => setNewParentId(e.target.value ? Number(e.target.value) : null)}
            className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400 bg-white"
          >
            <option value="">없음 (최상위)</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 카테고리 목록 */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700">카테고리 목록</p>
          <span className="text-xs text-slate-400">{categories.length}개</span>
        </div>

        {categories.length === 0 && (
          <p className="px-5 py-8 text-sm text-slate-400 text-center">카테고리가 없습니다.</p>
        )}

        <ul className="divide-y divide-slate-100">
          {categories.map(cat => (
            <li key={cat.id}>

              {/* 편집 모드 */}
              {mode.type === 'editing' && mode.id === cat.id ? (
                <div className="px-5 py-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      autoFocus
                      value={mode.input}
                      onChange={e => setMode({ ...mode, input: e.target.value })}
                      onKeyDown={e => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setMode({ type: 'idle' }); }}
                      className="flex-1 text-sm border border-indigo-400 rounded-lg px-3 py-1.5 outline-none"
                    />
                    <button onClick={handleRename} disabled={saving}
                      className="text-xs px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                      저장
                    </button>
                    <button onClick={() => setMode({ type: 'idle' })}
                      className="text-xs px-3 py-1.5 border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-50 transition-colors">
                      취소
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 w-20 flex-shrink-0">상위 카테고리</span>
                    <select
                      value={mode.parent_id ?? ''}
                      onChange={e => setMode({ ...mode, parent_id: e.target.value ? Number(e.target.value) : null })}
                      className="flex-1 text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white outline-none focus:border-indigo-400"
                    >
                      <option value="">없음 (최상위)</option>
                      {categories.filter(c => c.id !== cat.id).map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

              ) : mode.type === 'deleting' && mode.name === cat.name ? (

              /* 삭제 확인 모드 */
                <div className="px-5 py-4 bg-red-50 space-y-3">
                  <p className="text-sm font-semibold text-red-700">「{cat.name}」 카테고리를 삭제합니다.</p>
                  {cat.count > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm text-red-600">
                        이 카테고리에 글이 <strong>{cat.count}개</strong> 있습니다. 이동할 카테고리를 선택하세요.
                      </p>
                      <select
                        value={mode.target}
                        onChange={e => setMode({ ...mode, target: e.target.value })}
                        className="w-full text-sm border border-red-300 rounded-lg px-3 py-2 bg-white outline-none"
                      >
                        <option value="">— 카테고리 선택 —</option>
                        {others(cat.name).map(o => (
                          <option key={o.name} value={o.name}>{o.name} ({o.count}개)</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">이 카테고리에는 글이 없습니다.</p>
                  )}
                  <div className="flex gap-2">
                    <button onClick={handleDelete} disabled={saving || (cat.count > 0 && !mode.target)}
                      className="text-xs px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors">
                      {saving ? '삭제 중...' : '삭제 확인'}
                    </button>
                    <button onClick={() => setMode({ type: 'idle' })}
                      className="text-xs px-3 py-1.5 border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-50 transition-colors">
                      취소
                    </button>
                  </div>
                </div>

              ) : (

              /* 기본 상태 */
                <div className="px-5 py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-700">{cat.name}</span>
                      {cat.parent_id && (
                        <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          ↑ {parentName(cat.parent_id)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">ID: {cat.id}</p>
                  </div>
                  <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full flex-shrink-0">
                    글 {cat.count}개
                  </span>
                  <button
                    onClick={() => setMode({ type: 'editing', id: cat.id, name: cat.name, input: cat.name, parent_id: cat.parent_id ?? null })}
                    className="text-xs px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors flex-shrink-0"
                  >
                    편집
                  </button>
                  <button
                    onClick={() => setMode({ type: 'deleting', name: cat.name, count: cat.count, target: '' })}
                    className="text-xs px-3 py-1.5 border border-red-200 text-red-400 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0"
                  >
                    삭제
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}
