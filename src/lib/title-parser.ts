/**
 * "한글명(영문명)" 또는 "영문명(한글명)" 형식의 제목을 분리
 */
export interface TitleParts {
  ko: string | null;
  en: string | null;
}

/**
 * title_ko가 원래 제목의 중요한 비한글 접두사를 잃었는지 확인.
 * 예: title="N+1 문제", title_ko="문제" → true (N+1이 사라짐)
 * 예: title="블록체인(Blockchain)", title_ko="블록체인" → false (정상)
 */
export function isTitleKoIncomplete(title: string, titleKo: string): boolean {
  // 원래 제목이 비한글 문자(숫자·영문·기호)로 시작하는 경우
  const prefixMatch = title.match(/^([A-Za-z0-9\+\-\*\/\#\.\_\s]+?)([가-힣])/);
  if (!prefixMatch) return false; // 한글로 시작하거나 완전 영문 → 문제없음

  const nonKoPrefix = prefixMatch[1].trim(); // 예: "N+1", "SQL"
  // title_ko가 그 접두사를 포함하지 않으면 불완전
  return nonKoPrefix.length > 0 && !titleKo.includes(nonKoPrefix);
}

/**
 * 카드·상세 페이지에서 표시할 한글명 결정.
 * title_ko가 불완전하면 원래 title 전체를 반환.
 */
export function resolveDisplayKo(title: string, titleKo: string | null | undefined): string {
  if (!titleKo) return title;
  if (isTitleKoIncomplete(title, titleKo)) return title;
  return titleKo;
}

const hasKorean = (s: string) => /[가-힣]/.test(s);

export function parseTitleParts(title: string): TitleParts {
  if (!title) return { ko: null, en: null };

  // 패턴 1: "주부분(괄호부분)" — 끝이 괄호로 끝나는 경우
  const endMatch = title.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
  if (endMatch) {
    const main  = endMatch[1].trim();
    const paren = endMatch[2].trim();
    const mainHasKo  = hasKorean(main);
    const parenHasKo = hasKorean(paren);

    if (mainHasKo && !parenHasKo) return { ko: main, en: paren };
    if (!mainHasKo && parenHasKo) return { ko: paren, en: main };
    return { ko: null, en: null };
  }

  // 패턴 2: "한글(영문) 나머지" — 괄호가 중간에 있는 경우
  // 예: "트랜스포머(Transformer) 아키텍처", "창발적 능력(Emergent Abilities) 심화"
  const midMatch = title.match(/^([가-힣A-Za-z0-9\s\-]+?)\(([^)]+)\)(.+)?$/);
  if (midMatch) {
    const before = midMatch[1].trim();
    const paren  = midMatch[2].trim();
    const after  = (midMatch[3] || '').trim();

    const beforeHasKo = hasKorean(before);
    const parenHasKo  = hasKorean(paren);

    // 한글어구(영문) 뒤에 수식어 — ko: 한글어구, en: 영문
    if (beforeHasKo && !parenHasKo) {
      const ko = after ? `${before} ${after}`.trim() : before;
      return { ko, en: paren };
    }
    // 영문(한글) 뒤에 수식어
    if (!beforeHasKo && parenHasKo) {
      return { ko: paren, en: before };
    }
  }

  return { ko: null, en: null };
}
