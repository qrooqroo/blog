import StocksDashboard from './StocksDashboard';

export const metadata = {
  title: '증권·주식 | AI Insight Note',
  description: '실시간 주가 지수, 시장 현황, 섹터 히트맵, 경제 캘린더',
};

export default function StocksPage() {
  return <StocksDashboard />;
}
