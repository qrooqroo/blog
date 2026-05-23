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

# 작업 환경

- **DB**: 로컬 PostgreSQL만 사용 (`localhost:5433`). Supabase에는 동기화하지 않는다.
- **개발 서버**: `http://localhost:3000` 기준으로 확인한다.
- 프로덕션 배포(Vercel/Supabase)는 사용자가 명시적으로 요청할 때만 진행한다.

# CSS 규칙

CSS 충돌이나 우선순위 문제를 `!important`로 해결하지 말 것.

대신 다음 구조적 방법을 사용한다:
- Tailwind `@layer` 우선순위 활용 (`utilities > components > base`)
- 커스텀 스타일은 `@layer components { }` 안에 배치해 Tailwind base 리셋을 이기게 함
- CSS로 해결이 안 되면 React `components` prop 인라인 스타일 사용 (Turbopack dev 환경에서 `@layer` 버그 우회)
