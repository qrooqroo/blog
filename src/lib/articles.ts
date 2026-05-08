import { articles } from '@/data/articles';
import { Article, Category } from '@/types';

export function getAllArticles(): Article[] {
  return [...articles].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getArticlesByCategory(category: Category): Article[] {
  return getAllArticles().filter(a => a.category === category);
}

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find(a => a.slug === slug);
}

export function getFeaturedArticle(): Article {
  return getAllArticles()[0];
}

export function getRecentArticles(count = 9): Article[] {
  return getAllArticles().slice(0, count);
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}
