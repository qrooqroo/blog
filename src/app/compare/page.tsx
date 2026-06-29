import type { Metadata } from 'next';
import { MODELS, MODELS_LAST_UPDATED } from '@/data/models';
import LLMCostCalculator from '@/components/LLMCostCalculator';

export const metadata: Metadata = {
  title: 'LLM 모델·API 가격 성능 비교',
  description:
    'Claude·GPT·Gemini 등 주요 LLM의 컨텍스트 윈도우와 100만 토큰당 입력·출력 가격을 한눈에 비교하고, 월 사용량 기반 비용을 계산해 보세요.',
  alternates: { canonical: 'https://www.aiinsightnote.com/compare' },
  openGraph: {
    title: 'LLM 모델·API 가격 성능 비교 | AI Insight Note',
    description: '주요 LLM의 가격·컨텍스트·성능을 비교하고 월 비용을 계산하는 도구.',
    url: 'https://www.aiinsightnote.com/compare',
    type: 'website',
  },
};

const fmtPrice = (n: number) => (n > 0 ? `$${n.toFixed(2)}` : '—');
const fmtCtx = (n: number) => (n >= 1_000_000 ? `${(n / 1_000_000).toFixed(n % 1_000_000 ? 1 : 0)}M` : `${Math.round(n / 1000)}K`);

export default function ComparePage() {
  // 입력가 기준 오름차순 정렬(미검증=0은 뒤로)
  const rows = [...MODELS].sort((a, b) => {
    const ap = a.inputPrice || Infinity;
    const bp = b.inputPrice || Infinity;
    return ap - bp;
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-black text-slate-900 leading-snug">LLM 모델·API 가격 · 성능 비교</h1>
        <p className="mt-2 text-base text-slate-600 leading-relaxed">
          주요 대형 언어 모델의 컨텍스트 윈도우와 100만 토큰당 입력·출력 가격을 한곳에 정리했습니다.
          아래 계산기로 실제 사용량 기준 월 비용도 바로 비교할 수 있습니다.
        </p>
        <p className="mt-2 text-xs text-slate-400">데이터 기준일: {MODELS_LAST_UPDATED} · 가격·정책은 공급사가 자주 바꾸니 공식 페이지에서 확인하세요.</p>
      </header>

      {/* 비교표 */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-200">
              <th className="py-3 px-4 font-medium">모델</th>
              <th className="py-3 px-4 font-medium">공급사</th>
              <th className="py-3 px-4 font-medium text-right">컨텍스트</th>
              <th className="py-3 px-4 font-medium text-right">입력 $/1M</th>
              <th className="py-3 px-4 font-medium text-right">출력 $/1M</th>
              <th className="py-3 px-4 font-medium">검증</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => {
              const verified = m.lastVerified !== '0000-00-00';
              return (
                <tr key={m.id} className="border-b border-slate-100 last:border-0 align-top">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">
                      {m.link ? (
                        <a href={m.link} target="_blank" rel="noopener noreferrer nofollow sponsored" className="hover:text-indigo-600">
                          {m.name}
                        </a>
                      ) : m.name}
                    </div>
                    {m.note && <div className="mt-0.5 text-xs text-slate-400 max-w-md">{m.note}</div>}
                  </td>
                  <td className="py-3 px-4 text-slate-600 whitespace-nowrap">{m.provider}</td>
                  <td className="py-3 px-4 text-right tabular-nums text-slate-700 whitespace-nowrap">{fmtCtx(m.contextWindow)}</td>
                  <td className="py-3 px-4 text-right tabular-nums text-slate-900 whitespace-nowrap">{fmtPrice(m.inputPrice)}</td>
                  <td className="py-3 px-4 text-right tabular-nums text-slate-900 whitespace-nowrap">{fmtPrice(m.outputPrice)}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {verified
                      ? <span className="text-[11px] font-semibold text-emerald-600">✓ {m.lastVerified}</span>
                      : <span className="text-[11px] font-semibold text-amber-600">미검증</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 비용 계산기 */}
      <LLMCostCalculator />
    </div>
  );
}
