'use client';

import { useEffect, useState } from 'react';

const WMO: Record<number, { label: string; icon: string }> = {
  0:  { label: '맑음',        icon: '☀️' },
  1:  { label: '대체로 맑음',  icon: '🌤️' },
  2:  { label: '구름 조금',    icon: '⛅' },
  3:  { label: '흐림',        icon: '☁️' },
  45: { label: '안개',        icon: '🌫️' },
  48: { label: '안개',        icon: '🌫️' },
  51: { label: '이슬비',      icon: '🌦️' },
  53: { label: '이슬비',      icon: '🌦️' },
  55: { label: '이슬비',      icon: '🌦️' },
  61: { label: '비',          icon: '🌧️' },
  63: { label: '비',          icon: '🌧️' },
  65: { label: '강한 비',     icon: '🌧️' },
  71: { label: '눈',          icon: '🌨️' },
  73: { label: '눈',          icon: '🌨️' },
  75: { label: '강한 눈',     icon: '❄️' },
  77: { label: '싸락눈',      icon: '🌨️' },
  80: { label: '소나기',      icon: '🌦️' },
  81: { label: '소나기',      icon: '🌦️' },
  82: { label: '강한 소나기', icon: '⛈️' },
  85: { label: '눈 소나기',   icon: '🌨️' },
  86: { label: '눈 소나기',   icon: '🌨️' },
  95: { label: '뇌우',        icon: '⛈️' },
  99: { label: '뇌우·우박',   icon: '⛈️' },
};

function wmo(code: number) {
  return WMO[code] ?? { label: '—', icon: '🌡️' };
}

// 한국 환경부 기준
function pm10Grade(v: number) {
  if (v <= 30)  return { label: '좋음',    color: '#4C8EDA' };
  if (v <= 80)  return { label: '보통',    color: '#4CAF50' };
  if (v <= 150) return { label: '나쁨',    color: '#F5A623' };
  return              { label: '매우나쁨', color: '#E03030' };
}

function pm25Grade(v: number) {
  if (v <= 15)  return { label: '좋음',    color: '#4C8EDA' };
  if (v <= 35)  return { label: '보통',    color: '#4CAF50' };
  if (v <= 75)  return { label: '나쁨',    color: '#F5A623' };
  return              { label: '매우나쁨', color: '#E03030' };
}

const DAY_LABELS = ['오늘', '내일', '모레'];

interface Current {
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  code: number;
  updatedAt: string;
}

interface DayForecast {
  date: string;
  code: number;
  high: number;
  low: number;
}

interface AirQuality {
  pm10: number;
  pm25: number;
}

interface WeatherData {
  current: Current;
  daily: DayForecast[];
  air: AirQuality | null;
}

export default function WeatherWidget() {
  const [data, setData] = useState<WeatherData | null>(null);

  useEffect(() => {
    const weatherUrl =
      'https://api.open-meteo.com/v1/forecast' +
      '?latitude=37.5665&longitude=126.9780' +
      '&current=temperature_2m,apparent_temperature,relativehumidity_2m,weathercode,windspeed_10m' +
      '&daily=weathercode,temperature_2m_max,temperature_2m_min' +
      '&timezone=Asia%2FSeoul&forecast_days=3';

    const airUrl =
      'https://air-quality-api.open-meteo.com/v1/air-quality' +
      '?latitude=37.5665&longitude=126.9780' +
      '&current=pm10,pm2_5' +
      '&timezone=Asia%2FSeoul';

    Promise.all([
      fetch(weatherUrl).then(r => r.json()),
      fetch(airUrl).then(r => r.json()).catch(() => null),
    ]).then(([w, a]) => {
      const c = w.current;
      const time = new Date(c.time);
      setData({
        current: {
          temp: Math.round(c.temperature_2m),
          feelsLike: Math.round(c.apparent_temperature),
          humidity: c.relativehumidity_2m,
          windSpeed: Math.round(c.windspeed_10m * 10) / 10,
          code: c.weathercode,
          updatedAt: time.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        },
        daily: (w.daily.time as string[]).slice(0, 3).map((date: string, i: number) => ({
          date,
          code: w.daily.weathercode[i],
          high: Math.round(w.daily.temperature_2m_max[i]),
          low: Math.round(w.daily.temperature_2m_min[i]),
        })),
        air: a?.current ? {
          pm10: Math.round(a.current.pm10),
          pm25: Math.round(a.current.pm2_5),
        } : null,
      });
    }).catch(() => {});
  }, []);

  if (!data) {
    return <div className="w-80 bg-white rounded-xl border border-slate-200 animate-pulse" style={{ height: '320px' }} />;
  }

  const { current, daily, air } = data;
  const { label, icon } = wmo(current.code);

  return (
    <div className="w-80 bg-white rounded-xl border border-slate-200 p-5">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-slate-400">📍 서울</span>
        <span className="text-xs text-slate-400">{current.updatedAt} 기준</span>
      </div>

      {/* 아이콘 + 기온 */}
      <div className="flex items-center justify-center gap-4 mb-3">
        <span className="text-5xl leading-none">{icon}</span>
        <div>
          <p className="text-4xl font-black text-slate-900 tabular-nums leading-none">{current.temp}°C</p>
          <p className="text-sm text-slate-500 mt-1">{label}</p>
        </div>
      </div>

      {/* 상세 지표 */}
      <div className="flex justify-around mb-3">
        <div className="text-center">
          <p className="text-[10px] text-slate-400 mb-0.5">체감</p>
          <p className="text-sm font-bold text-slate-700 tabular-nums">{current.feelsLike}°</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-slate-400 mb-0.5">습도</p>
          <p className="text-sm font-bold text-slate-700 tabular-nums">{current.humidity}%</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-slate-400 mb-0.5">바람</p>
          <p className="text-sm font-bold text-slate-700 tabular-nums">
            {current.windSpeed}<span className="text-[10px] font-normal text-slate-400"> m/s</span>
          </p>
        </div>
      </div>

      {/* 미세먼지 */}
      {air && (() => {
        const g10  = pm10Grade(air.pm10);
        const g25  = pm25Grade(air.pm25);
        return (
          <div className="flex gap-2 mb-3">
            <div className="flex-1 flex items-center justify-between bg-slate-50 rounded-lg px-2.5 py-1.5">
              <span className="text-[10px] text-slate-400">미세먼지</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-bold" style={{ color: g10.color }}>{g10.label}</span>
                <span className="text-[10px] text-slate-400 tabular-nums">{air.pm10}㎍</span>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-between bg-slate-50 rounded-lg px-2.5 py-1.5">
              <span className="text-[10px] text-slate-400">초미세먼지</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-bold" style={{ color: g25.color }}>{g25.label}</span>
                <span className="text-[10px] text-slate-400 tabular-nums">{air.pm25}㎍</span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 3일 예보 */}
      <div className="border-t border-slate-100 pt-3 space-y-2">
        {daily.map((day, i) => {
          const { icon: dIcon } = wmo(day.code);
          return (
            <div key={day.date} className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 w-8">{DAY_LABELS[i]}</span>
              <span className="text-lg leading-none">{dIcon}</span>
              <span className="text-xs tabular-nums text-slate-700">
                <span className="font-bold">{day.high}°</span>
                <span className="text-slate-400"> / {day.low}°</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
