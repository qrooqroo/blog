<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 뉴스 콘텐츠 작성 규칙

뉴스 기사를 작성하거나 수정할 때는 자연스러운 평문으로 쓴다.

- `###` 소제목 헤더 사용 금지
- 불릿 목록(`-`, `*`) 나열 금지
- 비교 테이블 금지
- `**굵은 글씨**` 강조 최소화 (꼭 필요한 고유명사 외에는 쓰지 않음)
- 단락을 흘러가듯 연결해서 쓴다. 항목을 구조화하지 말고 문장으로 풀어낸다.
- "주요 특징", "업계 반응", "우려 사항" 같은 AI 티 나는 섹션명 금지
- 신문 기사보다는 블로그 칼럼처럼, 정보는 담되 자연스럽게 읽히도록 쓴다.

## 뉴스 제목 작성 규칙

한국 신문 헤드라인 스타일을 따른다.

**형식**
- 쉼표(,)로 두 개의 절을 연결한다: `[사실/사건], [의미/영향/반응]`
- 문장체(`~했다`, `~있다`, `~나왔다`) 종결 금지
- 명사형으로 끝낸다: `~돌파`, `~경신`, `~우려`, `~주목`, `~가속`, `~논란`, `~요구`
- "..."(줄임표) 사용 금지

**길이**
- 표시 영역 기준 1.5~2줄을 채우는 길이로 작성한다 (약 30~50자)

**어휘**
- 임팩트 있는 동사·명사 사용: `강타`, `돌파`, `기승`, `요동`, `석권`, `급부상`, `빗발쳐`
- 주어는 짧게, 서술어는 명사로: `엔비디아, AI 반도체 독주 확고, 시총 3조 달러 돌파`

**예시**
- `비트코인, 사상 최초 10만 달러 장벽 돌파, 암호화폐 시장 새 역사`
- `트럼프 관세 폭탄, 한국 수출 전선 강타, 반도체·자동차 직격탄`
- `청년 우울증 10년 만에 최고, 취업난·주거 불안에 정신건강 위기`
- `합계출산율 0.68명, 역대 최저 또 경신, 인구 위기 대책 요구`

# 인사이트 작성 규칙

`insights` 테이블에 인사이트 글을 작성할 때 따른다.

- 인사이트는 특정 논문이나 뉴스 한 건을 요약하는 글이 아니라, 특정 주제에 대한 편집자 관점의 심층 분석 칼럼이다.
- 주제는 AI·ML·LLM·에이전트, 반도체·HBM·파운드리, 로보틱스·휴머노이드, 블록체인·DeFi·Web3, AI 바이오테크, 양자컴퓨터, 빅테크·스타트업 동향, 데이터센터 인프라 등 블로그 관심 분야에서 선택한다.

## 한국어 버전 작성 규칙

- 학술 칼럼 스타일의 흐르는 산문체. `###` 소제목·불릿 목록·비교 테이블 금지. `##` 수준 소제목은 허용.
- `**굵은 글씨**` 최소화 (꼭 필요한 고유명사 외 사용 금지).
- 본문 1500자 이상, `##` 소제목 2~3개.
- 제목: 주제의 핵심과 분석 관점을 담은 두 절 구조, 명사형 종결, 30~50자.

## 영문 버전 작성 규칙

인사이트 글을 작성할 때는 반드시 한국어 버전과 함께 영문 버전(`title_en`, `excerpt_en`, `content_en`, `slug_en`)도 작성한다.

- 한국어 본문을 그대로 번역하지 말 것. 영어권 독자를 위해 처음부터 새로 쓴 분석 칼럼으로 작성한다.
- Analytical blog column style, flowing prose. No bullet lists, no comparison tables. `##` headings allowed.
- Minimize **bold text** (proper nouns only).
- Title: two-clause structure, noun-phrase ending, 8~14 words.
- Body: 1500+ chars, 2~3 `##` headings.
- `slug_en`: lowercase English slug (e.g. `agentic-ai-enterprise-adoption-2026`).

# 논문 선정 기준

분석할 논문을 고를 때 아래 기준을 모두 충족해야 한다. 하나라도 어긋나면 선정하지 않는다.

1. **주제 적합성** — AI, 머신러닝, Web3, 반도체, 로보틱스 등 이 블로그의 관심 영역에 속한다.
2. **최신성** — 발표 후 6개월 이내의 논문을 우선한다. 오래된 논문은 해당 분야에서 이미 고전(landmark)으로 인정받는 경우에만 예외로 허용한다.
3. **접근 가능성** — arXiv 또는 공개 PDF로 전문을 읽을 수 있어야 한다. 페이월 뒤에만 있는 논문은 선정하지 않는다.
4. **실질적 기여** — "우리가 X를 했다"는 주장 외에, 왜 그게 의미 있는지 독자에게 설명할 수 있는 논문이어야 한다. 기존 연구의 단순 재현이나 미미한 수치 개선만 보고하는 논문은 제외한다.
5. **서술 가능성** — 핵심 아이디어를 수식 없이 한국어 산문으로 풀어낼 수 있어야 한다. 수학적 증명이 전부인 순수 이론 논문은 피한다.

# 논문 분석 작성 규칙

`papers` 테이블에 논문 분석 글을 작성할 때 따른다.

- 분석가 닉네임은 항상 **Liminal·P** 를 사용한다. DB의 `analyst` 컬럼에 `'Liminal·P'`로 저장한다.
- arXiv 논문이라면 `arxiv_id`를 반드시 채운다. 링크는 `https://arxiv.org/pdf/{arxiv_id}` (PDF 직링크)를 사용한다.
- `paper_title`(영문 원제), `authors`, `paper_date`를 항상 채운다.

## 한국어 버전 작성 규칙

- 학술 칼럼 스타일의 흐르는 산문체. 뉴스 기사 스타일 금지.
- `###` 소제목·불릿 목록·비교 테이블 금지. `##` 수준 소제목은 허용.
- `**굵은 글씨**` 최소화 (꼭 필요한 고유명사 외 사용 금지).
- 제목은 한국어로, 논문의 핵심 주장과 의미를 담은 두 절 구조로 쓴다. 명사형 종결, 30~50자.
- 본문 1500자 이상, `##` 소제목 2~3개.

## 영문 버전 작성 규칙

논문 분석 글을 작성할 때는 반드시 한국어 버전과 함께 영문 버전(`title_en`, `excerpt_en`, `content_en`)도 작성한다.

- 한국어 본문을 그대로 번역하지 말 것. 영어권 독자를 위해 처음부터 새로 쓴 분석 칼럼으로 작성한다.
- Analytical blog column style, flowing prose. No bullet lists, no comparison tables.
- `###` headings forbidden. `##` section headings allowed.
- Minimize **bold text** (proper nouns only).
- Title: two-clause structure "[key claim], [significance/impact]", noun-phrase ending, 8~14 words.
- Body: 1500+ chars, 2~3 `##` headings.

# 브라우저 테스트 규칙

UI·페이지·라우팅·API 관련 작업이 끝나면 반드시 브라우저로 직접 동작을 확인한다.

- `mcp__claude-in-chrome__browser_batch`로 해당 URL에 접속해 스크린샷을 찍는다.
- 수정된 화면에 버튼·링크·폼 등 인터랙티브 요소가 있으면 직접 클릭·입력해서 이벤트가 정상 작동하는지 확인한다.
- 정상 동작 여부를 눈으로 확인한 뒤 작업 완료를 보고한다.
- 콘솔 에러가 있으면 `mcp__claude-in-chrome__read_console_messages`로 확인하고 수정한다.
- dev 서버가 꺼져 있으면 사용자에게 `npm run dev` 실행을 요청하고, 응답 후 테스트한다.

# 작업 환경

- **DB**: 로컬 PostgreSQL만 사용 (`localhost:5433`). Supabase에는 동기화하지 않는다.
- **개발 서버**: `http://localhost:3000` 기준으로 확인한다.
- 프로덕션 배포(Vercel/Supabase)는 사용자가 명시적으로 요청할 때만 진행한다.

# 배포 규칙

**배포는 사용자가 명시적으로 요청할 때만 진행한다.**

- "배포해줘", "올려줘", "운영에 반영해줘" 등 명확한 배포 지시가 있을 때만 `git push` 및 Supabase 동기화를 실행한다.
- 코드 수정, 버그 픽스, 기능 추가 작업 후 자동으로 배포하지 않는다.
- 배포 요청 없이 커밋만 하는 경우에도 `git push`는 하지 않는다.

# 이미지 테스트 규칙

이미지 URL을 추가하거나 수정할 때는 반드시 실제로 이미지가 깨지지 않는지 확인한다.

- `curl -sL -o /dev/null -w "%{http_code}" <URL>` 로 HTTP 200 응답 여부를 확인한다.
- 여러 이미지가 있을 경우 전체를 일괄 테스트한다.
- 404 등 오류 응답이 있으면 올바른 URL로 교체한 뒤 다시 검증한다.
- Amazon 상품 이미지는 `https://images-na.ssl-images-amazon.com/images/P/{ASIN}.01._SL160_.jpg` 형식을 사용한다 (ASIN 기반 자동 생성, 별도 image ID 불필요).

# CSS 규칙

CSS 충돌이나 우선순위 문제를 `!important`로 해결하지 말 것.

대신 다음 구조적 방법을 사용한다:
- Tailwind `@layer` 우선순위 활용 (`utilities > components > base`)
- 커스텀 스타일은 `@layer components { }` 안에 배치해 Tailwind base 리셋을 이기게 함
- CSS로 해결이 안 되면 React `components` prop 인라인 스타일 사용 (Turbopack dev 환경에서 `@layer` 버그 우회)
