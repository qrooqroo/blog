'use client';
import { useEffect, useState, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend,
} from 'recharts';

interface Stats {
  summary: { total: number; humans: number; bots: number; avg_duration: number; unique_ips: number };
  topDocs: { slug: string; title: string; views: number; avg_sec: number }[];
  catStats: { category: string; cat_slug: string; views: number }[];
  referrers: { referrer: string; visits: number }[];
  dailyTrend: { day: string; humans: number; bots: number }[];
  recentViews: { slug: string; title: string; ip: string; referrer: string; duration: number; user_agent: string; created_at: string }[];
  days: number;
}

const PIE_COLORS = ['#6366f1', '#e5e7eb'];
const CAT_COLORS = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444','#14b8a6','#f97316','#84cc16','#a78bfa','#fb7185','#34d399','#60a5fa','#fbbf24'];

function fmt(sec: number | null) {
  if (!sec || sec <= 0) return '-';
  if (sec < 60) return `${sec}s`;
  return `${Math.floor(sec / 60)}m ${sec % 60}s`;
}

function shortUA(ua: string) {
  if (!ua) return '-';
  if (/Chrome/i.test(ua) && !/Edge|Edg/i.test(ua)) return 'Chrome';
  if (/Firefox/i.test(ua)) return 'Firefox';
  if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) return 'Safari';
  if (/Edge|Edg/i.test(ua)) return 'Edge';
  if (/curl/i.test(ua)) return 'curl';
  return ua.slice(0, 30) + '…';
}

function shortRef(ref: string) {
  if (!ref || ref === '(직접 접속)') return '직접 접속';
  try {
    const u = new URL(ref);
    return u.hostname.replace(/^www\./, '');
  } catch {
    return ref.slice(0, 30);
  }
}

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (d: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics/stats?days=${d}`);
      const data = await res.json();
      setStats(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(days); }, [days, load]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-64 text-slate-400 text-sm">
      통계 불러오는 중…
    </div>
  );
  if (!stats) return null;

  const { summary, topDocs, catStats, referrers, dailyTrend, recentViews } = stats;
  const pieData = [
    { name: '사람', value: Number(summary.humans) },
    { name: '봇', value: Number(summary.bots) },
  ];
  const botPct = summary.total > 0 ? Math.round(Number(summary.bots) / Number(summary.total) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* 기간 선택 */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-500">기간:</span>
        {[7, 14, 30, 90].map(d => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              days === d ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {d}일
          </button>
        ))}
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { label: '전체 조회', value: Number(summary.total).toLocaleString(), color: 'text-slate-800' },
          { label: '사람 조회', value: Number(summary.humans).toLocaleString(), color: 'text-indigo-600' },
          { label: '봇 조회', value: `${Number(summary.bots).toLocaleString()} (${botPct}%)`, color: 'text-rose-500' },
          { label: '평균 체류시간', value: fmt(summary.avg_duration), color: 'text-emerald-600' },
          { label: '고유 IP', value: Number(summary.unique_ips).toLocaleString(), color: 'text-amber-600' },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
            <p className="text-xs text-slate-400 mb-1">{c.label}</p>
            <p className={`text-xl font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 사람 vs 봇 파이 */}
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">사람 vs 봇</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => v.toLocaleString()} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 카테고리별 그래프 */}
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">카테고리별 조회수</h3>
          {catStats.length === 0 ? (
            <p className="text-slate-400 text-sm">데이터 없음</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={catStats} layout="vertical" margin={{ left: 8, right: 24 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="category" width={100} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => `${v.toLocaleString()}회`} />
                <Bar dataKey="views" radius={[0, 4, 4, 0]}>
                  {catStats.map((_, i) => <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 일별 트렌드 */}
      <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">일별 트렌드</h3>
        {dailyTrend.length === 0 ? (
          <p className="text-slate-400 text-sm">데이터 없음</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dailyTrend} margin={{ right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="humans" name="사람" stroke="#6366f1" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="bots" name="봇" stroke="#e2e8f0" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 상위 문서 */}
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">상위 문서 (체류시간 포함)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100">
                  <th className="text-left pb-2 font-medium">#</th>
                  <th className="text-left pb-2 font-medium">문서</th>
                  <th className="text-right pb-2 font-medium">조회</th>
                  <th className="text-right pb-2 font-medium">평균 체류</th>
                </tr>
              </thead>
              <tbody>
                {topDocs.map((d, i) => (
                  <tr key={d.slug} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="py-1.5 text-slate-400">{i + 1}</td>
                    <td className="py-1.5 max-w-[160px]">
                      <a href={`/wiki/${d.slug}`} className="text-indigo-600 hover:underline truncate block" target="_blank">
                        {d.title || d.slug}
                      </a>
                    </td>
                    <td className="py-1.5 text-right font-medium">{Number(d.views).toLocaleString()}</td>
                    <td className="py-1.5 text-right text-slate-500">{fmt(d.avg_sec)}</td>
                  </tr>
                ))}
                {topDocs.length === 0 && (
                  <tr><td colSpan={4} className="py-4 text-center text-slate-400">데이터 없음</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 접속 경로 */}
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">접속 경로 (Referrer)</h3>
          {referrers.length === 0 ? (
            <p className="text-slate-400 text-sm">데이터 없음</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={referrers.slice(0, 10)} layout="vertical" margin={{ left: 8, right: 32 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="referrer" width={110} tick={{ fontSize: 11 }}
                  tickFormatter={shortRef} />
                <Tooltip formatter={(v: number) => `${v.toLocaleString()}회`} labelFormatter={shortRef} />
                <Bar dataKey="visits" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 최근 접속 로그 */}
      <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">최근 접속 (사람만)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-100">
                <th className="text-left pb-2 font-medium">시간</th>
                <th className="text-left pb-2 font-medium">문서</th>
                <th className="text-left pb-2 font-medium">IP</th>
                <th className="text-left pb-2 font-medium">경로</th>
                <th className="text-right pb-2 font-medium">체류</th>
                <th className="text-left pb-2 font-medium">브라우저</th>
              </tr>
            </thead>
            <tbody>
              {recentViews.map((v, i) => (
                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="py-1.5 text-slate-400 whitespace-nowrap">
                    {new Date(v.created_at).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-1.5 max-w-[140px]">
                    <a href={`/wiki/${v.slug}`} className="text-indigo-600 hover:underline truncate block" target="_blank">
                      {v.title || v.slug}
                    </a>
                  </td>
                  <td className="py-1.5 text-slate-500 font-mono">{v.ip}</td>
                  <td className="py-1.5 text-slate-500 max-w-[100px] truncate">{shortRef(v.referrer)}</td>
                  <td className="py-1.5 text-right">{fmt(v.duration)}</td>
                  <td className="py-1.5 text-slate-500">{shortUA(v.user_agent)}</td>
                </tr>
              ))}
              {recentViews.length === 0 && (
                <tr><td colSpan={6} className="py-4 text-center text-slate-400">데이터 없음</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
