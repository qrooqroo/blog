'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import ImageUploadButton from '@/components/ImageUploadButton';

type Cat = { id: number; name: string; slug: string; parent_id: number | null; excerpt: string; markdown_content: string; image: string };

type Tab = 'write' | 'preview';

export default function CategoryEditorClient({ category }: { category: Cat }) {
  const router = useRouter();
  const [excerpt, setExcerpt]   = useState(category.excerpt ?? '');
  const [content, setContent]   = useState(category.markdown_content ?? '');
  const [image, setImage]       = useState(category.image ?? '');
  const [tab, setTab]           = useState<Tab>('write');
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/categories/${category.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ excerpt, markdown_content: content, image }),
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        setTimeout(() => router.push(`/category/${category.slug}`), 800);
      }
    } finally {
      setSaving(false);
    }
  }, [excerpt, content, image, category.id, router]);

  return (
    <div className="max-w-4xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-1.5 text-sm text-slate-400 mb-1">
            <button onClick={() => router.push(`/category/${category.slug}`)}
              className="hover:text-indigo-500 transition-colors">← 돌아가기</button>
          </div>
          <h1 className="text-xl font-black text-slate-900">
            <span className="text-slate-400 font-normal mr-2">카테고리 편집</span>
            {category.name}
          </h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || saved}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-bold transition-colors"
        >
          {saving ? (
            <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />저장 중...</>
          ) : saved ? '✓ 저장됨' : '저장'}
        </button>
      </div>

      <div className="space-y-4">
        {/* 커버 이미지 URL */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              커버 이미지 URL
            </label>
            <ImageUploadButton onUploaded={setImage} />
          </div>
          <input
            type="text"
            value={image}
            onChange={e => setImage(e.target.value)}
            placeholder="https://images.unsplash.com/... 또는 업로드 후 자동 입력"
            className="w-full text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400 transition-colors"
          />
          {image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="preview" className="mt-3 w-full h-32 object-cover rounded-lg" />
          )}
        </div>

        {/* 한줄 설명 */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
            한줄 설명
          </label>
          <input
            type="text"
            value={excerpt}
            onChange={e => setExcerpt(e.target.value)}
            placeholder="카테고리에 대한 간단한 설명을 입력하세요"
            className="w-full text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400 transition-colors"
          />
        </div>

        {/* 본문 에디터 */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {/* 탭 */}
          <div className="flex border-b border-slate-100">
            {(['write', 'preview'] as Tab[]).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-5 py-2.5 text-sm font-medium transition-colors
                  ${tab === t ? 'text-indigo-600 border-b-2 border-indigo-500 -mb-px' : 'text-slate-400 hover:text-slate-600'}`}>
                {t === 'write' ? '✏️ 작성' : '👁 미리보기'}
              </button>
            ))}
          </div>

          {tab === 'write' ? (
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder={`# ${category.name}\n\n카테고리 위키 문서를 작성하세요.\n\n마크다운을 지원합니다.`}
              className="w-full min-h-[480px] p-5 text-sm text-slate-700 font-mono leading-relaxed outline-none resize-none"
              spellCheck={false}
            />
          ) : (
            <div className="min-h-[480px] p-5">
              {content.trim() ? (
                <MarkdownRenderer className="prose text-slate-700 text-[0.95rem]">
                  {content}
                </MarkdownRenderer>
              ) : (
                <p className="text-sm text-slate-300 italic">내용을 입력하면 미리보기가 표시됩니다.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
