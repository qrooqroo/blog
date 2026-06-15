import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About | AI Insight Note',
  description: 'AI Insight Note는 AI·ML, 블록체인, 반도체, 로보틱스 등 첨단 기술을 깊이 분석하는 기술 블로그입니다.',
  alternates: { canonical: 'https://www.aiinsightnote.com/about' },
};

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 mb-2">About AI Insight Note</h1>
        <p className="text-sm text-slate-400">aiinsightnote.com</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-800">이 블로그에 대해</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            AI Insight Note는 인공지능, 머신러닝, 블록체인, 반도체, 로보틱스 등 빠르게 변화하는 첨단 기술 분야를
            심층적으로 다루는 기술 블로그입니다. 단순한 뉴스 요약이 아니라, 기술의 작동 원리와 산업적 의미를 편집자
            관점에서 분석하는 칼럼 형식으로 콘텐츠를 작성합니다.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            최신 AI 논문 분석, 기술 트렌드 인사이트, IT 전문 위키 문서, 그리고 국내외 기술 뉴스를 한 곳에서 확인할
            수 있도록 구성되어 있습니다. 영문 콘텐츠도 함께 제공하여 글로벌 독자도 이용할 수 있습니다.
          </p>
        </section>

        <hr className="border-slate-100" />

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-800">주요 콘텐츠</h2>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex gap-2">
              <span className="text-indigo-500 font-bold flex-shrink-0">인사이트</span>
              <span>AI·ML, 반도체, 바이오테크, 블록체인 등 주요 기술 트렌드에 대한 심층 분석 칼럼.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-indigo-500 font-bold flex-shrink-0">논문 분석</span>
              <span>arXiv 등에 공개된 최신 AI·ML 논문을 읽고, 핵심 기여와 의의를 한국어로 풀어쓴 분석.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-indigo-500 font-bold flex-shrink-0">뉴스</span>
              <span>국내외 AI·테크 최신 뉴스를 매일 업데이트.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-indigo-500 font-bold flex-shrink-0">위키</span>
              <span>컴퓨터 과학, AI, 블록체인, 보안 등 IT 전문 용어와 개념을 정리한 지식 문서 데이터베이스.</span>
            </li>
          </ul>
        </section>

        <hr className="border-slate-100" />

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-800">운영 목적</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            이 블로그는 기술 동향을 스스로 정리하고 기록하기 위한 개인 지식 노트로 시작하였습니다.
            시간이 지나면서 축적된 분석과 위키 문서가 다른 분들에게도 유용하길 바라는 마음으로 공개하고 있습니다.
            상업적 목적보다는 기술에 대한 진지한 탐구와 공유를 지향합니다.
          </p>
        </section>

        <hr className="border-slate-100" />

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-800">연락처</h2>
          <p className="text-sm text-slate-600">
            문의사항이 있으시면{' '}
            <a
              href="mailto:qrooqroo@gmail.com"
              className="text-indigo-600 hover:underline"
            >
              qrooqroo@gmail.com
            </a>
            으로 연락주세요.
          </p>
        </section>
      </div>
    </div>
  );
}
