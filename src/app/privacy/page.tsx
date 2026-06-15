import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '개인정보 처리방침 | AI Insight Note',
  description: 'AI Insight Note의 개인정보 처리방침. 쿠키, Google AdSense 광고, 분석 도구 사용에 관한 안내.',
  alternates: { canonical: 'https://www.aiinsightnote.com/privacy' },
};

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 mb-2">개인정보 처리방침</h1>
        <p className="text-sm text-slate-400">최종 수정일: 2026년 6월 15일</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 text-sm text-slate-600 leading-relaxed">

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-800">1. 개요</h2>
          <p>
            AI Insight Note(이하 "본 사이트", aiinsightnote.com)는 방문자의 개인정보를 소중히 여깁니다.
            본 방침은 본 사이트가 어떤 정보를 수집하고, 어떻게 사용하는지를 설명합니다.
          </p>
        </section>

        <hr className="border-slate-100" />

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-800">2. 수집하는 정보</h2>
          <p>
            본 사이트는 방문자로부터 직접 개인정보를 수집하지 않습니다. 다만 아래의 제3자 서비스를 통해
            일부 기술적 정보(IP 주소, 브라우저 유형, 방문 페이지, 체류 시간 등)가 자동으로 수집될 수 있습니다.
          </p>
        </section>

        <hr className="border-slate-100" />

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-800">3. 쿠키 사용</h2>
          <p>
            본 사이트는 광고 게재 및 사용 편의를 위해 쿠키(Cookie)를 사용합니다.
            쿠키는 웹사이트가 사용자의 브라우저에 저장하는 소량의 데이터 파일입니다.
            브라우저 설정에서 쿠키를 비활성화할 수 있으나, 일부 기능이 정상적으로 작동하지 않을 수 있습니다.
          </p>
        </section>

        <hr className="border-slate-100" />

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-800">4. Google AdSense 광고</h2>
          <p>
            본 사이트는 Google LLC가 제공하는 광고 서비스인 Google AdSense를 사용합니다.
            Google AdSense는 방문자의 관심사에 맞는 광고를 표시하기 위해 쿠키를 사용할 수 있습니다.
            Google의 광고 쿠키 사용 방식에 대한 자세한 내용은{' '}
            <a
              href="https://policies.google.com/technologies/ads"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:underline"
            >
              Google 광고 정책
            </a>
            에서 확인하실 수 있습니다.
          </p>
          <p>
            관심사 기반 광고(개인화 광고)를 원하지 않으시는 경우{' '}
            <a
              href="https://www.google.com/settings/ads"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:underline"
            >
              Google 광고 설정
            </a>
            에서 옵트아웃하실 수 있습니다.
          </p>
        </section>

        <hr className="border-slate-100" />

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-800">5. 제3자 서비스</h2>
          <p>본 사이트는 아래 외부 서비스의 공개 API 또는 콘텐츠를 활용합니다.</p>
          <ul className="list-disc list-inside space-y-1 text-slate-500 mt-1">
            <li>GitHub (github.com) — 트렌딩 저장소 정보</li>
            <li>HuggingFace (huggingface.co) — AI 모델 트렌드</li>
            <li>Reddit (reddit.com) — 기술 커뮤니티 트렌드</li>
            <li>Hacker News (ycombinator.com) — 개발자 커뮤니티 뉴스</li>
            <li>The Hacker News, BleepingComputer — 사이버보안 뉴스</li>
          </ul>
          <p className="mt-2">
            이들 서비스의 개인정보 처리 방식은 각 서비스의 개인정보 정책을 따르며, 본 사이트는 해당 서비스에서
            수집하는 데이터에 대해 책임지지 않습니다.
          </p>
        </section>

        <hr className="border-slate-100" />

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-800">6. 외부 링크</h2>
          <p>
            본 사이트의 기사 및 위젯에는 외부 사이트로의 링크가 포함될 수 있습니다.
            외부 사이트의 개인정보 처리 방식은 해당 사이트의 정책을 따르며, 본 사이트는 이에 대해 책임지지 않습니다.
          </p>
        </section>

        <hr className="border-slate-100" />

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-800">7. 방침 변경</h2>
          <p>
            본 개인정보 처리방침은 법령 변경 또는 서비스 변경에 따라 수정될 수 있습니다.
            변경 시 본 페이지 상단의 수정일을 통해 안내합니다.
          </p>
        </section>

        <hr className="border-slate-100" />

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-800">8. 문의</h2>
          <p>
            개인정보 처리방침에 관한 문의사항은{' '}
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
