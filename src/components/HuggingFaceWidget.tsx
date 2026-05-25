interface HFModel {
  id: string;
  modelId: string;
  likes: number;
  downloads: number;
  pipeline_tag?: string;
}

async function fetchTrendingModels(): Promise<HFModel[]> {
  try {
    const res = await fetch(
      'https://huggingface.co/api/models?sort=trendingScore&direction=-1&limit=5',
      { next: { revalidate: 1800 } }
    );
    if (!res.ok) return [];
    return await res.json();
  } catch { return []; }
}

const PIPELINE_LABELS: Record<string, string> = {
  'text-generation': '텍스트 생성',
  'text2text-generation': '텍스트 변환',
  'image-classification': '이미지 분류',
  'text-to-image': '이미지 생성',
  'automatic-speech-recognition': '음성 인식',
  'feature-extraction': '특성 추출',
  'fill-mask': '마스크 채우기',
  'question-answering': '질의응답',
  'image-to-text': '이미지→텍스트',
  'video-classification': '영상 분류',
};

export default async function HuggingFaceWidget() {
  const models = await fetchTrendingModels();

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">HuggingFace 트렌딩</p>
      {models.length === 0 ? (
        <p className="text-xs text-slate-400">불러오는 중…</p>
      ) : (
        <div className="flex flex-col divide-y divide-slate-100">
          {models.map(model => (
            <a
              key={model.id ?? model.modelId}
              href={`https://huggingface.co/${model.modelId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 first:pt-0 last:pb-0 group flex items-center justify-between gap-2"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-700 group-hover:text-indigo-600 transition-colors truncate">
                  {model.modelId}
                </p>
                {model.pipeline_tag && (
                  <span className="text-xs text-indigo-400">
                    {PIPELINE_LABELS[model.pipeline_tag] ?? model.pipeline_tag}
                  </span>
                )}
              </div>
              <span className="text-xs text-rose-400 flex-shrink-0">♥ {(model.likes ?? 0).toLocaleString()}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
