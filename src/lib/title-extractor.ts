/**
 * 마크다운 내용에서 제목의 영문명을 추출
 * Python extract_title_en_from_content.py 의 TypeScript 버전
 */

const hasKorean = (s: string) => /[가-힣]/.test(s);
const hasEnglish = (s: string) => /[A-Za-z]/.test(s);

function isValidEn(s: string): boolean {
  const t = s.trim().replace(/\.$/, '');
  if (!t || t.length < 2 || t.length > 80) return false;
  if (!hasEnglish(t)) return false;
  if (hasKorean(t)) return false;
  if ((t.match(/ /g) || []).length > 7) return false; // 너무 긴 문장
  if (/^[\d\s\W]+$/.test(t)) return false;
  return true;
}

function getKoKeywords(title: string): string[] {
  const clean = title.replace(/\([^)]+\)/g, '');
  return (clean.match(/[가-힣]{2,}/g) || []);
}

function getEnKeywords(title: string): string[] {
  const clean = title.replace(/\([^)]+\)/g, '');
  return (clean.match(/[A-Za-z][A-Za-z0-9\-/]*/g) || []).filter(w => w.length >= 2);
}

/**
 * 문서 제목과 마크다운 내용에서 영문명 추출
 * 반환: { ko, en } — 찾지 못하면 { ko: null, en: null }
 */
export function extractTitleEnFromContent(
  title: string,
  markdown: string
): { ko: string | null; en: string | null } {
  const search = (markdown || '').slice(0, 1200);
  if (!search) return { ko: null, en: null };

  const koKws = getKoKeywords(title);
  const enKws = getEnKeywords(title);
  const titleClean = title.replace(/\([^)]+\)/g, '').trim();

  // ── 전략 1: 한글 키워드 뒤 (영문) 패턴 ──────────────────────────
  for (const kw of koKws) {
    if (kw.length < 2) continue;
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`${escaped}[가-힣A-Za-z0-9\\s\\-/:]{0,20}\\(([A-Za-z][A-Za-z0-9\\s\\-,\\'.\/]+)\\)`);
    const m = search.match(re);
    if (m) {
      const en = m[1].trim().replace(/\.$/, '');
      if (isValidEn(en)) {
        return { ko: hasKorean(titleClean) ? titleClean : null, en };
      }
    }
  }

  // ── 전략 2: 영문 키워드가 포함된 (한글)(영문) 패턴 ────────────────
  for (const kw of enKws) {
    if (kw.length < 3) continue;
    const re = /([가-힣][가-힣A-Za-z0-9\s\-]{1,30})\(([A-Za-z][A-Za-z0-9\s\-,'.\/]{2,60})\)/g;
    let m;
    while ((m = re.exec(search)) !== null) {
      const koPart = m[1].trim();
      const enPart = m[2].trim().replace(/\.$/, '');
      // ko_part가 단독 조사(는·은·이·가·을·를·의·도·만 등)로 시작하는 문장 단편은 제외
      if (!/^[가-힣]{2}/.test(koPart)) continue;
      if (enPart.toLowerCase().includes(kw.toLowerCase()) && isValidEn(enPart)) {
        return { ko: hasKorean(koPart) ? koPart : null, en: enPart };
      }
    }
  }

  // ── 전략 3: 순수 한글 제목 — 첫 문단의 (영문) 패턴 ────────────────
  if (!hasEnglish(title)) {
    const first300 = search.slice(0, 300);
    const re = /\(([A-Za-z][A-Za-z0-9\s\-,'.\/]{2,60})\)/g;
    let m;
    while ((m = re.exec(first300)) !== null) {
      const en = m[1].trim().replace(/\.$/, '');
      if (!isValidEn(en)) continue;
      // 한글 키워드와 연관성 확인 (앞에 한글 어구가 있어야)
      const before = first300.slice(Math.max(0, m.index - 30), m.index);
      if (hasKorean(before) && koKws.some(k => before.includes(k.slice(0, 3)))) {
        return { ko: hasKorean(titleClean) ? titleClean : null, en };
      }
    }
  }

  // ── 전략 4: 영한 혼합 제목 — 영문 약어 전체명 패턴 ────────────────
  if (hasEnglish(title) && hasKorean(title)) {
    for (const kw of enKws) {
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(`\\b${escaped}\\b[^(]{0,5}\\(([A-Za-z][A-Za-z0-9\\s\\-,'.\/]+)\\)`, 'i');
      const m = search.match(re);
      if (m) {
        const en = m[1].trim().replace(/\.$/, '');
        if (isValidEn(en) && !hasKorean(en)) {
          return { ko: null, en };
        }
      }
    }
  }

  return { ko: null, en: null };
}
