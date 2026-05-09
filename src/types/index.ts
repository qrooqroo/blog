export type Category = '경제' | '정치' | '사회' | '건강' | '스포츠' | 'IT' | '문화' | 'AI 대화' | '논문 분석' | '스타트업 AI 적용';

export interface Article {
  id: number;
  title: string;
  slug: string;
  category: Category;
  excerpt: string;
  content: string;
  date: string;
  image: string;
}
