import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const year  = searchParams.get('year')  ?? String(new Date().getFullYear());
  const month = searchParams.get('month') ?? String(new Date().getMonth() + 1);

  const serviceKey = process.env.KASI_SERVICE_KEY ?? '';
  const url =
    'http://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo' +
    `?serviceKey=${serviceKey}` +
    `&solYear=${year}` +
    `&solMonth=${month.padStart(2, '0')}` +
    `&_type=json` +
    `&numOfRows=50`;

  try {
    const res  = await fetch(url, { next: { revalidate: 3600 } });
    const json = await res.json();

    const raw = json?.response?.body?.items?.item;
    const items = raw ? (Array.isArray(raw) ? raw : [raw]) : [];

    const holidays = items
      .filter((it: { isHoliday: string }) => it.isHoliday === 'Y')
      .map((it: { locdate: number; dateName: string }) => ({
        date: String(it.locdate).replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'),
        name: it.dateName,
      }));

    return NextResponse.json(holidays);
  } catch {
    return NextResponse.json([]);
  }
}
