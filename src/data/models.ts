// LLM 모델·API 비교 데이터셋 — "데이터 모트"의 시드.
// 가격은 100만 토큰(1M)당 USD, 컨텍스트는 토큰 수.
// 정기적으로 각 공급사 공식 페이지에서 검증·갱신한다(이 유지보수가 곧 사이트의 고유 가치).
// Claude 수치는 공식 데이터 기준(2026-06 기준 캐시). 그 외 공급사는 공개 정보 기반 참고치로,
// 발행 전/주기적으로 공식 가격 페이지에서 확인 권장.

export interface LLMModel {
  id: string;
  name: string;
  provider: 'Anthropic' | 'OpenAI' | 'Google' | string;
  contextWindow: number;   // 입력 컨텍스트(토큰)
  maxOutput: number;       // 최대 출력 토큰
  inputPrice: number;      // $/1M input tokens
  outputPrice: number;     // $/1M output tokens
  modality: string[];      // 예: ['text', 'vision']
  note?: string;
  /** 공급사 공식 가격/문서 링크(제휴 링크로 교체 가능) */
  link?: string;
  /** 이 행의 가격·스펙을 마지막으로 검증한 날짜(YYYY-MM-DD) */
  lastVerified: string;
}

/** 데이터셋 전체 기준일 — UI에 노출해 신뢰 신호로 사용 */
export const MODELS_LAST_UPDATED = '2026-06-29';

export const MODELS: LLMModel[] = [
  // ── Anthropic (공식 수치) ─────────────────────────────
  {
    id: 'claude-fable-5',
    name: 'Claude Fable 5',
    provider: 'Anthropic',
    contextWindow: 1_000_000,
    maxOutput: 128_000,
    inputPrice: 10,
    outputPrice: 50,
    modality: ['text', 'vision'],
    note: '가장 강력한 장기 추론·에이전트용. 사고(thinking) 항상 켜짐.',
    link: 'https://platform.claude.com/docs/en/about-claude/models/overview',
    lastVerified: '2026-06-29',
  },
  {
    id: 'claude-opus-4-8',
    name: 'Claude Opus 4.8',
    provider: 'Anthropic',
    contextWindow: 1_000_000,
    maxOutput: 128_000,
    inputPrice: 5,
    outputPrice: 25,
    modality: ['text', 'vision'],
    note: '최상위 Opus 등급. 장기 에이전트·지식노동에 강함. 1M 컨텍스트 추가요금 없음.',
    link: 'https://platform.claude.com/docs/en/about-claude/models/overview',
    lastVerified: '2026-06-29',
  },
  {
    id: 'claude-sonnet-4-6',
    name: 'Claude Sonnet 4.6',
    provider: 'Anthropic',
    contextWindow: 1_000_000,
    maxOutput: 64_000,
    inputPrice: 3,
    outputPrice: 15,
    modality: ['text', 'vision'],
    note: '속도와 지능의 균형. 대량 처리에 가성비.',
    link: 'https://platform.claude.com/docs/en/about-claude/models/overview',
    lastVerified: '2026-06-29',
  },
  {
    id: 'claude-haiku-4-5',
    name: 'Claude Haiku 4.5',
    provider: 'Anthropic',
    contextWindow: 200_000,
    maxOutput: 64_000,
    inputPrice: 1,
    outputPrice: 5,
    modality: ['text', 'vision'],
    note: '가장 빠르고 저렴. 단순·고빈도 작업용.',
    link: 'https://platform.claude.com/docs/en/about-claude/models/overview',
    lastVerified: '2026-06-29',
  },

  // ── OpenAI (공식 가격 페이지 검증: developers.openai.com/api/docs/pricing) ──
  {
    id: 'gpt-5-5',
    name: 'GPT-5.5',
    provider: 'OpenAI',
    contextWindow: 400_000,
    maxOutput: 128_000,
    inputPrice: 5,
    outputPrice: 30,
    modality: ['text', 'vision'],
    note: 'OpenAI 플래그십(복합 추론·코딩). 캐시 입력 $0.50/1M.',
    link: 'https://developers.openai.com/api/docs/pricing',
    lastVerified: '2026-06-29',
  },
  {
    id: 'gpt-5-4-mini',
    name: 'GPT-5.4-mini',
    provider: 'OpenAI',
    contextWindow: 400_000,
    maxOutput: 128_000,
    inputPrice: 0.75,
    outputPrice: 4.5,
    modality: ['text', 'vision'],
    note: '비용 효율형. 대량·경량 작업용.',
    link: 'https://developers.openai.com/api/docs/pricing',
    lastVerified: '2026-06-29',
  },

  // ── Google (공식 가격 페이지 검증: ai.google.dev/gemini-api/docs/pricing) ──
  {
    id: 'gemini-3-1-pro',
    name: 'Gemini 3.1 Pro',
    provider: 'Google',
    contextWindow: 1_000_000,
    maxOutput: 64_000,
    inputPrice: 2,
    outputPrice: 12,
    modality: ['text', 'vision'],
    note: 'Google 플래그십. 200k 토큰 초과 시 입력 $4·출력 $18로 상향(장문 구간).',
    link: 'https://ai.google.dev/gemini-api/docs/pricing',
    lastVerified: '2026-06-29',
  },
  {
    id: 'gemini-3-5-flash',
    name: 'Gemini 3.5 Flash',
    provider: 'Google',
    contextWindow: 1_000_000,
    maxOutput: 64_000,
    inputPrice: 1.5,
    outputPrice: 9,
    modality: ['text', 'vision'],
    note: '속도·비용 균형형.',
    link: 'https://ai.google.dev/gemini-api/docs/pricing',
    lastVerified: '2026-06-29',
  },
];
