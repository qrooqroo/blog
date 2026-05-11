// supabase를 import하지 않는 순수 유틸 — 클라이언트 컴포넌트에서 안전하게 import 가능

export function isNewsCategory(category: string): boolean {
  return category === '뉴스';
}

export function tableFor(category: string): 'news' | 'documents' {
  return isNewsCategory(category) ? 'news' : 'documents';
}
