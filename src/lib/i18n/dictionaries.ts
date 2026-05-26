export type Locale = 'ko' | 'en';

const ko = {
  site: {
    subtitle: 'AI · Web3 · 기술 트렌드와 인사이트를 한눈에',
  },
  nav: {
    home: '홈',
    widgets: '위젯',
    widgetsShow: '경제지표·날씨·달력 표시',
    widgetsHide: '경제지표·날씨·달력 숨기기',
    news: '뉴스',
    insights: '인사이트',
    back: '뒤로',
    edit: '편집',
    relatedNews: '관련 뉴스',
    docList: '문서 목록',
  },
  pages: {
    insights: {
      title: '인사이트',
      subtitle: '최신 기술 방향성과 논문 분석',
      empty: '아직 작성된 글이 없습니다.',
      back: '← 인사이트 목록',
    },
    news: {
      title: '뉴스',
      empty: '아직 작성된 글이 없습니다.',
    },
    papers: {
      back: '← 홈으로',
      original: '원문 논문',
      published: '발행일:',
    },
    wiki: {
      noDesc: '아직 작성된 설명이 없습니다.',
      editLink: '편집하기 →',
    },
    stocks: {
      title: '증권·주식',
      description: '실시간 주가 지수, 시장 현황, 섹터 히트맵, 경제 캘린더',
    },
    categories: {
      title: '전체 카테고리',
      home: '홈',
      label: '카테고리',
      fields: '개 분야',
      subLabel: '개 세부 카테고리',
      docCount: '총',
      docUnit: '개 문서',
    },
    category: {
      home: '홈',
      noDesc: '아직 작성된 설명이 없습니다.',
      editLink: '편집하기 →',
      docList: '문서 목록',
      empty: '아직 작성된 문서가 없습니다.',
    },
  },
  errors: {
    categoryLoad: '카테고리 조회 실패',
    categoryNotFound: '카테고리를 찾을 수 없습니다',
    pageLoad: '페이지를 불러올 수 없습니다',
  },
};

const en: typeof ko = {
  site: {
    subtitle: 'AI · Web3 · Tech trends and insights at a glance',
  },
  nav: {
    home: 'Home',
    widgets: 'Widgets',
    widgetsShow: 'Show market data, weather & calendar',
    widgetsHide: 'Hide market data, weather & calendar',
    news: 'News',
    insights: 'Insights',
    back: 'Back',
    edit: 'Edit',
    relatedNews: 'Related News',
    docList: 'Documents',
  },
  pages: {
    insights: {
      title: 'Insights',
      subtitle: 'Latest tech trends and research analysis',
      empty: 'No articles yet.',
      back: '← Back to Insights',
    },
    news: {
      title: 'News',
      empty: 'No articles yet.',
    },
    papers: {
      back: '← Back to Home',
      original: 'Original Paper',
      published: 'Published:',
    },
    wiki: {
      noDesc: 'No description yet.',
      editLink: 'Edit →',
    },
    stocks: {
      title: 'Stocks',
      description: 'Real-time market indices, sector heatmaps, economic calendar',
    },
    categories: {
      title: 'All Categories',
      home: 'Home',
      label: 'Categories',
      fields: ' fields',
      subLabel: ' subcategories',
      docCount: '',
      docUnit: ' documents',
    },
    category: {
      home: 'Home',
      noDesc: 'No description yet.',
      editLink: 'Edit →',
      docList: 'Documents',
      empty: 'No documents yet.',
    },
  },
  errors: {
    categoryLoad: 'Failed to load category',
    categoryNotFound: 'Category not found',
    pageLoad: 'Failed to load page',
  },
};

const dictionaries = { ko, en } as const;

export type Dictionary = typeof ko;

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.ko;
}

export const locales: Locale[] = ['ko', 'en'];
export const defaultLocale: Locale = 'ko';

export function isValidLocale(locale: string): locale is Locale {
  return (locales as string[]).includes(locale);
}
