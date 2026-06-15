import { getArticleBySlug, getRelatedArticles, getDraftArticles, formatDate } from '@/lib/articles';
import { getNewsBySlug, getRelatedNews } from '@/lib/news';
import { supabase, sql } from '@/lib/supabase';
import ArticleCard from '@/components/ArticleCard';
import PublishButton from '@/components/PublishButton';
import SearchBar from '@/components/SearchBar';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import AdUnit from '@/components/AdUnit';
import { parseTitleParts, resolveDisplayKo } from '@/lib/title-parser';
import { headers } from 'next/headers';
import PageTracker from '@/components/PageTracker';
import { cache } from 'react';

export const revalidate = 3600;

interface CategoryInfo {
  id: number;
  name: string;
  slug: string;
  parent?: { id: number; name: string; slug: string } | null;
}

const getCategoryInfo = cache(async (name: string): Promise<CategoryInfo | null> => {
  try {
    type Row = { id: number; name: string; slug: string; parent_id: number | null; parent_name: string | null; parent_slug: string | null };
    const [row] = await sql<Row[]>`
      SELECT c.id, c.name, c.slug, c.parent_id,
             p.name AS parent_name, p.slug AS parent_slug
      FROM categories c
      LEFT JOIN categories p ON p.id = c.parent_id
      WHERE c.name = ${name}
      LIMIT 1
    `;
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      parent: row.parent_id ? { id: row.parent_id, name: row.parent_name!, slug: row.parent_slug! } : null,
    };
  } catch {
    const { data } = await supabase.from('categories').select('id, name, slug, parent_id').eq('name', name).single();
    if (!data) return null;
    if (!data.parent_id) return { id: data.id, name: data.name, slug: data.slug, parent: null };
    const { data: parent } = await supabase.from('categories').select('id, name, slug').eq('id', data.parent_id).single();
    return { id: data.id, name: data.name, slug: data.slug, parent: parent ?? null };
  }
});

interface Props {
  params: Promise<{ slug: string }>;
}

async function findArticle(slug: string) {
  return (await getArticleBySlug(slug)) ?? (await getNewsBySlug(slug));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const article = await findArticle(slug);
  if (!article) return {};

  const headersList = await headers();
  const locale = headersList.get('x-locale') ?? 'ko';
  const isEn = locale === 'en';

  const categoryInfo = await getCategoryInfo(article.category);
  const parentName = categoryInfo?.parent?.name;

  const titleKo = article.title_ko || article.title;
  const titleEnVal = article.title_en ?? titleKo;

  // locale에 따라 표시 제목·설명 분기
  const displayTitle = isEn ? titleEnVal : titleKo;
  const categoryBreadcrumb = parentName
    ? `${parentName} > ${article.category}`
    : article.category;
  const pageTitle = `${displayTitle} - ${categoryBreadcrumb} | AI Insight Note`;

  const rawExcerpt = isEn
    ? (article.excerpt_en ?? article.excerpt ?? '').trim()
    : (article.excerpt ?? '').trim();
  const autoDesc = isEn
    ? `A wiki article on ${titleEnVal}. Learn the concepts and principles of ${article.category}${parentName ? ` · ${parentName}` : ''}.`
    : `${titleKo}의 개념과 원리를 정리한 위키 문서입니다. ${article.category}${parentName ? ` · ${parentName}` : ''} 분야의 핵심 내용을 학습하세요.`;
  const description = rawExcerpt.length > 20
    ? rawExcerpt.slice(0, 155) + (rawExcerpt.length > 155 ? '…' : '')
    : autoDesc;

  const keywords = [titleKo, titleEnVal, article.category, parentName, 'AI Insight Note', 'wiki']
    .filter(Boolean).join(', ');

  const canonical = `https://www.aiinsightnote.com/wiki/${slug}`;
  const imageUrl = article.image
    ? (article.image.startsWith('http') ? article.image : `https://www.aiinsightnote.com${article.image}`)
    : 'https://www.aiinsightnote.com/og-default.jpg';

  return {
    title: pageTitle,
    description,
    keywords,
    alternates: { canonical },
    openGraph: {
      title: pageTitle,
      description,
      url: canonical,
      siteName: 'AI Insight Note',
      images: [{ url: imageUrl, width: 800, height: 400, alt: displayTitle }],
      type: 'article' as const,
      locale: isEn ? 'en_US' : 'ko_KR',
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: pageTitle,
      description,
      images: [imageUrl],
    },
  };
}

const CATEGORY_COLORS: Record<string, string> = {
  '경제': 'bg-blue-50 text-blue-700',
  '정치': 'bg-red-50 text-red-700',
  '사회': 'bg-green-50 text-green-700',
  '건강': 'bg-teal-50 text-teal-700',
  '스포츠': 'bg-orange-50 text-orange-700',
  'IT': 'bg-violet-50 text-violet-700',
  '문화': 'bg-pink-50 text-pink-700',
  'AI 대화': 'bg-indigo-50 text-indigo-700',
  '논문 분석': 'bg-purple-50 text-purple-700',
  '스타트업 AI 적용': 'bg-cyan-50 text-cyan-700',
};

export default async function WikiPage({ params }: Props) {
  const { slug } = await params;
  const headersList = await headers();
  const host = headersList.get('host') ?? '';
  const isLocal = host.startsWith('localhost') || host.startsWith('127.0.0.1');
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const locale = headersList.get('x-locale') ?? cookieStore.get('NEXT_LOCALE')?.value ?? 'ko';
  const isEn = locale === 'en';

  // ── 초안 목록 페이지 (localhost 전용) ──
  if (slug === 'drafts') {
    if (!isLocal) notFound();
    const drafts = await getDraftArticles();
    return (
      <div className="space-y-6">
        <SearchBar />
        <div className="flex items-center gap-2.5">
          <span className="w-1 h-5 bg-amber-500 rounded-full" />
          <h2 className="text-base font-black text-slate-800">초안 문서</h2>
          <span className="text-sm text-slate-400">{drafts.length}개</span>
          <span className="ml-auto text-xs bg-amber-50 border border-amber-200 text-amber-600 px-2 py-0.5 rounded-full">
            localhost 전용
          </span>
        </div>
        {drafts.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <p className="text-slate-400 text-sm">초안 문서가 없습니다.</p>
            <Link href="/editor" className="inline-flex items-center gap-1.5 text-sm text-indigo-500 hover:text-indigo-700 transition-colors">
              ✍️ 새 문서 작성하기 →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {drafts.map(a => (
              <div key={a.id} className="relative group">
                <ArticleCard article={a} />
                <div className="absolute inset-x-3 bottom-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  <PublishButton id={a.id} slug={a.slug} />
                  <Link
                    href={`/editor/${a.id}`}
                    className="flex-1 py-1.5 text-xs font-bold rounded-lg shadow text-center bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                    onClick={e => e.stopPropagation()}
                  >
                    ✏️ 편집
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // findArticle을 먼저 단독 실행 — 콜드 스타트 시 커넥션 경합으로 인한 간헐적 404 방지
  const article = await findArticle(slug);
  if (!article) notFound();
  if (article.is_internal && !isLocal) notFound();

  const [categoryInfo, relatedDocs, relatedNews] = await Promise.all([
    getCategoryInfo(article.category),
    getRelatedArticles(article.category, article.slug, 3),
    getRelatedNews(article.category, article.slug, 3),
  ]);

  const related = [...relatedDocs, ...relatedNews].slice(0, 3);
  const tagColor = CATEGORY_COLORS[article.category] ?? 'bg-slate-100 text-slate-600';

  const canonical = `https://www.aiinsightnote.com/wiki/${slug}`;
  const imageUrl = article.image
    ? (article.image.startsWith('http') ? article.image : `https://www.aiinsightnote.com${article.image}`)
    : undefined;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title_ko ?? article.title,
    alternativeHeadline: article.title_en,
    description: (article.excerpt ?? '').trim().slice(0, 160) || article.title,
    datePublished: article.date,
    dateModified: article.date,
    url: canonical,
    ...(imageUrl ? { image: [imageUrl] } : {}),
    author: {
      '@type': 'Organization',
      name: 'AI Insight Note',
      url: 'https://www.aiinsightnote.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'AI Insight Note',
      url: 'https://www.aiinsightnote.com',
    },
    articleSection: article.category,
    inLanguage: 'ko',
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
  };

  return (
    <div className="max-w-3xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageTracker slug={slug} />
      {/* 브레드크럼 */}
      <nav className="flex items-center gap-1.5 text-sm text-slate-400 mb-6 flex-wrap">
        <Link href="/" className="hover:text-indigo-500 transition-colors">홈</Link>
        <span>›</span>
        {categoryInfo?.parent && (
          <>
            <Link href={`/category/${categoryInfo.parent.slug}`} className="hover:text-indigo-500 transition-colors">
              {categoryInfo.parent.name}
            </Link>
            <span>›</span>
          </>
        )}
        {categoryInfo?.slug ? (
          <Link href={`/category/${categoryInfo.slug}`} className="hover:text-indigo-500 transition-colors">
            {article.category}
          </Link>
        ) : (
          <span>{article.category}</span>
        )}
        <span>›</span>
        <span className="text-slate-600 truncate">{article.title}</span>
      </nav>

      {/* 기사 */}
      <article className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={article.image} alt={article.title} className="w-full h-64 object-cover" />

        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between gap-2.5 mb-4">
            <div className="flex items-center gap-2.5">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tagColor}`}>
                {article.category}
              </span>
              <time className="text-sm text-slate-400">{formatDate(article.date)}</time>
            </div>
            {isLocal && (
              <Link
                href={`/wiki/${article.slug}/edit`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                편집
              </Link>
            )}
          </div>

          {(() => {
            // 영문 locale이고 영문 콘텐츠가 있으면 영문 제목 표시
            if (isEn && article.title_en) {
              return (
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight mb-5">
                  {article.title_en}
                  <span className="block text-base font-medium text-slate-400 mt-1">
                    {article.title_ko ?? article.title}
                  </span>
                </h1>
              );
            }
            const parts = article.title_ko && article.title_en
              ? { ko: article.title_ko, en: article.title_en }
              : parseTitleParts(article.title);
            const displayKo = resolveDisplayKo(article.title, parts.ko);
            return (
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight mb-5 flex items-baseline gap-2 flex-wrap">
                {displayKo}
                {parts.en && (
                  <span className="text-base md:text-lg font-medium text-slate-400">
                    {parts.en}
                  </span>
                )}
              </h1>
            );
          })()}

          {(() => {
            const linkLines = (article.excerpt ?? '').split('\n').map(l => l.trim()).filter(l => /^https?:\/\/.+/.test(l));
            if (!linkLines.length) return null;
            return (
              <div className="mb-8 rounded-xl border border-slate-200 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-200">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-400">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                  </svg>
                  <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
                    {isEn ? 'References' : '참고 링크'}
                  </span>
                </div>
                <div className="divide-y divide-slate-100">
                  {linkLines.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 transition-colors group">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-300 flex-shrink-0 group-hover:text-indigo-400 transition-colors">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15 3 21 3 21 9"/>
                        <line x1="10" y1="14" x2="21" y2="3"/>
                      </svg>
                      <span className="text-sm text-indigo-600 group-hover:text-indigo-800 truncate transition-colors">
                        {url}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* 영문 콘텐츠: locale=en이고 content_en이 있으면 영문 표시, 없으면 한국어 */}
          {isEn && article.content_en ? (
            <MarkdownRenderer className="prose text-slate-700 text-[0.95rem]">
              {article.content_en.replace(/^\s*#{1,6}[^\n]*\n?/, '')}
            </MarkdownRenderer>
          ) : article.markdown_content ? (
            <MarkdownRenderer className="prose text-slate-700 text-[0.95rem]">
              {article.markdown_content.replace(/^\s*#{1,6}[^\n]*\n?/, '')}
            </MarkdownRenderer>
          ) : (
            <div className="prose text-slate-700 text-[0.95rem] leading-8"
              dangerouslySetInnerHTML={{ __html: article.content }} />
          )}

          <AdUnit slot="6963385825" className="mt-6" />
        </div>
      </article>

      {/* 관련 노트 */}
      {related.length > 0 && (
        <section className="mt-10">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="w-1 h-5 bg-indigo-500 rounded-full" />
            <h2 className="text-base font-black text-slate-800">관련 노트</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {related.map(a => (
              <ArticleCard key={a.id} article={a} size="small" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
