import type { Metadata } from 'next';
import ClientLoader from './ClientLoader';

export const metadata: Metadata = {
  title: '천체 시뮬레이터 | AI Insight Note',
  description: '태양계 자전·공전 물리 시뮬레이션',
};

export default function SolarPage() {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 50 }}>
      <ClientLoader />
    </div>
  );
}
