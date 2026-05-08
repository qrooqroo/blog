/**
 * 매일 Claude API로 카테고리별 최신 뉴스 기사를 자동 생성하고
 * src/data/articles.ts 에 추가합니다.
 *
 * 실행: npx tsx scripts/generate-articles.ts
 */

import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as path from 'path';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const CATEGORIES = ['경제', '정치', '사회', '건강', '스포츠', 'IT', '문화'] as const;
type Category = typeof CATEGORIES[number];

const CATEGORY_SLUGS: Record<Category, string> = {
  '경제': 'economy', '정치': 'politics', '사회': 'society',
  '건강': 'health', '스포츠': 'sports', 'IT': 'it', '문화': 'culture',
};

const IMAGES: Record<Category, string> = {
  '경제': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80&fit=crop',
  '정치': 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&q=80&fit=crop',
  '사회': 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80&fit=crop',
  '건강': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80&fit=crop',
  '스포츠': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80&fit=crop',
  'IT': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80&fit=crop',
  '문화': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80&fit=crop',
};

interface GeneratedArticle {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
}

async function generateArticleForCategory(category: Category, existingSlugs: Set<string>): Promise<GeneratedArticle> {
  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const response = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 2048,
    thinking: { type: 'adaptive' },
    tools: [{ type: 'web_search_20260209', name: 'web_search' }],
    messages: [{
      role: 'user',
      content: `오늘(${today}) 기준으로 한국의 ${category} 분야에서 가장 핫한 최신 뉴스 기사 하나를 작성해주세요.

웹 검색을 통해 실제 최신 이슈를 파악한 뒤, 아래 JSON 형식으로만 응답하세요:

{
  "title": "구체적이고 임팩트 있는 기사 제목 (…포함 가능)",
  "slug": "url-friendly-slug-in-english",
  "excerpt": "기사 요약 1~2문장 (팩트 중심)",
  "content": "<p>첫 번째 단락 (핵심 사실)</p><p>두 번째 단락 (배경/원인)</p><p>세 번째 단락 (전망/의의)</p>"
}

규칙:
- slug는 영문 소문자와 하이픈만 사용, 20자 이내
- content는 HTML p 태그 사용, 각 단락 100~200자
- 팩트에 근거하고, 가상의 사실 없이 작성
- 기존 slug와 중복 불가: ${JSON.stringify([...existingSlugs].slice(-10))}`,
    }],
  });

  // 응답에서 JSON 추출
  let jsonText = '';
  for (const block of response.content) {
    if (block.type === 'text') {
      jsonText += block.text;
    }
  }

  // JSON 파싱 시도
  const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`JSON 파싱 실패: ${jsonText.slice(0, 200)}`);

  const parsed = JSON.parse(jsonMatch[0]) as GeneratedArticle;

  // slug 중복 방지
  let slug = parsed.slug.replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').slice(0, 20);
  if (existingSlugs.has(slug)) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  return { ...parsed, slug };
}

function getCurrentArticles(): { ids: number[]; slugs: Set<string> } {
  const filePath = path.join(process.cwd(), 'src/data/articles.ts');
  const content = fs.readFileSync(filePath, 'utf-8');

  const idMatches = [...content.matchAll(/id:\s*(\d+)/g)];
  const ids = idMatches.map(m => parseInt(m[1]));

  const slugMatches = [...content.matchAll(/slug:\s*['"]([^'"]+)['"]/g)];
  const slugs = new Set(slugMatches.map(m => m[1]));

  return { ids, slugs };
}

function appendArticlesToFile(newArticles: Array<{
  category: Category;
  article: GeneratedArticle;
  id: number;
  date: string;
}>) {
  const filePath = path.join(process.cwd(), 'src/data/articles.ts');
  let content = fs.readFileSync(filePath, 'utf-8');

  // raw 배열의 닫는 괄호 찾기 "];" 직전에 삽입
  const insertPoint = content.lastIndexOf('];');
  if (insertPoint === -1) throw new Error('articles.ts에서 배열 끝을 찾을 수 없습니다.');

  const newEntries = newArticles.map(({ category, article, id, date }) => {
    const escaped = (s: string) => s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\${/g, '\\${');
    return `  { id: ${id}, title: \`${escaped(article.title)}\`, slug: '${article.slug}', category: '${category}', excerpt: \`${escaped(article.excerpt)}\`, content: \`${escaped(article.content)}\`, date: '${date}' },`;
  }).join('\n');

  const updatedContent =
    content.slice(0, insertPoint) +
    '\n' + newEntries + '\n' +
    content.slice(insertPoint);

  fs.writeFileSync(filePath, updatedContent, 'utf-8');
}

async function main() {
  console.log('🚀 기사 자동 생성 시작...\n');

  const { ids, slugs } = getCurrentArticles();
  const maxId = Math.max(0, ...ids);
  const today = new Date().toISOString().split('T')[0];

  const generated: Array<{ category: Category; article: GeneratedArticle; id: number; date: string }> = [];

  for (const category of CATEGORIES) {
    try {
      console.log(`📰 [${category}] 기사 생성 중...`);
      const article = await generateArticleForCategory(category, slugs);
      const id = maxId + generated.length + 1;

      generated.push({ category, article, id, date: today });
      slugs.add(article.slug);

      console.log(`   ✅ "${article.title}" (slug: ${article.slug})`);

      // API 레이트 리밋 방지
      await new Promise(r => setTimeout(r, 2000));
    } catch (err) {
      console.error(`   ❌ [${category}] 생성 실패:`, err);
    }
  }

  if (generated.length === 0) {
    console.log('생성된 기사가 없습니다.');
    process.exit(1);
  }

  console.log(`\n💾 articles.ts에 ${generated.length}개 기사 추가 중...`);
  appendArticlesToFile(generated);

  console.log(`\n✨ 완료! ${generated.length}개 기사가 추가됐습니다.`);
  generated.forEach(({ category, article }) => {
    console.log(`   [${category}] ${article.title}`);
  });
}

main().catch(err => {
  console.error('오류 발생:', err);
  process.exit(1);
});
