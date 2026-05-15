'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import type { Components } from 'react-markdown';

const MermaidBlock = dynamic(() => import('./MermaidBlock'), { ssr: false });

// ── 인라인 스타일 상수 ─────────────────────────────────────
// CSS @layer 버그를 우회: 인라인 스타일은 레이어 우선순위와 무관하게 항상 적용
const INDIGO = '#6366f1';
const TEXT   = '#334155';

const S = {
  h1:     { fontSize: '1.5rem',  fontWeight: 900, color: '#0f172a', margin: '1.5em 0 0.4em',  display: 'block' } as React.CSSProperties,
  h2:     { fontSize: '1.2rem',  fontWeight: 800, color: '#1e293b', margin: '1.4em 0 0.4em',  display: 'block', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.3em' } as React.CSSProperties,
  h3:     { fontSize: '1rem',    fontWeight: 700, color: '#334155', margin: '1.2em 0 0.3em',  display: 'block' } as React.CSSProperties,
  h456:   { fontSize: '0.95rem', fontWeight: 700, color: '#475569', margin: '1em 0 0.25em',   display: 'block' } as React.CSSProperties,
  a:      { color: INDIGO, textDecoration: 'underline' } as React.CSSProperties,
  ol:     { listStyle: 'none', paddingLeft: 0, margin: '0.75em 0' } as React.CSSProperties,
  ul:     { listStyle: 'none', paddingLeft: 0, margin: '0.75em 0' } as React.CSSProperties,
  liOl:   { position: 'relative', paddingLeft: '1.8em', marginBottom: '2px', lineHeight: 1.7, fontSize: '0.95rem', color: TEXT, listStyle: 'none' } as React.CSSProperties,
  liUl:   { position: 'relative', paddingLeft: '1.4em', marginBottom: '2px', lineHeight: 1.7, fontSize: '0.95rem', color: TEXT, listStyle: 'none' } as React.CSSProperties,
  num:    { position: 'absolute', left: 0,       color: INDIGO, fontWeight: 700 } as React.CSSProperties,
  bullet: { position: 'absolute', left: '0.4em', color: INDIGO, fontWeight: 700 } as React.CSSProperties,
};

// ── 리스트 컴포넌트 ────────────────────────────────────────
// react-markdown이 li를 기본 <li> 엘리먼트로 렌더링하므로
// child.props.children로 내용을 꺼내 직접 번호/불릿과 함께 렌더링

type REl = React.ReactElement<{ children?: React.ReactNode }>;

function OlList({ children, start = 1 }: { children?: React.ReactNode; start?: number }) {
  const items = React.Children.toArray(children).filter(React.isValidElement) as REl[];
  return (
    <ol style={S.ol}>
      {items.map((child, i) => (
        <li key={i} style={S.liOl}>
          <span style={S.num}>{start + i}.</span>
          {child.props.children}
        </li>
      ))}
    </ol>
  );
}

function UlList({ children }: { children?: React.ReactNode }) {
  const items = React.Children.toArray(children).filter(React.isValidElement) as REl[];
  return (
    <ul style={S.ul}>
      {items.map((child, i) => (
        <li key={i} style={S.liUl}>
          <span style={S.bullet}>•</span>
          {child.props.children}
        </li>
      ))}
    </ul>
  );
}

// ── 코드블록 스타일 ────────────────────────────────────────
const codeBlockWrap: React.CSSProperties = {
  margin: '0.8em 0', borderRadius: '8px', overflow: 'hidden', border: '1px solid #3d3d3d',
};
const codeLangBar: React.CSSProperties = {
  background: '#2d2d2d', padding: '5px 14px',
  fontSize: '0.72rem', color: '#858585', fontFamily: 'ui-monospace,monospace',
};
const codePre: React.CSSProperties = {
  background: '#1e1e1e', color: '#d4d4d4', padding: '1em 1.2em', margin: 0,
  overflowX: 'auto', fontSize: '0.82rem', lineHeight: 1.6,
  fontFamily: 'ui-monospace,SFMono-Regular,Menlo,monospace',
};
const codeInline: React.CSSProperties = {
  background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px',
  fontSize: '0.82rem', fontFamily: 'ui-monospace,monospace', color: INDIGO,
};

// ── 헤딩 id 생성 (목차 앵커 링크용) ──────────────────────────
function toHeadingId(children: React.ReactNode): string {
  const text = React.Children.toArray(children)
    .map(child => (typeof child === 'string' ? child : ''))
    .join('');
  return text.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w가-힣ㄱ-ㅎㅏ-ㅣ-]/g, '');
}

// ── components 맵 ─────────────────────────────────────────
const components: Components = {
  h1:  ({ children }) => <h1  id={toHeadingId(children)} style={S.h1}>{children}</h1>,
  h2:  ({ children }) => <h2  id={toHeadingId(children)} style={S.h2}>{children}</h2>,
  h3:  ({ children }) => <h3  id={toHeadingId(children)} style={S.h3}>{children}</h3>,
  h4:  ({ children }) => <h4  id={toHeadingId(children)} style={S.h456}>{children}</h4>,
  h5:  ({ children }) => <h5  style={S.h456}>{children}</h5>,
  h6:  ({ children }) => <h6  style={S.h456}>{children}</h6>,
  a:   ({ href, children }) => {
    if (href?.startsWith('#')) {
      const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        const id = decodeURIComponent(href.slice(1));
        const target = document.getElementById(id);
        if (target) {
          const y = target.getBoundingClientRect().top + window.scrollY - 16;
          if ('scrollBehavior' in document.documentElement.style) {
            window.scrollTo({ top: y, behavior: 'smooth' });
          } else {
            window.scrollTo(0, y);
          }
        }
      };
      return <a href={href} style={S.a} onClick={handleClick}>{children}</a>;
    }
    return <a href={href} style={S.a}>{children}</a>;
  },
  ol:  ({ children, start }) => <OlList start={start ?? 1}>{children}</OlList>,
  ul:  ({ children }) => <UlList>{children}</UlList>,
  // pre는 code 컴포넌트에서 직접 감싸므로 투명하게 pass-through
  pre: ({ children }) => <>{children}</>,
  code: ({ className, children }) => {
    const lang = /language-(\w+)/.exec(className || '')?.[1];
    const content = String(children).replace(/\n$/, '');

    // mermaid 다이어그램
    if (lang === 'mermaid') {
      return <MermaidBlock chart={content} />;
    }

    // 펜스드 코드블록 (언어 지정 or 멀티라인)
    if (lang || content.includes('\n')) {
      return (
        <div style={codeBlockWrap}>
          {lang && <div style={codeLangBar}>{lang}</div>}
          <pre style={codePre}>
            <code style={{ background: 'none', padding: 0, color: 'inherit', fontSize: 'inherit', fontFamily: 'inherit' }}>
              {content}
            </code>
          </pre>
        </div>
      );
    }

    // 인라인 코드
    return <code style={codeInline}>{children}</code>;
  },
};

// ── MarkdownRenderer ───────────────────────────────────────
interface Props {
  children: string;
  className?: string;
}

// CommonMark는 # 뒤에 공백 필수 — 기존 mdToHtml은 공백 없이도 허용했으므로
// 저장된 콘텐츠 호환을 위해 공백이 없는 경우 자동으로 추가
function normalizeHeadings(md: string): string {
  return md.replace(/^(#{1,6})([^ #\n\r])/gm, '$1 $2');
}

export default function MarkdownRenderer({ children, className }: Props) {
  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={components}>
        {normalizeHeadings(children)}
      </ReactMarkdown>
    </div>
  );
}
