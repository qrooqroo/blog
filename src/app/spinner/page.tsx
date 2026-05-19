'use client';

import { useState } from 'react';

export default function SpinnerTestPage() {
  const [overlay, setOverlay] = useState(false);

  return (
    <>
      <style>{`
        @keyframes face-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>

      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-16 p-8">
        <h1 className="text-xl font-semibold text-slate-700">스피너 테스트</h1>

        <div className="flex flex-col items-center gap-6">
          <p className="text-sm text-slate-400">인라인 미리보기</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/ai-face.png"
            alt=""
            width={120}
            height={120}
            style={{ borderRadius: '50%', animation: 'face-spin 3s linear infinite' }}
          />
          <span className="text-sm text-slate-500 font-medium tracking-wide">불러오는 중...</span>
        </div>

        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-slate-400">오버레이 (실제 화면과 동일)</p>
          <button
            onClick={() => setOverlay(true)}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            오버레이로 보기
          </button>
        </div>

        {overlay && (
          <div
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-5 cursor-pointer"
            style={{ backgroundColor: 'rgba(248,250,252,0.82)', backdropFilter: 'blur(4px)' }}
            onClick={() => setOverlay(false)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/ai-face.png"
              alt=""
              width={120}
              height={120}
              style={{ borderRadius: '50%', animation: 'face-spin 3s linear infinite' }}
            />
            <span className="text-sm text-slate-500 font-medium tracking-wide">불러오는 중...</span>
            <span className="absolute bottom-8 text-xs text-slate-400">클릭하면 닫힘</span>
          </div>
        )}
      </div>
    </>
  );
}
