'use client';

import Image from 'next/image';
import { useState } from 'react';

interface AiToolPick {
  name: string;
  tag_ko: string;
  tag_en: string;
  description_ko: string;
  description_en: string;
  url: string;
  image: string;
}

const PICK: AiToolPick = {
  name: 'Model Context Protocol',
  tag_ko: '에이전트 인프라',
  tag_en: 'Agent Infrastructure',
  description_ko:
    'Anthropic이 공개한 AI-도구 연결 표준. LLM이 파일 시스템·DB·외부 API를 일관된 방식으로 호출할 수 있게 해주며, Claude·Cursor 등 주요 AI 도구가 채택하면서 에이전트 개발의 사실상 표준으로 자리잡고 있다.',
  description_en:
    'An open standard by Anthropic for connecting LLMs to tools, databases, and APIs. Adopted by Claude, Cursor, and a growing ecosystem, MCP is fast becoming the de-facto infrastructure for building AI agents.',
  url: 'https://modelcontextprotocol.io',
  image: 'https://avatars.githubusercontent.com/u/182288589',
};

function ToolImage({ src, name }: { src: string; name: string }) {
  const [error, setError] = useState(false);
  if (error) return null;
  return (
    <div className="w-full h-32 rounded-lg overflow-hidden flex items-center justify-center">
      <Image
        src={src}
        alt={name}
        width={128}
        height={128}
        className="w-20 h-20 object-contain"
        onError={() => setError(true)}
        unoptimized
      />
    </div>
  );
}

export default function HNAILaunchWidget({ locale = 'ko' }: { locale?: string }) {
  const isEn = locale === 'en';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
        {isEn ? 'AI Tool Pick' : 'AI 도구 추천'}
      </p>

      <ToolImage src={PICK.image} name={PICK.name} />

      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-bold text-slate-800 leading-snug">{PICK.name}</p>
        <span className="text-[10px] bg-indigo-50 text-indigo-500 px-1.5 py-0.5 rounded font-medium flex-shrink-0 mt-0.5">
          {isEn ? PICK.tag_en : PICK.tag_ko}
        </span>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed">
        {isEn ? PICK.description_en : PICK.description_ko}
      </p>

      <a
        href={PICK.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs font-medium text-indigo-500 hover:text-indigo-700 transition-colors"
      >
        {isEn ? 'Learn more →' : '자세히 보기 →'}
      </a>
    </div>
  );
}
