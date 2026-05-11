<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# CSS 규칙

CSS 충돌이나 우선순위 문제를 `!important`로 해결하지 말 것.

대신 다음 구조적 방법을 사용한다:
- Tailwind `@layer` 우선순위 활용 (`utilities > components > base`)
- 커스텀 스타일은 `@layer components { }` 안에 배치해 Tailwind base 리셋을 이기게 함
- CSS로 해결이 안 되면 React `components` prop 인라인 스타일 사용 (Turbopack dev 환경에서 `@layer` 버그 우회)
