'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Cat    = { id: number; name: string; parent_id: number | null };
type NewCat = { tempId: string; name: string; parent_id: number | null };

let _tempId = 0;
const nextTempId = () => `new_${++_tempId}`;

const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
  </svg>
);

// ── 재귀 트리 노드 ───────────────────────────────────────────────
function CatNode({
  cat, depth, cats, edits, newCats, deletedIds,
  onEdit, onNewChange, onAddChild, onRemoveNew, onToggleDelete,
}: {
  cat: Cat; depth: number;
  cats: Cat[]; edits: Record<number, string>; newCats: NewCat[];
  deletedIds: Set<number>;
  onEdit: (id: number, val: string) => void;
  onNewChange: (tempId: string, val: string) => void;
  onAddChild: (parentId: number) => void;
  onRemoveNew: (tempId: string) => void;
  onToggleDelete: (id: number) => void;
}) {
  const children    = cats.filter(c => c.parent_id === cat.id);
  const newChildren = newCats.filter(c => c.parent_id === cat.id);
  const isDeleted   = deletedIds.has(cat.id);
  const changed     = !isDeleted && edits[cat.id] !== cat.name;

  const pl       = depth === 0 ? 'px-4' : `pl-${4 + depth * 6} pr-4`;
  const textSize = depth === 0 ? 'text-sm font-bold' : depth === 1 ? 'text-sm' : 'text-xs';
  const bgRow    = isDeleted
    ? 'bg-red-50'
    : depth === 0
      ? (changed ? 'bg-indigo-50' : 'bg-slate-50')
      : (changed ? 'bg-indigo-50/40' : '');
  const borderRow = depth === 0
    ? `border-b ${isDeleted ? 'border-red-100' : changed ? 'border-indigo-100' : 'border-slate-100'}`
    : `border-b ${isDeleted ? 'border-red-100' : 'border-slate-100'}`;

  return (
    <>
      {/* 현재 노드 행 */}
      <div className={`flex items-center gap-2 py-2.5 ${pl} ${bgRow} ${borderRow}`}>
        {depth > 0 && (
          <span className={`shrink-0 select-none ${isDeleted ? 'text-red-200' : 'text-slate-200'}`}>
            {'  '.repeat(depth - 1)}└
          </span>
        )}
        <span className={`text-xs w-6 shrink-0 ${isDeleted ? 'text-red-300' : 'text-slate-300'}`}>#{cat.id}</span>
        <input
          type="text"
          value={edits[cat.id] ?? cat.name}
          onChange={e => !isDeleted && onEdit(cat.id, e.target.value)}
          disabled={isDeleted}
          className={`flex-1 bg-transparent outline-none border-b-2 transition-colors pb-0.5 ${textSize}
            ${isDeleted
              ? 'line-through text-red-300 border-transparent cursor-not-allowed'
              : changed
                ? 'border-indigo-400 text-indigo-700'
                : 'border-transparent text-slate-700 hover:border-slate-200 focus:border-indigo-400'}`}
        />
        {/* 되돌리기 or 삭제 취소 */}
        {isDeleted ? (
          <button onClick={() => onToggleDelete(cat.id)}
            className="text-xs text-red-400 hover:text-red-600 shrink-0 font-medium">취소</button>
        ) : (
          <>
            {changed && (
              <button onClick={() => onEdit(cat.id, cat.name)}
                className="text-xs text-slate-400 hover:text-slate-600 shrink-0">되돌리기</button>
            )}
            <button
              onClick={() => onToggleDelete(cat.id)}
              className="shrink-0 text-slate-300 hover:text-red-400 transition-colors p-0.5 rounded"
              title="삭제"
            >
              <TrashIcon />
            </button>
          </>
        )}
      </div>

      {/* 자식 노드 재귀 (삭제 표시된 부모의 자식도 표시) */}
      {children.map(child => (
        <CatNode
          key={child.id} cat={child} depth={depth + 1}
          cats={cats} edits={edits} newCats={newCats} deletedIds={deletedIds}
          onEdit={onEdit} onNewChange={onNewChange}
          onAddChild={onAddChild} onRemoveNew={onRemoveNew}
          onToggleDelete={onToggleDelete}
        />
      ))}

      {/* 신규 자식 */}
      {!isDeleted && newChildren.map(nc => {
        const childPl = `pl-${4 + (depth + 1) * 6} pr-4`;
        return (
          <div key={nc.tempId}
            className={`flex items-center gap-2 py-2.5 ${childPl} bg-emerald-50/60 border-b border-emerald-100`}>
            <span className="text-emerald-300 shrink-0 select-none">{'  '.repeat(depth)}└</span>
            <span className="text-xs text-emerald-400 w-6 shrink-0">new</span>
            <input
              type="text" value={nc.name}
              onChange={e => onNewChange(nc.tempId, e.target.value)}
              placeholder="새 카테고리 이름"
              className="flex-1 text-sm bg-transparent outline-none border-b-2 border-emerald-400 text-emerald-700 pb-0.5 placeholder:text-emerald-300 font-medium"
            />
            <button onClick={() => onRemoveNew(nc.tempId)}
              className="shrink-0 text-slate-300 hover:text-red-400 transition-colors p-0.5 rounded">
              <TrashIcon />
            </button>
          </div>
        );
      })}

      {/* + 서브카테고리 추가 */}
      {!isDeleted && (
        <div className={`${depth === 0 ? 'px-4' : `pl-${4 + depth * 6} pr-4`} py-2 border-b border-slate-100`}>
          <button onClick={() => onAddChild(cat.id)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-500 transition-colors">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            서브카테고리 추가
          </button>
        </div>
      )}
    </>
  );
}

// ── 메인 페이지 ─────────────────────────────────────────────────
export default function CategoriesEditPage() {
  const router = useRouter();
  const [cats, setCats]           = useState<Cat[]>([]);
  const [edits, setEdits]         = useState<Record<number, string>>({});
  const [newCats, setNewCats]     = useState<NewCat[]>([]);
  const [deletedIds, setDeletedIds] = useState<Set<number>>(new Set());
  const [saving, setSaving]       = useState(false);
  const [result, setResult]       = useState<{ ok: number; fail: number } | null>(null);
  const [loading, setLoading]     = useState(true);
  const topNewRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => {
      const list: Cat[] = d.categories ?? [];
      setCats(list);
      const init: Record<number, string> = {};
      list.forEach(c => { init[c.id] = c.name; });
      setEdits(init);
      setLoading(false);
    });
  }, []);

  const onEdit      = useCallback((id: number, val: string) => setEdits(p => ({ ...p, [id]: val })), []);
  const onNewChange = useCallback((tempId: string, val: string) =>
    setNewCats(p => p.map(c => c.tempId === tempId ? { ...c, name: val } : c)), []);
  const onAddChild  = useCallback((parentId: number) =>
    setNewCats(p => [...p, { tempId: nextTempId(), name: '', parent_id: parentId }]), []);
  const onRemoveNew = useCallback((tempId: string) =>
    setNewCats(p => p.filter(c => c.tempId !== tempId)), []);
  const onToggleDelete = useCallback((id: number) =>
    setDeletedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    }), []);

  const addTop = () => {
    const tempId = nextTempId();
    setNewCats(p => [...p, { tempId, name: '', parent_id: null }]);
    setTimeout(() => topNewRefs.current[tempId]?.focus(), 50);
  };

  const changedCount  = cats.filter(c => !deletedIds.has(c.id) && edits[c.id] !== c.name).length;
  const validNewCount = newCats.filter(c => c.name.trim()).length;
  const totalChanges  = changedCount + validNewCount + deletedIds.size;

  const handleSave = async () => {
    if (totalChanges === 0) { router.push('/categories'); return; }
    setSaving(true);
    let ok = 0, fail = 0;

    // 1. 삭제 (자식 포함 자동 처리 - ON DELETE CASCADE or SET NULL)
    for (const id of deletedIds) {
      const cat = cats.find(c => c.id === id);
      if (!cat) continue;
      try {
        const res = await fetch(`/api/categories/${encodeURIComponent(cat.name)}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetCategory: null }),
        });
        (await res.json()).success ? ok++ : fail++;
      } catch { fail++; }
    }

    // 2. 수정
    const changed = cats.filter(c => !deletedIds.has(c.id) && edits[c.id]?.trim() !== c.name && edits[c.id]?.trim() !== '');
    await Promise.all(changed.map(async c => {
      try {
        const res = await fetch(`/api/categories/${encodeURIComponent(c.name)}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newName: edits[c.id].trim(), parent_id: c.parent_id }),
        });
        (await res.json()).success ? ok++ : fail++;
      } catch { fail++; }
    }));

    // 3. 신규 생성 (상위 먼저)
    const sorted = [...newCats.filter(c => c.name.trim())].sort(
      (a, b) => (a.parent_id === null ? 0 : 1) - (b.parent_id === null ? 0 : 1));
    for (const c of sorted) {
      try {
        const res = await fetch('/api/categories', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: c.name.trim(), parent_id: c.parent_id }),
        });
        (await res.json()).success ? ok++ : fail++;
      } catch { fail++; }
    }

    setSaving(false);
    setResult({ ok, fail });
    setTimeout(() => router.push('/categories'), 1200);
  };

  const tops = cats.filter(c => !c.parent_id);

  if (loading) return (
    <div className="max-w-3xl mx-auto py-20 text-center text-slate-400">불러오는 중...</div>
  );

  return (
    <div className="max-w-3xl mx-auto pb-24">
      {/* 헤더 */}
      <div className="mb-6">
        <div className="flex items-center gap-1.5 text-sm text-slate-400 mb-3">
          <Link href="/" className="hover:text-indigo-500 transition-colors">홈</Link>
          <span>›</span>
          <Link href="/categories" className="hover:text-indigo-500 transition-colors">카테고리</Link>
          <span>›</span>
          <span className="text-slate-600">편집</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900">카테고리 편집</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              수정 · 추가 · 삭제 후 완료 버튼을 누르세요
              {deletedIds.size > 0 && (
                <span className="ml-2 text-red-400 font-medium">삭제 {deletedIds.size}개</span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/categories"
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
              취소
            </Link>
            <SaveBtn saving={saving} result={result} count={totalChanges} onClick={handleSave} />
          </div>
        </div>
      </div>

      {/* 카테고리 트리 */}
      <div className="space-y-3">
        {tops.map(top => (
          <div key={top.id}
            className={`bg-white rounded-2xl border overflow-hidden transition-colors ${
              deletedIds.has(top.id) ? 'border-red-200' : 'border-slate-200'}`}>
            <CatNode
              cat={top} depth={0}
              cats={cats} edits={edits} newCats={newCats} deletedIds={deletedIds}
              onEdit={onEdit} onNewChange={onNewChange}
              onAddChild={onAddChild} onRemoveNew={onRemoveNew}
              onToggleDelete={onToggleDelete}
            />
          </div>
        ))}

        {/* 신규 최상위 */}
        {newCats.filter(c => c.parent_id === null).map(nc => (
          <div key={nc.tempId} className="bg-emerald-50 rounded-2xl border border-emerald-200 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3">
              <span className="text-xs font-bold text-emerald-400 w-6 shrink-0">new</span>
              <input
                ref={el => { topNewRefs.current[nc.tempId] = el; }}
                type="text" value={nc.name}
                onChange={e => onNewChange(nc.tempId, e.target.value)}
                placeholder="새 최상위 카테고리 이름"
                className="flex-1 text-sm font-bold bg-transparent outline-none border-b-2 border-emerald-400 text-emerald-700 pb-0.5 placeholder:text-emerald-300"
              />
              <button onClick={() => onRemoveNew(nc.tempId)}
                className="shrink-0 text-slate-300 hover:text-red-400 transition-colors p-0.5 rounded">
                <TrashIcon />
              </button>
            </div>
          </div>
        ))}

        {/* 최상위 추가 버튼 */}
        <button onClick={addTop}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-sm text-slate-400 hover:text-indigo-500 transition-all">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          최상위 카테고리 추가
        </button>
      </div>

      {/* 하단 고정 완료 버튼 */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2">
        <SaveBtn saving={saving} result={result} count={totalChanges} onClick={handleSave} large />
      </div>
    </div>
  );
}

function SaveBtn({ saving, result, count, onClick, large }: {
  saving: boolean; result: { ok: number; fail: number } | null;
  count: number; onClick: () => void; large?: boolean;
}) {
  const cls = large
    ? 'px-8 py-3 rounded-xl shadow-lg shadow-indigo-200 font-bold text-sm'
    : 'px-5 py-2 rounded-lg font-semibold text-sm';
  return (
    <button onClick={onClick} disabled={saving}
      className={`flex items-center gap-2 ${cls} bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white transition-all`}>
      {saving
        ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>저장 중...</>
        : result ? `✓ ${result.ok}개 저장됨`
        : `완료${count > 0 ? ` (${count}개 변경)` : ''}`}
    </button>
  );
}
