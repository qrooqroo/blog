'use client';

import { useEffect, useId, useRef, useState } from 'react';

// ── mermaid 다이어그램 타입 감지 ───────────────────────────
const MERMAID_KEYWORD = /^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|journey|gantt|pie|gitGraph|mindmap|timeline|quadrantChart|xychart|block|packet|kanban|architecture)\b/i;

function isMermaidSyntax(text: string): boolean {
  return MERMAID_KEYWORD.test(text.trim());
}

// ── ASCII 트리 → mermaid graph TD 변환 ────────────────────
// 지원 형식:
//   Root
//     ├── Child1    // 주석은 제거
//     │     └── GrandChild
//     └── Child2
function asciiTreeToMermaid(text: string): string {
  const lines = text.split('\n');

  // 1) 브랜치 문자(├ └)의 열 위치를 수집 → 깊이 순서 확정
  const posSet = new Set<number>();
  for (const line of lines) {
    const idx = line.search(/[├└]/);
    if (idx !== -1) posSet.add(idx);
  }
  const sortedPos = [...posSet].sort((a, b) => a - b);

  const getDepth = (branchIdx: number): number => {
    // 정확한 위치 또는 ±2 범위 내 가장 가까운 레벨
    for (let i = 0; i < sortedPos.length; i++) {
      if (Math.abs(sortedPos[i] - branchIdx) <= 2) return i + 1;
    }
    return sortedPos.length + 1;
  };

  // 2) 각 라인 파싱
  const nodes: Array<{ depth: number; label: string; id: string; star: boolean }> = [];
  let counter = 0;

  for (const line of lines) {
    // 구분선 (│, 공백, ─ 만으로 이뤄진 라인) 스킵
    if (!line.trim() || /^[\s│─]+$/.test(line)) continue;

    // 주석 제거
    const clean = line.replace(/\s*\/\/.*$/, '').trimEnd();
    if (!clean.trim()) continue;

    const branchIdx = clean.search(/[├└]/);
    let depth: number;
    let rawLabel: string;

    if (branchIdx < 0) {
      // 루트 노드
      depth = 0;
      rawLabel = clean.trim();
    } else {
      depth = getDepth(branchIdx);
      rawLabel = clean.slice(branchIdx).replace(/^[├└]─+\s*/, '').trim();
    }

    if (!rawLabel) continue;

    const star  = rawLabel.includes('★');
    const label = rawLabel.replace(/★\s*/g, '').trim();
    if (label) nodes.push({ depth, label, id: `N${counter++}`, star });
  }

  if (!nodes.length) return text; // 파싱 실패 시 원문 반환

  // 3) mermaid graph TD 생성
  const out: string[] = ['graph TD'];
  const stack: Array<{ depth: number; id: string }> = [];
  const starIds: string[] = [];

  for (const { depth, label, id, star } of nodes) {
    // mermaid HTML 라벨에서 특수문자 이스케이프
    const lbl = label
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, "'");

    // 부모 탐색
    while (stack.length && stack[stack.length - 1].depth >= depth) {
      stack.pop();
    }

    if (star) starIds.push(id);

    if (!stack.length) {
      out.push(`    ${id}["${lbl}"]`);
    } else {
      out.push(`    ${stack[stack.length - 1].id} --> ${id}["${lbl}"]`);
    }

    stack.push({ depth, id });
  }

  // ★ 노드 강조 (indigo)
  for (const id of starIds) {
    out.push(`    style ${id} fill:#6366f1,color:#fff,stroke:#4338ca`);
  }

  return out.join('\n');
}

// ── MermaidBlock 컴포넌트 ──────────────────────────────────
interface Props {
  chart: string;
}

export default function MermaidBlock({ chart }: Props) {
  const uid  = useId().replace(/:/g, '');
  const ref  = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    // mermaid 문법이면 그대로, ASCII 트리면 변환
    const diagram = isMermaidSyntax(chart.trim())
      ? chart.trim()
      : asciiTreeToMermaid(chart.trim());

    import('mermaid').then(({ default: mermaid }) => {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'base',
        themeVariables: {
          primaryColor:        '#eef2ff',
          primaryTextColor:    '#1e293b',
          primaryBorderColor:  '#6366f1',
          lineColor:           '#6366f1',
          secondaryColor:      '#f5f3ff',
          tertiaryColor:       '#f8fafc',
          edgeLabelBackground: '#ffffff',
          fontFamily:          'ui-sans-serif, system-ui, sans-serif',
          fontSize:            '14px',
        },
      });

      mermaid.render(`m-${uid}`, diagram)
        .then(({ svg }) => {
          if (!cancelled && ref.current) {
            ref.current.innerHTML = svg;
            setError(null);
          }
        })
        .catch((e: unknown) => {
          if (!cancelled) setError(String(e));
        });
    });

    return () => { cancelled = true; };
  }, [chart, uid]);

  if (error) {
    return (
      <div style={{ margin: '1em 0', padding: '1em', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', fontSize: '0.82rem', color: '#dc2626', fontFamily: 'monospace' }}>
        Mermaid 오류: {error}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      style={{ margin: '1.2em 0', display: 'flex', justifyContent: 'center', overflowX: 'auto' }}
    />
  );
}
