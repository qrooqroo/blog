'use client';

import { useRef, useState } from 'react';

interface Props {
  onUploaded: (url: string) => void;
}

export default function ImageUploadButton({ onUploaded }: Props) {
  const inputRef  = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setLoading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res  = await fetch('/api/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (data.url) {
        onUploaded(data.url);
      } else {
        setError(data.error ?? '업로드 실패');
      }
    } catch {
      setError('업로드 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleChange}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 text-xs font-medium text-slate-600 hover:text-indigo-600 disabled:opacity-50 transition-colors"
      >
        {loading ? (
          <><span className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />업로드 중...</>
        ) : (
          <>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            이미지 업로드
          </>
        )}
      </button>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </span>
  );
}
