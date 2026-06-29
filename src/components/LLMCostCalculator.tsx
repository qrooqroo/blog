'use client';
import { useMemo, useState } from 'react';
import { MODELS, type LLMModel } from '@/data/models';

// 입력/출력 토큰량(월)을 받아 모델별 월 예상 비용을 계산하는 인터랙티브 도구.
// 가격이 0(미검증)인 모델은 계산에서 제외한다.

function fmtUSD(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
}

export default function LLMCostCalculator() {
  // 기본값: 월 입력 1,000만 토큰 / 출력 200만 토큰
  const [inputM, setInputM] = useState(10);   // 단위: 백만(M) 토큰
  const [outputM, setOutputM] = useState(2);

  const rows = useMemo(() => {
    return MODELS
      .filter((m) => m.inputPrice > 0 || m.outputPrice > 0)
      .map((m: LLMModel) => {
        const cost = inputM * m.inputPrice + outputM * m.outputPrice;
        return { m, cost };
      })
      .sort((a, b) => a.cost - b.cost);
  }, [inputM, outputM]);

  const cheapest = rows[0]?.cost ?? 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6">
      <h2 className="text-lg font-black text-slate-900 mb-1">LLM 월 비용 계산기</h2>
      <p className="text-sm text-slate-500 mb-5">월간 토큰 사용량을 넣으면 모델별 예상 비용을 비교해 줍니다.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">월 입력 토큰 (백만, M)</span>
          <input
            type="number" min={0} step={1} value={inputM}
            onChange={(e) => setInputM(Math.max(0, Number(e.target.value) || 0))}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-indigo-400 focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">월 출력 토큰 (백만, M)</span>
          <input
            type="number" min={0} step={1} value={outputM}
            onChange={(e) => setOutputM(Math.max(0, Number(e.target.value) || 0))}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-indigo-400 focus:outline-none"
          />
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-200">
              <th className="py-2 pr-4 font-medium">모델</th>
              <th className="py-2 pr-4 font-medium">공급사</th>
              <th className="py-2 pr-4 font-medium text-right">월 예상 비용</th>
              <th className="py-2 font-medium text-right">최저 대비</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ m, cost }, i) => (
              <tr key={m.id} className="border-b border-slate-100 last:border-0">
                <td className="py-2.5 pr-4 font-medium text-slate-900">
                  {m.name}
                  {i === 0 && <span className="ml-2 text-[11px] font-bold text-emerald-600">최저가</span>}
                </td>
                <td className="py-2.5 pr-4 text-slate-500">{m.provider}</td>
                <td className="py-2.5 pr-4 text-right tabular-nums text-slate-900">{fmtUSD(cost)}</td>
                <td className="py-2.5 text-right tabular-nums text-slate-400">
                  {cheapest > 0 ? `${(cost / cheapest).toFixed(1)}x` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-slate-400">
        프롬프트 캐싱·배치 할인·이미지 토큰은 반영하지 않은 단순 추정입니다. 가격 미검증 모델은 제외됩니다.
      </p>
    </div>
  );
}
