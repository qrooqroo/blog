/** 카테고리 기본 이미지 or 스크립트 placeholder 이미지 → 로컬에서만 표시 */
const DEFAULT_IMAGE_URLS = new Set([
  // publish/route.ts DEFAULT_IMAGES
  'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80&fit=crop',
  'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80&fit=crop',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80&fit=crop',
  'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80&fit=crop',
  'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&q=80&fit=crop',
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80&fit=crop',
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80&fit=crop',
  'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80&fit=crop',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80&fit=crop',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80&fit=crop',
]);

export function isDefaultImage(url: string | null | undefined): boolean {
  if (!url) return true;
  return DEFAULT_IMAGE_URLS.has(url);
}

export function isLocalHost(host: string): boolean {
  return host.startsWith('localhost') || host.startsWith('127.0.0.1');
}
