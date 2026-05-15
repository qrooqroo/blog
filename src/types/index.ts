export type Category = '경제' | '정치' | '사회' | '건강' | '스포츠' | 'IT' | '문화' | 'AI 대화' | '논문 분석' | '스타트업 AI 적용';

export interface Article {
  id: number;
  title: string;
  title_ko?: string | null;
  title_en?: string | null;
  slug: string;
  category: string;
  category_id?: number | null;
  excerpt: string;
  content: string;
  markdown_content?: string | null;
  date: string;
  image: string;
}
