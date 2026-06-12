'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface MarketItem {
  price: string;
  ratio: string;
  isUp: boolean;
}

interface MarketData {
  kospi: MarketItem | null;
  kosdaq: MarketItem | null;
  usdkrw: MarketItem | null;
}

type Keyword = '코스피' | '코스닥' | '환율';

function getBadgeText(kw: Keyword, data: MarketData): string {
  const arrow = (item: MarketItem) => (item.isUp ? '▲' : '▼');
  if (kw === '코스피' && data.kospi) return `(${data.kospi.price} ${arrow(data.kospi)}${data.kospi.ratio}%)`;
  if (kw === '코스닥' && data.kosdaq) return `(${data.kosdaq.price} ${arrow(data.kosdaq)}${data.kosdaq.ratio}%)`;
  if (kw === '환율' && data.usdkrw) return `(${data.usdkrw.price}원)`;
  return '';
}

function kwIsUp(kw: Keyword, data: MarketData): boolean {
  if (kw === '코스피') return data.kospi?.isUp ?? true;
  if (kw === '코스닥') return data.kosdaq?.isUp ?? true;
  return data.usdkrw?.isUp ?? true;
}

function processTextNode(node: Text, data: MarketData): void {
  const text = node.textContent ?? '';
  const parent = node.parentNode;
  if (!parent) return;

  const regex = /코스피|코스닥|환율/g;
  const fragment = document.createDocumentFragment();
  let lastIndex = 0;
  let matched = false;

  let m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    const kw = m[0] as Keyword;
    const label = getBadgeText(kw, data);
    if (!label) continue;

    matched = true;

    if (m.index > lastIndex) {
      fragment.appendChild(document.createTextNode(text.slice(lastIndex, m.index)));
    }

    // Keyword span — TreeWalker skips descendants of [data-market-kw] on re-run
    const kwSpan = document.createElement('span');
    kwSpan.dataset.marketKw = kw;
    kwSpan.textContent = kw;
    fragment.appendChild(kwSpan);

    // Badge
    const badge = document.createElement('span');
    badge.dataset.marketBadge = kw;
    badge.className = `market-badge ${kwIsUp(kw, data) ? 'market-badge-up' : 'market-badge-down'}`;
    badge.textContent = label;
    fragment.appendChild(badge);

    lastIndex = m.index + kw.length;
  }

  if (!matched) return;
  if (lastIndex < text.length) {
    fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
  }
  parent.replaceChild(fragment, node);
}

function highlight(data: MarketData): void {
  const main = document.querySelector('main');
  if (!main) return;

  const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT, {
    acceptNode(node: Node) {
      const el = (node as Text).parentElement;
      if (!el) return NodeFilter.FILTER_REJECT;
      const tag = el.tagName;
      if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE'].includes(tag)) {
        return NodeFilter.FILTER_REJECT;
      }
      if (el.closest('[data-market-kw],[data-market-badge],nav,header,footer')) {
        return NodeFilter.FILTER_REJECT;
      }
      return /코스피|코스닥|환율/.test(node.textContent ?? '')
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_SKIP;
    },
  });

  const nodes: Text[] = [];
  let n: Node | null;
  while ((n = walker.nextNode())) nodes.push(n as Text);
  for (const node of nodes) processTextNode(node, data);
}

export default function MarketHighlighter() {
  const pathname = usePathname();
  const [data, setData] = useState<MarketData | null>(null);

  useEffect(() => {
    fetch('/api/market-badge')
      .then(r => r.json() as Promise<MarketData>)
      .then(setData)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!data) return;

    let timer: ReturnType<typeof setTimeout>;

    // Disconnect observer before our own DOM writes, then reconnect
    const observer = new MutationObserver((mutations) => {
      const external = mutations.some(m =>
        Array.from(m.addedNodes).some(n => {
          const el = n as Element;
          return !el.dataset?.marketBadge && !el.dataset?.marketKw;
        })
      );
      if (!external) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        observer.disconnect();
        highlight(data);
        const main = document.querySelector('main');
        if (main) observer.observe(main, { childList: true, subtree: true });
      }, 300);
    });

    // Initial run
    timer = setTimeout(() => {
      observer.disconnect();
      highlight(data);
      const main = document.querySelector('main');
      if (main) observer.observe(main, { childList: true, subtree: true });
    }, 400);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [pathname, data]);

  return null;
}
