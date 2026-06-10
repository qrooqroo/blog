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
      'https://huggingface.co/api/models?sort=trendingScore&direction=-1&limit=7',
      { next: { revalidate: 1800 }, signal: AbortSignal.timeout(5000) }
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

const PIPELINE_LABELS_EN: Record<string, string> = {
  'text-generation': 'Text Generation',
  'text2text-generation': 'Text-to-Text',
  'image-classification': 'Image Classification',
  'text-to-image': 'Text-to-Image',
  'automatic-speech-recognition': 'Speech Recognition',
  'feature-extraction': 'Feature Extraction',
  'fill-mask': 'Fill Mask',
  'question-answering': 'Question Answering',
  'image-to-text': 'Image-to-Text',
  'video-classification': 'Video Classification',
};

export default async function HuggingFaceWidget({ locale = 'ko' }: { locale?: string }) {
  const models = await fetchTrendingModels();
  const isEn = locale === 'en';
  const labels = isEn ? PIPELINE_LABELS_EN : PIPELINE_LABELS;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col h-full">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">
        {isEn ? 'AI Model Trends' : 'AI 모델 트렌드'}
        <span className="font-normal normal-case ml-1">(HuggingFace)</span>
      </p>
      {models.length === 0 ? (
        <p className="text-xs text-slate-400">{isEn ? 'Loading…' : '불러오는 중…'}</p>
      ) : (
        <div className="flex flex-col divide-y divide-slate-100 overflow-hidden flex-1">
          {models.map(model => {
            const isLong = model.modelId.length > 26;
            return (
              <a
                key={model.id ?? model.modelId}
                href={`https://huggingface.co/${model.modelId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-1 items-center justify-between gap-2 py-1"
              >
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-bold text-slate-700 group-hover:text-indigo-600 transition-colors ${isLong ? 'line-clamp-2 break-all' : 'truncate'}`}>
                    {model.modelId}
                  </p>
                  {model.pipeline_tag && !isLong && (
                    <span className="text-xs text-indigo-400">
                      {labels[model.pipeline_tag] ?? model.pipeline_tag}
                    </span>
                  )}
                </div>
                <span className="text-xs text-rose-400 flex-shrink-0">♥ {(model.likes ?? 0).toLocaleString()}</span>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
