'use client';

import { useCallback, useEffect, useState } from 'react';

interface Holiday { date: string; name: string; }

const DOW_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

function fmt(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function CalendarWidget() {
  const today = new Date();
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [cache, setCache] = useState<Record<string, Record<string, string>>>({});

  const year  = cursor.getFullYear();
  const month = cursor.getMonth() + 1; // 1-based
  const cacheKey = `${year}-${month}`;

  const loadHolidays = useCallback((y: number, m: number) => {
    const key = `${y}-${m}`;
    if (cache[key]) return;
    fetch(`/api/holidays?year=${y}&month=${m}`)
      .then(r => r.json())
      .then((items: Holiday[]) => {
        const map: Record<string, string> = {};
        items.forEach(h => { map[h.date] = h.name; });
        setCache(prev => ({ ...prev, [key]: map }));
      })
      .catch(() => {});
  }, [cache]);

  useEffect(() => { loadHolidays(year, month); }, [year, month, loadHolidays]);

  const holidays = cache[cacheKey] ?? {};
  const firstDow = new Date(year, month - 1, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month, 0).getDate();

  // 빈 칸 + 날짜 배열 (null = 빈 칸)
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // 7의 배수로 맞추기
  while (cells.length % 7 !== 0) cells.push(null);

  const prev = () => setCursor(new Date(year, month - 2, 1));
  const next = () => setCursor(new Date(year, month, 1));

  return (
    <div className="flex-1 bg-white rounded-xl border border-slate-200 p-4 flex flex-col">
      {/* 월 네비게이션 */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prev}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors text-sm"
        >
          ‹
        </button>
        <span className="text-sm font-bold text-slate-800">
          {year}년 {month}월
        </span>
        <button
          onClick={next}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors text-sm"
        >
          ›
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 mb-1">
        {DOW_LABELS.map((d, i) => (
          <div key={d} className={`text-center text-xs font-bold pb-1 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-slate-400'}`}>
            {d}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 flex-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={i} />;

          const dateStr  = fmt(year, month, day);
          const holiday  = holidays[dateStr];
          const dow      = (firstDow + day - 1) % 7;
          const isToday  = today.getFullYear() === year && today.getMonth() === month - 1 && today.getDate() === day;
          const isRed    = dow === 0 || !!holiday;
          const isSat    = dow === 6;

          const numColor = isToday
            ? 'text-white'
            : isRed ? 'text-red-500'
            : isSat ? 'text-blue-500'
            : 'text-slate-700';

          return (
            <div key={i} className="flex flex-col items-center py-0.5">
              <span
                className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full leading-none ${numColor} ${isToday ? 'bg-indigo-600' : ''}`}
              >
                {day}
              </span>
              {holiday && (
                <span className="text-[10px] text-red-400 leading-tight text-center break-keep w-full px-0.5 mt-0.5">
                  {holiday}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
