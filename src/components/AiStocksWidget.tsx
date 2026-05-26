'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  siNvidia, siGoogle, siMeta, siTesla, siApple,
  siBinance, siCoinbase, siOkx, siKucoin,
  siVisa, siPaypal, siStripe, siRevolut, siWise, siAlipay,
  siAbb, siIrobot, siSamsung, siHyundai,
} from 'simple-icons';
import type { SimpleIcon } from 'simple-icons';

/* ── Simple Icons 인라인 SVG ── */
function SI({ icon, size = 20 }: { icon: SimpleIcon; size?: number }) {
  return (
    <svg role="img" viewBox="0 0 24 24" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      <path d={icon.path} fill={`#${icon.hex}`} />
    </svg>
  );
}

/* ── 직접 그린 SVG ── */
const MicrosoftIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="11" height="11" fill="#F25022" />
    <rect x="13" y="0" width="11" height="11" fill="#7FBA00" />
    <rect x="0" y="13" width="11" height="11" fill="#00A4EF" />
    <rect x="13" y="13" width="11" height="11" fill="#FFB900" />
  </svg>
);

const MastercardIcon = () => (
  <svg viewBox="0 0 38 24" width="28" height="18" xmlns="http://www.w3.org/2000/svg">
    <circle cx="13" cy="12" r="11" fill="#EB001B" />
    <circle cx="25" cy="12" r="11" fill="#F79E1B" fillOpacity="0.9" />
  </svg>
);

/* ── 파비콘 이미지 (실패 시 배지로 대체) ── */
function FavImg({ domain, alt, short, color, service = 'google' }: {
  domain: string; alt: string; short: string; color: string; service?: 'google' | 'ddg';
}) {
  const [failed, setFailed] = useState(false);
  const src = service === 'ddg'
    ? `https://icons.duckduckgo.com/ip3/${domain}.ico`
    : `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (e.currentTarget.naturalWidth <= 16) setFailed(true);
  };
  if (failed) return <Badge short={short} color={color} />;
  return (
    <img
      src={src}
      alt={alt}
      className="w-5 h-5 object-contain"
      style={{ mixBlendMode: 'multiply' }}
      onError={() => setFailed(true)}
      onLoad={handleLoad}
    />
  );
}

/* ── 텍스트 배지 ── */
function Badge({ short, color }: { short: string; color: string }) {
  const fs = short.length > 3 ? '6px' : short.length > 2 ? '7px' : short.length > 1 ? '9px' : '12px';
  return (
    <div className="w-5 h-5 rounded-md flex items-center justify-center text-white font-black leading-none"
      style={{ backgroundColor: color, fontSize: fs }}>
      {short}
    </div>
  );
}

type Item = {
  name: string;
  name_en?: string;
  short: string;
  url: string;
  color: string;
  render: () => React.ReactElement;
};

function si(icon: SimpleIcon) {
  return () => <SI icon={icon} />;
}
function fav(domain: string, short: string, color: string) {
  return () => <FavImg domain={domain} alt={domain} short={short} color={color} />;
}
function favDdg(domain: string, short: string, color: string) {
  return () => <FavImg domain={domain} alt={domain} short={short} color={color} service="ddg" />;
}
function badge(short: string, color: string) {
  return () => <Badge short={short} color={color} />;
}

const SECTORS: { label: string; label_en: string; items: Item[] }[] = [
  {
    label: 'AI 기업',
    label_en: 'AI Companies',
    items: [
      { name: 'Nvidia',    short: 'NV', url: 'https://www.nvidia.com',    color: '#76B900', render: si(siNvidia) },
      { name: 'Microsoft', short: 'MS', url: 'https://www.microsoft.com', color: '#0078d4', render: () => <MicrosoftIcon /> },
      { name: 'Google',    short: 'G',  url: 'https://www.google.com',    color: '#4285F4', render: si(siGoogle) },
      { name: 'Meta',      short: 'M',  url: 'https://www.meta.com',      color: '#0467DF', render: si(siMeta) },
      { name: 'Tesla',     short: 'T',  url: 'https://www.tesla.com',     color: '#CC0000', render: si(siTesla) },
      { name: 'Amazon',    short: 'Az', url: 'https://www.amazon.com',    color: '#FF9900', render: fav('amazon.com', 'Az', '#FF9900') },
      { name: 'Apple',     short: '',   url: 'https://www.apple.com',     color: '#555555', render: si(siApple) },
    ],
  },
  {
    label: '코인 거래소',
    label_en: 'Crypto Exchanges',
    items: [
      { name: 'Binance',  short: 'BN',  url: 'https://www.binance.com',  color: '#F0B90B', render: si(siBinance) },
      { name: 'Coinbase', short: 'CB',  url: 'https://www.coinbase.com', color: '#0052FF', render: si(siCoinbase) },
      { name: 'Kraken',   short: 'KR',  url: 'https://www.kraken.com',   color: '#5741D9', render: fav('kraken.com', 'KR', '#5741D9') },
      { name: 'OKX',      short: 'OKX', url: 'https://www.okx.com',      color: '#000000', render: si(siOkx) },
      { name: 'KuCoin',   short: 'KC',  url: 'https://www.kucoin.com',   color: '#01BC8D', render: si(siKucoin) },
      { name: 'Bybit',    short: 'BY',  url: 'https://www.bybit.com',    color: '#F7A600', render: fav('bybit.com', 'BY', '#F7A600') },
      { name: 'Upbit',    short: 'UP',  url: 'https://upbit.com',        color: '#006EFF', render: fav('upbit.com', 'UP', '#006EFF') },
    ],
  },
  {
    label: '핀테크',
    label_en: 'Fintech',
    items: [
      { name: 'Visa',       short: 'V',  url: 'https://www.visa.com',       color: '#1A1F71', render: si(siVisa) },
      { name: 'Mastercard', short: 'MC', url: 'https://www.mastercard.com', color: '#EB001B', render: () => <MastercardIcon /> },
      { name: 'PayPal',     short: 'PP', url: 'https://www.paypal.com',     color: '#002991', render: si(siPaypal) },
      { name: 'Stripe',     short: 'S',  url: 'https://stripe.com',         color: '#635BFF', render: si(siStripe) },
      { name: 'Revolut',    short: 'R',  url: 'https://www.revolut.com',    color: '#191C1F', render: si(siRevolut) },
      { name: 'Wise',       short: 'W',  url: 'https://wise.com',           color: '#9FE870', render: si(siWise) },
      { name: 'Alipay',     short: '支', url: 'https://www.alipay.com',     color: '#1677FF', render: si(siAlipay) },
    ],
  },
  {
    label: '국내 조선업',
    label_en: 'Korean Shipbuilders',
    items: [
      { name: 'HD현대중공업', name_en: 'HD Hyundai Heavy Ind.', short: 'HD',  url: 'https://www.hhi.co.kr',         color: '#002C5E', render: si(siHyundai) },
      { name: '삼성중공업',   name_en: 'Samsung Heavy Ind.',    short: '삼',  url: 'https://www.shi.samsung.co.kr', color: '#1428A0', render: si(siSamsung) },
      { name: '한화오션',     name_en: 'Hanwha Ocean',          short: '한',  url: 'https://www.hanwhaocean.com',   color: '#FF6200', render: fav('hanwha.com',        '한',  '#FF6200') },
      { name: '현대미포조선', name_en: 'Hyundai Mipo',          short: '미포', url: 'https://www.hmd.co.kr',        color: '#002C5E', render: si(siHyundai) },
      { name: '현대삼호',     name_en: 'Hyundai Samho',         short: '삼호', url: 'https://www.hyundai-samho.com',color: '#002C5E', render: si(siHyundai) },
      { name: '대한조선',     name_en: 'Daehan Shipbuilding',   short: '대한', url: 'https://www.daehancs.com',     color: '#002060', render: badge('대한', '#002060') },
      { name: 'STX조선',      name_en: 'STX Shipbuilding',      short: 'STX', url: 'https://www.stxship.com',      color: '#CC0000', render: fav('stxship.com',       'STX', '#CC0000') },
    ],
  },
  {
    label: '건설업',
    label_en: 'Korean Construction',
    items: [
      { name: '삼성물산',   name_en: 'Samsung C&T',  short: '삼성',  url: 'https://www.samsungcnt.com', color: '#1428A0', render: si(siSamsung) },
      { name: '현대건설',   name_en: 'Hyundai E&C',  short: '현대',  url: 'https://www.hdec.kr',        color: '#002C5E', render: si(siHyundai) },
      { name: 'GS건설',     name_en: 'GS E&C',       short: 'GS',   url: 'https://www.gsenc.com',      color: '#003E7E', render: fav('gsenc.com',      'GS',   '#003E7E') },
      { name: '대우건설',   name_en: 'Daewoo E&C',   short: '대우',  url: 'https://www.daewooenc.com',  color: '#006633', render: fav('daewooenc.com',  '대우',  '#006633') },
      { name: '포스코건설', name_en: 'POSCO E&C',    short: 'POSCO', url: 'https://www.poscoenc.com',   color: '#005EB8', render: fav('posco.co.kr', 'POSCO', '#005EB8') },
      { name: '롯데건설',   name_en: 'Lotte E&C',    short: '롯데',  url: 'https://www.lotteenc.com',   color: '#CC0000', render: fav('lottegroup.com', '롯데', '#CC0000') },
      { name: 'DL이앤씨',   name_en: 'DL E&C',       short: 'DL',   url: 'https://www.dlenc.co.kr',    color: '#1a2e5a', render: fav('dlenc.co.kr',    'DL',   '#1a2e5a') },
    ],
  },
  {
    label: '로봇기술',
    label_en: 'Robotics',
    items: [
      { name: 'Boston\nDynamics', short: 'BD',  url: 'https://bostondynamics.com',       color: '#0085CA', render: fav('bostondynamics.com',   'BD',  '#0085CA') },
      { name: 'ABB',              short: 'ABB', url: 'https://www.abb.com',               color: '#FF000F', render: si(siAbb) },
      { name: 'Fanuc',            short: 'FN',  url: 'https://www.fanuc.co.jp',           color: '#FFCC00', render: favDdg('fanuc.com', 'FN', '#FFCC00') },
      { name: 'KUKA',             short: 'KK',  url: 'https://www.kuka.com',              color: '#F37021', render: fav('kuka.com',             'KK',  '#F37021') },
      { name: 'Figure AI',        short: 'FG',  url: 'https://www.figure.ai',             color: '#2d2d2d', render: fav('figure.ai',            'FG',  '#2d2d2d') },
      { name: '현대로보틱스', name_en: 'Hyundai Robotics', short: '현로', url: 'https://www.hyundai-robotics.com', color: '#002C5F', render: fav('hyundai-robotics.com', '현로', '#002C5F') },
      { name: 'iRobot',           short: 'iR',  url: 'https://www.irobot.com',            color: '#6CB86A', render: si(siIrobot) },
    ],
  },
];

const INTERVAL = 4000;

export default function AiStocksWidget() {
  const params = useParams<{ locale?: string }>();
  const isEn = params?.locale === 'en';
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setCurrent(prev => (prev + 1) % SECTORS.length);
        setAnimating(false);
      }, 250);
    }, INTERVAL);
    return () => clearInterval(timer);
  }, []);

  const goTo = (idx: number) => {
    if (idx === current) return;
    setAnimating(true);
    setTimeout(() => { setCurrent(idx); setAnimating(false); }, 250);
  };

  const sector = SECTORS[current];

  return (
    <div className="rounded-xl p-4">
      <div className="relative flex items-center justify-center mb-3">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
          {isEn ? sector.label_en : sector.label}
        </span>
        <div className="absolute right-0 flex gap-1">
          {SECTORS.map((_, i) => (
            <button key={i} onClick={() => goTo(i)}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${i === current ? 'bg-indigo-500' : 'bg-slate-300'}`}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 transition-opacity duration-200"
        style={{ opacity: animating ? 0 : 1 }}>
        {sector.items.map(({ name, name_en, url, render: Render }) => (
          <a key={name} href={url} target="_blank" rel="noopener noreferrer"
            className="flex flex-col items-center gap-1.5 group">
            <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-slate-200 transition-colors">
              <Render />
            </div>
            <span className="text-[10px] font-semibold text-slate-600 truncate w-full text-center group-hover:text-indigo-600 transition-colors leading-tight">
              {(isEn && name_en) ? name_en : name}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
