'use client';
import { useEffect, useState } from 'react';

const LAB_URL: Record<string, string> = {
  Anthropic: 'https://www.anthropic.com/claude',
  OpenAI:    'https://openai.com/',
  Google:    'https://deepmind.google/technologies/gemini/',
  Meta:      'https://huggingface.co/meta-llama',
  xAI:       'https://x.ai/grok',
  DeepSeek:  'https://www.deepseek.com/',
  Mistral:   'https://mistral.ai/',
  Alibaba:   'https://huggingface.co/Qwen',
  Moonshot:  'https://www.moonshot.cn/',
};

const LAB_LOGO: Record<string, string> = {
  Anthropic: 'https://www.google.com/s2/favicons?domain=anthropic.com&sz=32',
  OpenAI:    'https://www.google.com/s2/favicons?domain=openai.com&sz=32',
  Google:    'https://www.google.com/s2/favicons?domain=deepmind.google&sz=32',
  Meta:      'https://www.google.com/s2/favicons?domain=meta.com&sz=32',
  xAI:       'https://www.google.com/s2/favicons?domain=x.ai&sz=32',
  DeepSeek:  'https://www.google.com/s2/favicons?domain=deepseek.com&sz=32',
  Mistral:   'https://www.google.com/s2/favicons?domain=mistral.ai&sz=32',
  Alibaba:   'https://www.google.com/s2/favicons?domain=alibabacloud.com&sz=32',
  Moonshot:  'https://www.google.com/s2/favicons?domain=moonshot.cn&sz=32',
};

const LAB_BADGE: Record<string, string> = {
  Anthropic: 'bg-amber-100 text-amber-700',
  OpenAI:    'bg-emerald-100 text-emerald-700',
  Google:    'bg-blue-100 text-blue-700',
  Meta:      'bg-indigo-100 text-indigo-700',
  xAI:       'bg-slate-100 text-slate-700',
  DeepSeek:  'bg-cyan-100 text-cyan-700',
  Mistral:   'bg-orange-100 text-orange-700',
  Alibaba:   'bg-yellow-100 text-yellow-700',
  Moonshot:  'bg-purple-100 text-purple-700',
};

function badge(lab: string) {
  return LAB_BADGE[lab] ?? 'bg-slate-100 text-slate-600';
}

interface Model {
  rank: number;
  name: string;
  lab: string;
  elo: number;
  fetched_at: string;
}

export default function LlmLeaderboardWidget({ locale = 'ko' }: { locale?: string }) {
  const isEn = locale === 'en';
  const [models, setModels] = useState<Model[]>([]);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/llm-rankings')
      .then(r => r.json())
      .then(d => {
        setModels(d.models ?? []);
        setFetchedAt(d.fetched_at ?? null);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col">
      <div className="flex justify-center mb-5">
        <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-indigo-600 text-white">
          {isEn ? 'AI Model Rankings' : 'AI 모델 랭킹'}
        </span>
      </div>

      {models.length === 0 ? (
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-6 bg-slate-100 rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-slate-100">
          {models.slice(0, 10).map(m => (
            <a
              key={m.rank}
              href={LAB_URL[m.lab] ?? 'https://lmarena.ai/leaderboard'}
              target="_blank"
              rel="noopener noreferrer"
              className="py-1.5 first:pt-0 last:pb-0 flex items-center gap-2 group hover:bg-slate-50 rounded transition-colors -mx-1 px-1"
            >
              <span className="text-[10px] font-bold text-slate-400 w-4 flex-shrink-0 text-right">{m.rank}</span>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-medium text-slate-700 group-hover:text-indigo-600 truncate block transition-colors">{m.name}</span>
              </div>
              {LAB_LOGO[m.lab] ? (
                <img src={LAB_LOGO[m.lab]} alt={m.lab} title={m.lab} className="w-4 h-4 rounded-sm flex-shrink-0 object-contain" />
              ) : (
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${badge(m.lab)}`}>{m.lab}</span>
              )}
              <span className="text-[10px] text-slate-400 flex-shrink-0 w-10 text-right">{m.elo}</span>
            </a>
          ))}
        </div>
      )}

    </div>
  );
}
