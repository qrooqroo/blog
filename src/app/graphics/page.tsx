import type { Metadata } from 'next';
import ClientLoader from './ClientLoader';

export const metadata: Metadata = {
  title: 'Graphics | AI Insight Note',
  description: '물리 엔진 기반 3D 인터랙티브 시뮬레이션',
};

export default function GraphicsPage() {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 50 }}>
      <ClientLoader />
    </div>
  );
}
