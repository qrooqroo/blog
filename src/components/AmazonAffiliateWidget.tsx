const PRODUCTS = [
  {
    name: 'NVIDIA GeForce RTX 4090 Founders Edition',
    asin: 'B0BJFRT43X',
    image: 'https://m.media-amazon.com/images/I/514QPBuqGyL._AC_SL160_.jpg',
  },
  {
    name: 'NVIDIA GeForce RTX 4080 Super',
    asin: 'B0CVNM2LBK',
    image: 'https://m.media-amazon.com/images/I/51FM3WrDB+L._AC_SL160_.jpg',
  },
  {
    name: 'Crucial 64GB DDR5 RAM',
    asin: 'B0BLTG7TN6',
    image: 'https://m.media-amazon.com/images/I/61u+ioPoR1L._AC_SL160_.jpg',
  },
  {
    name: 'Samsung 990 Pro 2TB NVMe SSD',
    asin: 'B0BHJJ9Y77',
    image: 'https://m.media-amazon.com/images/I/71OWtcxKgvL._AC_SL160_.jpg',
  },
  {
    name: 'Hands-On Machine Learning (3판)',
    asin: '1098125975',
    image: 'https://m.media-amazon.com/images/I/81qHV3ACapL._SL160_.jpg',
  },
  {
    name: 'Deep Learning (Goodfellow)',
    asin: '0262035618',
    image: 'https://m.media-amazon.com/images/I/61fim5QqaqL._SL160_.jpg',
  },
  {
    name: 'Logitech MX Keys S Wireless Keyboard',
    asin: 'B0BKW3LB2B',
    image: 'https://m.media-amazon.com/images/I/71G7uXAb9BL._AC_SL160_.jpg',
  },
  {
    name: 'Raspberry Pi 5 (8GB)',
    asin: 'B0CK2FCG1K',
    image: 'https://m.media-amazon.com/images/I/81XB4LUuFOL._AC_SL160_.jpg',
  },
  {
    name: 'The Art of Statistics (Spiegelhalter)',
    asin: '1541618513',
    image: 'https://m.media-amazon.com/images/I/51Yyogk0U8L._SL160_.jpg',
  },
];

const TAG = 'aiinsightnote-20';

export default function AmazonAffiliateWidget() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3">
      <div className="grid grid-cols-3 gap-2">
        {PRODUCTS.map(product => (
          <a
            key={product.asin}
            href={`https://www.amazon.com/dp/${product.asin}/?tag=${TAG}`}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="group flex flex-col items-center gap-1.5 p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <img
              src={product.image}
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
