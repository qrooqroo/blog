import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import AnalyticsDashboard from './AnalyticsDashboard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '사이트 분석 | AI Insight Note',
  description: '접속 통계, 체류시간, 카테고리별 조회수 분석 대시보드',
  robots: { index: false, follow: false },
};

export default function AnalysisPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-1 h-6 bg-indigo-500 rounded-full" />
          <div>
            <h1 className="text-xl font-black text-slate-800">사이트 분석</h1>
            <p className="text-sm text-slate-400 mt-0.5">접속 통계 · 체류시간 · 카테고리별 조회수</p>
          </div>
          <Link
            href="/analysis/publications"
            className="ml-auto text-sm font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            발행 관리 →
          </Link>
        </div>
        <AnalyticsDashboard />
      </div>
    </div>
  );
}
