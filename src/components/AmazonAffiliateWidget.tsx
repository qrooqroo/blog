const PRODUCTS = [
  { name: 'Sony WH-1000XM5 노이즈캔슬링 헤드폰', asin: 'B09XS7JWHH' },
  { name: 'Apple AirPods Pro 2세대',              asin: 'B0BDHB9Y8H' },
  { name: 'Kindle Paperwhite 16GB (2024)',         asin: 'B0CF4DCGRP' },
  { name: 'Anker PowerCore 10000 보조배터리',      asin: 'B07QXPF879' },
  { name: 'Samsung T7 포터블 SSD 2TB',             asin: 'B0874YJP92' },
  { name: 'GoPro HERO 13 Black',                   asin: 'B0CP5H9M79' },
  { name: 'Echo Dot 5세대 스마트 스피커',           asin: 'B09B8V1LZ3' },
  { name: 'iRobot Roomba i3+ 로봇청소기',          asin: 'B08168Z9YZ' },
  { name: 'Instant Pot Duo 7-in-1 멀티쿠커',       asin: 'B00FLYWNYQ' },
];

const TAG = 'aiinsightnote-20';

export default function AmazonAffiliateWidget() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">
        지금 핫한 상품
      </p>
      <div className="grid grid-cols-3 gap-2">
        {PRODUCTS.map(product => (
          <a
            key={product.asin}
            href={`https://www.amazon.com/dp/${product.asin}/?tag=${TAG}`}
            target="_blank"
            rel="noopener noreferrer sponsored"
            title={product.name}
            className="group flex flex-col items-center gap-1.5 p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <img
              src={`https://images-na.ssl-images-amazon.com/images/P/${product.asin}.01._SL160_.jpg`}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-12 h-12 object-contain rounded"
            />
            <p className="text-xs text-center text-slate-600 group-hover:text-indigo-600 leading-snug line-clamp-2 transition-colors">
              {product.name}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}
