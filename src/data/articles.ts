import { Article, Category } from '@/types';

// 카테고리 기본 이미지 (fallback)
const IMAGES: Record<Category, string> = {
  '경제': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80&fit=crop',
  '정치': 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&q=80&fit=crop',
  '사회': 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80&fit=crop',
  '건강': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80&fit=crop',
  '스포츠': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80&fit=crop',
  'IT': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80&fit=crop',
  '문화': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80&fit=crop',
};

// 기사별 개별 이미지 (주제에 맞게 선별)
const ARTICLE_IMAGES: Record<string, string> = {
  // 경제
  'kospi-7300-high':      'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80&fit=crop', // 주식 거래 화면
  'bok-rate-hike':        'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80&fit=crop', // 동전/금리
  'samsung-q1-profit':    'https://images.unsplash.com/photo-1569605803663-e9337d901ff9?w=800&q=80&fit=crop', // 반도체 웨이퍼
  'real-estate-gap':      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80&fit=crop', // 아파트 단지
  'oil-price-drop':       'https://images.unsplash.com/photo-1518544969827-d07b30aa3af7?w=800&q=80&fit=crop', // 유조선
  'youth-savings-close':  'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80&fit=crop', // 저금통/저축
  'export-record':        'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&q=80&fit=crop', // 컨테이너 항구
  'won-dollar-exchange':  'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=800&q=80&fit=crop', // 환율/외화
  'consumer-price':       'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80&fit=crop', // 마트/물가
  'skhynix-hbm':          'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80&fit=crop', // 회로기판
  // 정치
  'local-election-26days': 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&q=80&fit=crop', // 투표함
  'constitutional-amendment': 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&q=80&fit=crop', // 국회의사당
  'busan-election':       'https://images.unsplash.com/photo-1494172961521-33799ddd43a5?w=800&q=80&fit=crop', // 투표 용지
  'nk-constitution':      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80&fit=crop', // 철조망/국경
  'hormuz-attack':        'https://images.unsplash.com/photo-1559941727-6fb446e7e8ae?w=800&q=80&fit=crop', // 해상 선박
  'ukraine-ceasefire':    'https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=800&q=80&fit=crop', // 외교 협상
  'approval-rating':      'https://images.unsplash.com/photo-1507036066871-b7e8032b3dea?w=800&q=80&fit=crop', // 설문조사
  'democratic-local-candidates': 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=800&q=80&fit=crop', // 선거 집회
  'korea-us-summit':      'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80&fit=crop', // 악수/정상회담
  'corruption-probe':     'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80&fit=crop', // 법원/망치
  // 사회
  'gwangju-stabbing':     'https://images.unsplash.com/photo-1593697821028-7cc59cfd7399?w=800&q=80&fit=crop', // 경찰차
  'childrens-day-charity': 'https://images.unsplash.com/photo-1484820540004-14229fe36ca4?w=800&q=80&fit=crop', // 아이들
  'birth-rate-low':       'https://images.unsplash.com/photo-1491013516836-7db643ee125a?w=800&q=80&fit=crop', // 신생아
  'single-household':     'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80&fit=crop', // 1인 아파트
  'youth-unemployment':   'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&q=80&fit=crop', // 구직/노트북
  'nursing-home-antibiotic': 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800&q=80&fit=crop', // 노인 요양
  'heat-wave-may':        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80&fit=crop', // 폭염/태양
  'pet-industry':         'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80&fit=crop', // 반려견
  'foreign-workers':      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80&fit=crop', // 다문화 노동자
  'school-violence':      'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80&fit=crop', // 학교 복도
  // 건강
  '5th-insurance':        'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80&fit=crop', // 보험 서류
  'kcell-bank':           'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800&q=80&fit=crop', // 연구실/현미경
  'glp1-obesity':         'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80&fit=crop', // 의약품
  'youth-depression':     'https://images.unsplash.com/photo-1509475826633-fed4a6f28d84?w=800&q=80&fit=crop', // 우울/청년
  'dementia-policy':      'https://images.unsplash.com/photo-1568079636092-81e1b7cd56c2?w=800&q=80&fit=crop', // 노인 케어
  'cancer-ai':            'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80&fit=crop', // MRI/의료 영상
  'terminal-care':        'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80&fit=crop', // 병원 복도
  'heatstroke':           'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=800&q=80&fit=crop', // 뙤약볕
  'maternal-health':      'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&q=80&fit=crop', // 임산부/육아
  'medical-fee':          'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&q=80&fit=crop', // 청진기/의사
  // 스포츠
  'kbo-record':           'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800&q=80&fit=crop', // 야구장
  'son-heung-min':        'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80&fit=crop', // 축구
  'lee-jung-hoo':         'https://images.unsplash.com/photo-1499096816390-44fa6c9d4b30?w=800&q=80&fit=crop', // 야구 배팅
  'ahn-se-young':         'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80&fit=crop', // 배드민턴
  'lee-kang-in':          'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&q=80&fit=crop', // 축구 경기
  'kim-do-young':         'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=800&q=80&fit=crop', // 야구 필드
  'world-cup-qualify':    'https://images.unsplash.com/photo-1508098682722-e99c643e7f0b?w=800&q=80&fit=crop', // 월드컵 스타디움
  'kleague':              'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=80&fit=crop', // K리그 축구
  'hur-woong':            'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80&fit=crop', // 농구
  'kim-joo-hyung':        'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&q=80&fit=crop', // 골프
  // IT
  'samsung-hbm4':         'https://images.unsplash.com/photo-1569605803663-e9337d901ff9?w=800&q=80&fit=crop', // 반도체 칩
  'agentic-ai':           'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80&fit=crop', // AI 시각화
  'upstage-daum':         'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80&fit=crop', // 웹 포털
  'naver-hyperclova':     'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80&fit=crop', // AI/코드
  'skt-aidot':            'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80&fit=crop', // AI 스마트폰
  'cybersecurity':        'https://images.unsplash.com/photo-1550751827-4bd374173312?w=800&q=80&fit=crop', // 사이버 보안
  'galaxy-s26':           'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80&fit=crop', // 스마트폰
  '5g-6g':                'https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?w=800&q=80&fit=crop', // 5G 네트워크
  'sovereign-ai':         'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80&fit=crop', // 데이터센터
  'ai-startup':           'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80&fit=crop', // 스타트업 오피스
  // 문화
  'choi-yena':            'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80&fit=crop', // K팝 콘서트
  'lim-young-woong':      'https://images.unsplash.com/photo-1501386761578-eaa54b1a4515?w=800&q=80&fit=crop', // 콘서트 공연
  'ive-heya':             'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80&fit=crop', // K팝 퍼포먼스
  'movie-exhuma':         'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80&fit=crop', // 영화관
  'queen-of-tears':       'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800&q=80&fit=crop', // 드라마/TV
  'squid-game-2':         'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&q=80&fit=crop', // 넷플릭스
  'bts-comeback':         'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80&fit=crop', // 콘서트 팬
  'webtoon-global':       'https://images.unsplash.com/photo-1626785774625-ddcddc3445e9?w=800&q=80&fit=crop', // 웹툰/일러스트
  'crime-city-5':         'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=800&q=80&fit=crop', // 액션 영화
  'seoul-concerts':       'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80&fit=crop', // 서울 공연
};

const raw: Omit<Article, 'image'>[] = [
  // 경제
  { id: 1, title: '코스피 7,300선 돌파…강세장 어디까지', slug: 'kospi-7300-high', category: '경제', excerpt: '코스피가 7,300선을 돌파하며 사상 최고치를 경신했다. 외국인 5조 원 순매수와 반도체주 강세가 견인했다.', content: '<p>2026년 5월 7일 코스피가 장중 7,384.56까지 오르며 역사적 고점을 세웠다. 이틀 만에 7,300선마저 넘어섰다.</p><p>외국인 투자자는 이틀간 5조 원 이상 순매수했다. 삼성전자, SK하이닉스 등 반도체주가 5~8% 폭등하며 지수를 이끌었다. 증권가는 AI 반도체 수요 급증이 구조적 상승을 뒷받침한다고 분석했다.</p><p>전문가들은 7,500선 도전 여부를 주목하면서도 미 연준 금리 정책 변화와 중동 리스크를 변수로 꼽고 있다.</p>', date: '2026-05-07' },
  { id: 2, title: '한국은행 기준금리 인상 시그널…6월 인상 전망 확산', slug: 'bok-rate-hike', category: '경제', excerpt: '한국은행이 기준금리 인상 가능성을 시사했다. 6~7월 인상 전망이 우세해지며 대출 금리 상승 우려가 커지고 있다.', content: '<p>한국은행이 2026년 5월 금융통화위원회에서 기준금리 인상 가능성을 시사했다. 이창용 총재는 물가 상방 리스크를 언급하며 추가 긴축 가능성을 열어뒀다.</p><p>시장은 6~7월 금리 인상 신호로 해석하고 있다. 현행 3.5%에서 3.75%로 오를 경우 주택담보대출 금리가 추가 상승해 가계 부담이 커질 전망이다.</p><p>다음 금통위는 6월로 예정돼 있어 그 전까지 나오는 물가 지표가 핵심 변수가 될 것이다.</p>', date: '2026-05-06' },
  { id: 3, title: '삼성전자 1분기 영업익 57조…AI 반도체가 살렸다', slug: 'samsung-q1-profit', category: '경제', excerpt: '삼성전자 1분기 영업이익이 57조 원으로 사상 최대를 기록했다. HBM 기반 AI 반도체 수요 급증이 실적을 견인했다.', content: '<p>삼성전자가 2026년 1분기 매출 133조 9,000억 원, 영업이익 57조 2,000억 원을 기록했다. 분기 기준 사상 최대 실적이다.</p><p>HBM 중심의 AI 반도체 수요 폭증이 핵심 동력이었다. DS 반도체 부문 영업이익만 38조 원에 달했다.</p><p>삼성전자는 올해 설비투자를 역대 최대로 늘릴 방침이다. 증권가는 연간 영업이익 200조 원 돌파도 가능할 것으로 전망했다.</p>', date: '2026-05-02' },
  { id: 4, title: '서울 아파트 나홀로 강세…지방 미분양 12만 가구 돌파', slug: 'real-estate-gap', category: '경제', excerpt: '서울 집값은 오르는데 지방 미분양은 12만 가구를 돌파했다. 부동산 양극화가 사상 최고 수준으로 심화됐다.', content: '<p>수도권과 지방의 부동산 격차가 극심해지고 있다. 서울 아파트 매매가는 5월에도 주간 0.12% 상승하는 반면, 지방 미분양 물량은 12만 가구를 넘어섰다.</p><p>강남, 마포, 용산 등 서울 선호 지역은 매물 품귀로 신고가 거래가 이어지고 있다. 반면 대구, 세종 등은 입주 과잉과 인구 감소로 미분양이 쌓이고 있다.</p><p>국토부는 지방 미분양 해소를 위한 기업형 임대 활성화를 검토 중이다.</p>', date: '2026-05-05' },
  { id: 5, title: '국제유가 급등락…중동 리스크에 배럴당 94달러', slug: 'oil-price-drop', category: '경제', excerpt: '국제유가가 중동 리스크로 107달러까지 오른 뒤 7% 폭락해 94달러대에 안착했다.', content: '<p>국제 원유 가격이 중동 긴장으로 배럴당 107달러까지 치솟았다가 하루 만에 7% 이상 급락하며 94달러대로 내려앉았다.</p><p>주유소 휘발유 가격은 일주일 새 리터당 100원 가까이 올랐다가 반락했다. 정부는 유류세 인하 연장 방안을 검토 중이다.</p>', date: '2026-05-05' },
  { id: 6, title: '청년내일저축계좌 20일 마감…월 10만원으로 1,440만원', slug: 'youth-savings-close', category: '경제', excerpt: '청년내일저축계좌 신청이 5월 20일 마감된다. 월 10만 원 저축으로 정부 지원금 포함 최대 1,440만 원을 받는다.', content: '<p>2026년 청년내일저축계좌 신규 가입 신청이 5월 20일 마감된다. 3년간 월 10만 원을 납입하면 정부 지원금 포함 최대 1,440만 원을 받을 수 있다.</p><p>신청 대상은 만 15~34세의 근로 및 사업소득이 있는 청년이다. 복지로 온라인 또는 주민센터 방문 접수로 신청할 수 있다.</p>', date: '2026-05-07' },
  { id: 7, title: '4월 수출 550억 달러…반도체·선박이 무역흑자 이끌다', slug: 'export-record', category: '경제', excerpt: '4월 수출이 550억 달러로 14% 증가했다. 반도체, 선박이 강세를 보이며 무역흑자 14개월 연속을 달성했다.', content: '<p>2026년 4월 수출이 전년 대비 14.3% 증가한 550억 달러를 기록했다. 반도체 수출이 130억 달러로 역대 4월 기준 최대였다.</p><p>무역수지는 43억 달러 흑자를 기록해 14개월 연속 흑자 기조를 유지했다.</p>', date: '2026-05-01' },
  { id: 8, title: '원달러 환율 1,330원대…외국인 자금 유입에 원화 강세', slug: 'won-dollar-exchange', category: '경제', excerpt: '원달러 환율이 1,330원대로 연중 최저치를 기록했다. 외국인 주식 매수 자금 유입이 원화 강세를 이끌고 있다.', content: '<p>원달러 환율이 5월 들어 1,330원대까지 하락하며 연중 최저치를 경신했다. 코스피 급등에 따른 외국인 자금 대규모 유입이 원화 강세를 이끌었다.</p><p>외환 전문가들은 당분간 1,320~1,360원 박스권을 예상했다.</p>', date: '2026-05-08' },
  { id: 9, title: '소비자물가 2.1% 둔화…근원물가 1.8% 안정세', slug: 'consumer-price', category: '경제', excerpt: '5월 소비자물가 상승률이 2.1%로 둔화됐다. 근원물가는 1.8%로 안정세를 보였으나 외식비는 여전히 3% 이상 올랐다.', content: '<p>5월 소비자물가지수는 전년 동월 대비 2.1% 상승했다. 지난달 2.4%보다 0.3%포인트 낮아진 수치다.</p><p>에너지, 식료품을 제외한 근원물가는 1.8% 상승으로 안정세를 보였다. 그러나 외식비는 3% 이상 상승하며 서민 체감 물가는 여전히 높다.</p>', date: '2026-05-04' },
  { id: 10, title: 'SK하이닉스 HBM 점유율 55% 돌파…엔비디아 최대 공급사', slug: 'skhynix-hbm', category: '경제', excerpt: 'SK하이닉스가 HBM 점유율 55%를 돌파해 엔비디아 최대 공급사 지위를 굳혔다. 1분기 영업이익은 630% 급증했다.', content: '<p>SK하이닉스가 전 세계 HBM 시장에서 점유율 55%를 넘어서며 1위를 굳혔다. 엔비디아 AI 가속기에 독점 공급하는 HBM3E 물량이 폭발적으로 늘어났다.</p><p>SK하이닉스는 1분기 영업이익 7조 4,000억 원을 기록했다. 전년 동기 대비 630% 급증한 수치다.</p>', date: '2026-05-03' },

  // 정치
  { id: 11, title: '6·3 지방선거 D-26…여야 수도권 총력전', slug: 'local-election-26days', category: '정치', excerpt: '6·3 지방선거가 26일 앞으로 다가왔다. 여야가 수도권과 부울경에서 총력전을 펼치며 핵심 공약 경쟁이 치열하다.', content: '<p>6월 3일 지방선거가 26일 앞으로 다가오며 여야가 총력전을 펼치고 있다. 민주당은 서울시장 후보 지지율에서 앞서고, 국민의힘은 경기도지사 탈환에 사활을 걸었다.</p><p>중앙선관위는 5월 9일 후보 등록을 마감하고 12일부터 공식 선거운동에 들어간다.</p>', date: '2026-05-08' },
  { id: 12, title: '국회 개헌안 상정…여당 불참으로 파행', slug: 'constitutional-amendment', category: '정치', excerpt: '야당 주도 개헌안이 상정됐지만 국민의힘 집단 불참으로 파행됐다. 계엄 요건 강화와 대통령 권한 제한이 핵심이다.', content: '<p>야당 주도로 발의된 헌법 개정안이 5월 7일 국회 본회의에 상정됐지만 국민의힘이 집단 불참을 선언하면서 파행됐다. 개헌안에는 계엄 요건 강화, 대통령 권한 제한, 기본소득 조항 신설 등이 담겼다.</p><p>지방선거 이후 개헌 논의가 재개될 것이라는 전망이 나온다.</p>', date: '2026-05-07' },
  { id: 13, title: '부산 북갑 하정우 vs 한동훈 초박빙…보수 단일화 변수', slug: 'busan-election', category: '정치', excerpt: '부산 북갑에서 하정우(38%)와 한동훈(34%)이 초박빙 양강이다. 보수 단일화 협상이 진행 중이나 합의가 불투명하다.', content: '<p>6·3 지방선거와 함께 치러질 부산 북구갑 보궐선거에서 민주당 하정우 38%, 무소속 한동훈 34%로 초박빙 양강 구도가 형성됐다.</p><p>전문가들은 단일화가 성사되지 않으면 민주당에 유리한 구도가 굳어질 것으로 분석한다.</p>', date: '2026-05-07' },
  { id: 14, title: '북한 헌법서 통일 삭제…두 국가 적대관계 명문화', slug: 'nk-constitution', category: '정치', excerpt: '북한이 헌법에서 통일 조항을 삭제하고 두 국가 적대관계를 명문화했다. 남북 대화 가능성이 더욱 멀어졌다.', content: '<p>북한이 최고인민회의에서 사회주의헌법을 개정하면서 통일이라는 단어를 전면 삭제하고 영토 조항을 신설했다.</p><p>정부는 한미 공조 강화를 통해 북한을 대화 테이블로 끌어내겠다는 방침을 재확인했다.</p>', date: '2026-05-05' },
  { id: 15, title: '호르무즈 한국 선박 피격…정부 긴급 NSC 소집', slug: 'hormuz-attack', category: '정치', excerpt: '호르무즈 해협에서 한국 유조선이 피격됐다. 정부는 긴급 NSC를 소집하고 미국의 군사 참여 요청에 신중한 입장을 밝혔다.', content: '<p>호르무즈 해협에서 한국 유조선이 피격되는 사건이 발생해 정부가 긴급 국가안전보장회의를 소집했다. 선원 26명 중 4명이 부상을 입었다.</p><p>이번 사건은 우리 원유 수입의 70% 이상을 담당하는 중동 항로의 안전에 대한 우려를 높였다.</p>', date: '2026-05-06' },
  { id: 16, title: '우크라이나 휴전 협상 재개…한국 전후 재건 참여 검토', slug: 'ukraine-ceasefire', category: '정치', excerpt: '러시아-우크라이나 휴전 협상이 재개됐다. 한국 정부는 전후 재건 사업 참여를 검토하며 기업 진출 지원 방안을 마련 중이다.', content: '<p>러시아-우크라이나 전쟁 휴전 협상이 튀르키예 이스탄불에서 재개됐다. 트럼프 대통령의 중재로 양측이 협상 테이블에 앉은 것은 3년여 만이다.</p><p>한국 정부는 휴전 이후 우크라이나 재건 사업 참여를 적극 검토하고 있다.</p>', date: '2026-05-04' },
  { id: 17, title: '이재명 대통령 지지율 49%…경제 성과 긍정 평가', slug: 'approval-rating', category: '정치', excerpt: '이재명 대통령 지지율이 49%를 기록했다. 경제 성과가 긍정 요인이지만 중동 대응과 부동산 정책 비판도 이어진다.', content: '<p>이재명 대통령의 국정 지지율이 5월 1주차 여론조사에서 49%를 기록했다. 코스피 최고치 경신과 경제 지표 개선이 긍정적으로 작용했다.</p>', date: '2026-05-07' },
  { id: 18, title: '민주당 지방선거 후보 확정…수도권 총력전', slug: 'democratic-local-candidates', category: '정치', excerpt: '민주당이 지방선거 후보를 확정했다. 수도권이 최대 격전지로 여야 모두 총력 지원을 약속했다.', content: '<p>더불어민주당이 6·3 지방선거 주요 지역 후보를 확정했다. 서울시장에는 당 중진 의원을 전략 공천했다.</p>', date: '2026-05-06' },
  { id: 19, title: '한미 정상회담 6월 추진…방위비 재협상이 최대 난제', slug: 'korea-us-summit', category: '정치', excerpt: '한미 정상회담이 6월 개최를 추진 중이다. 방위비 분담금 재협상이 최대 쟁점으로 부상하고 있다.', content: '<p>한미 양국이 6월 중 정상회담 개최를 추진 중이다. 방위비 분담금 재협상, 중동 공동 대응, 반도체 공급망 협력이 핵심 의제다.</p>', date: '2026-05-03' },
  { id: 20, title: '공수처 전직 장관 3명 소환…방산 비리 수사 확대', slug: 'corruption-probe', category: '정치', excerpt: '공수처가 전직 장관 3명을 방산 비리 혐의로 소환했다. 금품 수수 정황을 포착했으며 관련 업체 임원들도 조사 중이다.', content: '<p>고위공직자범죄수사처가 국방, 산업, 국토 분야 전직 장관 3명을 불법 청탁 혐의로 소환 조사했다.</p>', date: '2026-05-02' },

  // 사회
  { id: 21, title: '광주 여고생 흉기 피습…20대 피의자 현장서 체포', slug: 'gwangju-stabbing', category: '사회', excerpt: '광주에서 여고생이 20대 남성에게 흉기로 피습됐다. 경찰은 30분 만에 피의자를 검거했으며 무작위 범행으로 보고 있다.', content: '<p>5월 5일 광주 남부대 인근에서 귀가하던 여고생이 20대 남성에게 흉기로 피습되는 사건이 발생했다.</p><p>신고를 받고 출동한 경찰은 30분 만에 현장 인근에서 피의자를 검거했다. 피의자는 무작위 범행임을 자백했다.</p>', date: '2026-05-06' },
  { id: 22, title: '어린이날 연휴 기부 문화 확산…일일카페·알뜰시장 성황', slug: 'childrens-day-charity', category: '사회', excerpt: '어린이날 연휴 전국에서 어린이 주도 기부 행사가 잇달아 열렸다. 일일카페, 알뜰시장, 기부 마라톤이 성황을 이뤘다.', content: '<p>어린이날 연휴 전국 각지에서 어린이들이 직접 주체가 되는 나눔 행사가 잇따라 열렸다. 서울 한 초등학교에서는 학생 200여 명이 장애 아동 지원 단체에 500만 원을 전달했다.</p>', date: '2026-05-06' },
  { id: 23, title: '합계출산율 0.65로 역대 최저…인구 소멸 위기 가속', slug: 'birth-rate-low', category: '사회', excerpt: '합계출산율이 0.65명으로 역대 최저를 경신했다. 주거비, 양육비, 일가정 양립 어려움이 복합적으로 작용하고 있다.', content: '<p>통계청이 발표한 2026년 1분기 합계출산율이 0.65명으로 역대 최저를 다시 경신했다. 연간 기준으로도 0.7명 아래를 유지할 것이 확실시된다.</p>', date: '2026-05-03' },
  { id: 24, title: '1인 가구 비율 41% 돌파…혼자 사는 시대의 명암', slug: 'single-household', category: '사회', excerpt: '1인 가구 비율이 41%를 돌파했다. 청년과 노인 1인 가구가 동시 증가하며 고독사 문제가 심각한 사회 현안으로 부상했다.', content: '<p>통계청 최신 인구 통계에서 1인 가구 비율이 41%를 넘어섰다. 소용량 식품, 1인 외식, 소형 주택 수요가 급증하는 반면, 사회적 고립과 고독사 문제가 심각한 사회 현안으로 떠오르고 있다.</p>', date: '2026-05-04' },
  { id: 25, title: '청년 체감 실업률 25%…좋은 일자리 미스매치 심각', slug: 'youth-unemployment', category: '사회', excerpt: '청년 체감 실업률이 25%를 넘어섰다. 대기업 선호와 중소기업 인력 부족이라는 일자리 미스매치가 심각하다.', content: '<p>2026년 1분기 청년 체감 실업률이 25.3%로 집계됐다. 대졸 이상의 청년들이 중소기업 취업을 기피하는 반면, 중소기업은 만성적인 인력 부족에 시달리고 있다.</p>', date: '2026-05-05' },
  { id: 26, title: '요양원 항생제 내성균 확산…고령화 사회 새 위협', slug: 'nursing-home-antibiotic', category: '사회', excerpt: '요양원 항생제 내성균 감염률이 병원급 수준으로 치솟았다. 전국 요양원 입소자 10명 중 3명이 보균자인 것으로 확인됐다.', content: '<p>노인 요양 시설에서의 MRSA, VRE 등 다제내성균 감염률이 병원 환경과 맞먹는 수준으로 나타났다는 연구 결과가 나왔다.</p>', date: '2026-05-06' },
  { id: 27, title: '5월 낮 기온 30도 돌파…이상 고온에 조기 폭염 우려', slug: 'heat-wave-may', category: '사회', excerpt: '5월부터 낮 기온이 30도를 웃도는 이상 고온이 나타나고 있다. 기상청은 올여름 폭염이 평년보다 20일 더 길 것으로 전망했다.', content: '<p>5월 상순부터 전국 낮 기온이 30도를 넘는 이상 고온 현상이 이어지고 있다. 기상청은 올여름 폭염 일수가 평년보다 최대 20일 많을 것으로 전망했다.</p>', date: '2026-05-07' },
  { id: 28, title: '반려동물 양육 가구 650만 돌파…관련 산업 10조원 시대', slug: 'pet-industry', category: '사회', excerpt: '반려동물 양육 가구가 650만을 돌파하며 관련 산업이 10조 원 규모로 성장했다. 동물 복지 강화 요구도 함께 높아지고 있다.', content: '<p>국내 반려동물 양육 가구 수가 650만을 돌파하며 관련 산업 규모가 10조 원을 넘어섰다. 반려동물 의료보험 가입자 수도 전년 대비 40% 늘었다.</p>', date: '2026-05-02' },
  { id: 29, title: '외국인 근로자 100만명 시대…다문화 사회 본격화', slug: 'foreign-workers', category: '사회', excerpt: '외국인 근로자가 100만 명을 돌파했다. 저출생, 고령화로 인한 인력 부족이 외국인 의존도를 높이고 있다.', content: '<p>국내 체류 외국인 근로자 수가 처음으로 100만 명을 넘어섰다. 저출생, 고령화로 인한 생산가능인구 감소가 외국인 근로자 수요를 폭발적으로 늘리고 있다.</p>', date: '2026-05-01' },
  { id: 30, title: '학교폭력 사이버 괴롭힘 급증…SNS 통한 언어폭력 심각', slug: 'school-violence', category: '사회', excerpt: '사이버 학교폭력이 전년 대비 23% 급증했다. SNS 언어폭력과 따돌림이 주된 유형으로 초등생 피해도 늘었다.', content: '<p>교육부 2026년 학교폭력 실태조사에서 사이버 괴롭힘 피해 경험이 전년 대비 23% 증가했다. SNS와 메신저를 통한 언어폭력, 따돌림이 주된 유형이었다.</p>', date: '2026-05-03' },

  // 건강
  { id: 31, title: '5세대 실손보험 출시…보험료 최대 50% 낮아진다', slug: '5th-insurance', category: '건강', excerpt: '5세대 실손보험이 출시됐다. 보험료가 50% 낮아졌지만 도수치료 등 일부 비급여 항목이 보장에서 빠졌다.', content: '<p>2026년 5월 6일부터 5세대 실손의료보험이 16개 보험사에서 동시 출시됐다. 보험료가 최대 50% 저렴해진 대신 도수치료 등 일부 비급여 항목이 보장 대상에서 제외됐다.</p>', date: '2026-05-07' },
  { id: 32, title: 'K-Cell 뱅크 구축 본격화…줄기세포 치료 새 시대', slug: 'kcell-bank', category: '건강', excerpt: '정부가 K-Cell 뱅크 구축에 착수했다. 줄기세포 치료제 개발의 핵심 인프라로 2030년 아시아 최대 규모를 목표로 한다.', content: '<p>보건복지부와 과학기술정보통신부가 국가 바이오 전략의 일환으로 K-Cell 뱅크 구축에 본격 착수했다. 정부는 2030년까지 아시아 최대 규모로 키우겠다는 목표를 밝혔다.</p>', date: '2026-05-05' },
  { id: 33, title: '비만 치료제 GLP-1 처방 폭발적 증가…1년새 3배', slug: 'glp1-obesity', category: '건강', excerpt: 'GLP-1 비만 치료제 처방이 1년 새 3배 급증했다. 체중 감량과 심혈관 보호 효과로 만성질환 치료 패러다임을 바꾸고 있다.', content: '<p>GLP-1 계열 비만 치료제 국내 처방 건수가 지난 1년 사이 3배 이상 급증했다. 체중 감량 효과뿐 아니라 심혈관 질환 예방 효과가 임상적으로 입증되면서 처방이 확대되고 있다.</p>', date: '2026-05-04' },
  { id: 34, title: '청년 우울증 역대 최고…정신건강 위기 대응책 시급', slug: 'youth-depression', category: '건강', excerpt: '20~30대 우울증 환자가 역대 최고를 기록했다. 취업난, 경제 불안, 사회적 고립이 복합 원인으로 작용하고 있다.', content: '<p>20~30대 우울증 진료 환자 수가 2026년 1분기 기준 전년 대비 18% 증가하며 역대 최고를 기록했다. 코로나19 이후 사회적 고립, 취업난, 경제적 불안이 복합적으로 작용한 결과다.</p>', date: '2026-05-06' },
  { id: 35, title: '치매 국가책임제 강화…예방·돌봄 예산 2배로', slug: 'dementia-policy', category: '건강', excerpt: '치매 국가책임제 예산이 2배로 늘었다. 치매 환자 100만 명 돌파를 앞두고 조기 진단과 돌봄 지원이 강화된다.', content: '<p>정부가 2026년 치매 국가책임제를 대폭 강화하는 종합 대책을 발표했다. 치매 예방과 조기 진단, 환자 돌봄 지원을 위한 예산이 전년 대비 2배로 늘어났다.</p>', date: '2026-05-03' },
  { id: 36, title: '암 조기 진단 AI 전국 도입…대장암 무료 검진 45세로 확대', slug: 'cancer-ai', category: '건강', excerpt: 'AI 기반 암 조기 진단 시스템이 전국 병원에 도입된다. 대장암 무료 검진 대상도 45세 이상으로 확대될 예정이다.', content: '<p>국립암센터가 AI 기반 암 조기 진단 시스템을 전국 주요 병원에 도입한다. 건강보험공단은 대장암 무료 검진 대상을 기존 50세 이상에서 45세 이상으로 낮출 예정이다.</p>', date: '2026-05-05' },
  { id: 37, title: '연명의료결정제도 8년…현장 자기결정권 정착 중', slug: 'terminal-care', category: '건강', excerpt: '연명의료결정제도 시행 8년 만에 중단 건수 30만 건을 넘었다. 자기결정권 존중 문화가 의료 현장에 정착하고 있다.', content: '<p>연명의료결정제도가 시행 8년을 맞았다. 누적 연명의료 중단 및 유보 건수가 30만 건을 넘어서면서 제도가 의료 현장에 정착하고 있다는 평가가 나온다.</p>', date: '2026-05-02' },
  { id: 38, title: '폭염 속 열사병 주의보…노인·어린이 야외 활동 자제', slug: 'heatstroke', category: '건강', excerpt: '5월부터 이상 고온으로 열사병 주의보가 조기 발령됐다. 노인, 어린이, 야외 작업자의 각별한 주의가 필요하다.', content: '<p>5월부터 기승을 부리는 이상 고온으로 질병관리청이 열사병 주의보를 조기 발령했다. 야외 활동을 오전 10시에서 오후 5시 사이에 자제하고, 수분 섭취를 늘릴 것을 권고했다.</p>', date: '2026-05-07' },
  { id: 39, title: '저출산 대책 모자보건 강화…임신·출산 지원 대폭 확대', slug: 'maternal-health', category: '건강', excerpt: '복지부가 임신, 출산 진료비 지원을 150만 원으로 늘리는 모자보건 강화 대책을 발표했다. 난임 시술 지원도 확대된다.', content: '<p>보건복지부가 저출산 극복을 위한 모자보건 강화 대책을 발표했다. 임신, 출산 진료비 지원 한도가 현행 100만 원에서 150만 원으로 늘어나고, 난임 시술 지원 횟수도 확대된다.</p>', date: '2026-05-04' },
  { id: 40, title: '의료수가 상시 조정 추진…병원 경영 숨통 트인다', slug: 'medical-fee', category: '건강', excerpt: '정부가 의료 행위별 수가를 매년 비용 분석에 따라 상시 조정하는 제도를 추진한다. 만성 저수가 해소가 기대된다.', content: '<p>보건복지부가 2026년부터 의료 행위별 수가를 매년 비용 분석 결과에 따라 상시 조정하는 제도를 본격 추진한다.</p>', date: '2026-05-01' },

  // 스포츠
  { id: 41, title: 'KBO 어린이날 전 구장 매진…올 시즌 흥행 역대급', slug: 'kbo-record', category: '스포츠', excerpt: '어린이날 KBO 전 구장이 매진됐다. 올 시즌 누적 관중 1,000만 명 돌파가 전망되는 역대급 흥행이다.', content: '<p>어린이날 KBO 리그 5개 구장 모두 매진을 기록하며 역대 최고 수준의 흥행을 이어갔다. KBO는 올 시즌 누적 관중이 1,000만 명을 돌파할 것으로 전망하고 있다.</p>', date: '2026-05-06' },
  { id: 42, title: '손흥민 시즌 18골…토트넘 유럽 컨퍼런스리그 결승 진출', slug: 'son-heung-min', category: '스포츠', excerpt: '손흥민이 시즌 18골로 토트넘의 유럽 컨퍼런스리그 결승 진출을 이끌었다. 37세에도 세계 최고 수준의 활약이다.', content: '<p>손흥민이 2025-26 시즌 리그 18골과 함께 UEFA 유럽컨퍼런스리그에서도 팀을 결승에 올려놓는 맹활약을 펼쳤다. 37세의 나이에도 여전히 세계 최고 수준의 경기력을 보여주고 있다는 평가를 받는다.</p>', date: '2026-05-07' },
  { id: 43, title: '이정후 MLB 타율 0.315…샌프란시스코 선두 공신', slug: 'lee-jung-hoo', category: '스포츠', excerpt: '이정후가 MLB 타율 0.315로 샌프란시스코 선두 주역이 됐다. 한국인 타자 역대 최고 타율 경신도 눈앞이다.', content: '<p>샌프란시스코 자이언츠의 이정후가 2026 MLB 시즌 타율 0.315를 기록하며 팀의 내셔널리그 서부지구 선두를 이끌고 있다.</p>', date: '2026-05-07' },
  { id: 44, title: '안세영 코리아오픈 3연패…세계랭킹 1위 굳건', slug: 'ahn-se-young', category: '스포츠', excerpt: '안세영이 코리아오픈 3연패를 달성하며 세계랭킹 1위를 굳혔다. 세계선수권과 아시안게임 금메달을 다음 목표로 삼고 있다.', content: '<p>안세영이 2026 코리아오픈에서 3년 연속 우승을 차지하며 세계 랭킹 1위를 더욱 굳건히 했다. 결승에서 세계 2위 타이완 선수를 2-0으로 완파했다.</p>', date: '2026-05-05' },
  { id: 45, title: '이강인 PSG 2연속 리그 우승…5골 9어시스트 맹활약', slug: 'lee-kang-in', category: '스포츠', excerpt: '이강인이 PSG의 리그 앙 2연속 우승을 이끌었다. 5골 9어시스트로 유럽 무대에서 세계 최고 수준을 증명했다.', content: '<p>이강인이 파리 생제르맹의 리그 앙 2연속 우승에 핵심 기여를 하며 유럽 축구에 완벽히 자리잡았다. 이번 시즌 리그 5골 9어시스트를 기록했다.</p>', date: '2026-05-06' },
  { id: 46, title: 'KIA 김도영 타율 0.382 선두…올해도 MVP 유력', slug: 'kim-do-young', category: '스포츠', excerpt: 'KIA 김도영이 타율 0.382로 KBO 선두를 달리며 2년 연속 MVP에 도전하고 있다.', content: '<p>KIA 타이거즈 김도영이 2026 KBO 시즌 타율 0.382로 전체 1위를 달리며 2년 연속 MVP에 도전하고 있다.</p>', date: '2026-05-08' },
  { id: 47, title: '2026 북중미 월드컵 한국 최종 예선 진출 확정', slug: 'world-cup-qualify', category: '스포츠', excerpt: '한국 축구가 2026 월드컵 아시아 최종 예선 진출을 조 1위로 확정했다. 손흥민 마지막 월드컵에서 역대 최고 성적이 기대된다.', content: '<p>한국 축구 국가대표팀이 2026 FIFA 북중미 월드컵 아시아 최종 예선 진출을 조 1위로 확정지었다. 10회 연속 월드컵 본선 진출을 향한 첫 관문을 통과했다.</p>', date: '2026-05-04' },
  { id: 48, title: 'K리그 전북 7연승 독주…울산·포항 추격전 치열', slug: 'kleague', category: '스포츠', excerpt: 'K리그 전북이 7연승으로 선두를 독주하고 있다. 울산과 포항의 추격전도 치열해 시즌 내내 명승부가 기대된다.', content: '<p>2026 K리그1에서 전북 현대가 7연승을 달리며 선두를 독주하고 있다. 2위 울산 현대와 4점 차를 벌렸다.</p>', date: '2026-05-05' },
  { id: 49, title: '농구 허웅 KBL MVP…세대교체 가속화', slug: 'hur-woong', category: '스포츠', excerpt: '허웅이 KBL 정규시즌 MVP를 수상했다. 젊은 스타들의 부상으로 KBL 세대교체가 가속화되고 있다.', content: '<p>2025-26 KBL 시즌에서 부산 KCC 허웅이 정규시즌 MVP를 수상했다. 허웅은 시즌 평균 21.5점, 5.8어시스트로 국내 최고 가드임을 입증했다.</p>', date: '2026-05-03' },
  { id: 50, title: '골프 김주형 PGA 2승 달성…세계 랭킹 10위권 진입', slug: 'kim-joo-hyung', category: '스포츠', excerpt: '김주형이 PGA 투어 2승을 달성하며 세계 랭킹 10위권 진입을 눈앞에 뒀다. 마스터스 우승으로 한국 첫 메이저 정복을 꿈꾸고 있다.', content: '<p>한국 골프의 기대주 김주형이 2026 PGA 투어에서 2승을 달성하며 세계 랭킹 10위권 진입을 눈앞에 뒀다.</p>', date: '2026-05-02' },

  // IT
  { id: 51, title: '삼성전자 HBM4 엔비디아 납품 가시권…SK와 2파전', slug: 'samsung-hbm4', category: 'IT', excerpt: '삼성전자 HBM4의 엔비디아 납품이 가시화됐다. SK하이닉스와의 2파전이 본격화되며 HBM 시장 판도가 흔들리고 있다.', content: '<p>삼성전자가 차세대 AI 메모리인 HBM4의 엔비디아 납품을 위한 품질 인증 절차 마지막 단계에 들어간 것으로 알려졌다. 삼성전자는 올해 R&D에 37.7조 원을 투자하며 HBM4 양산 경쟁에서 SK하이닉스를 추격하고 있다.</p>', date: '2026-05-07' },
  { id: 52, title: '에이전틱 AI 시대 개막…스스로 판단하고 실행하는 AI', slug: 'agentic-ai', category: 'IT', excerpt: '2026년을 기점으로 스스로 판단하고 실행하는 에이전틱 AI 시대가 열리고 있다. 기업 업무 자동화의 패러다임이 바뀌고 있다.', content: '<p>2026년을 기점으로 AI 기술의 패러다임이 단순 대화형에서 스스로 판단하고 업무를 실행하는 에이전틱 AI로 전환되고 있다. 마이크로소프트, 구글, 세일즈포스 등 글로벌 기업들은 AI 에이전트를 업무 자동화 핵심 도구로 채택하고 있다.</p>', date: '2026-05-06' },
  { id: 53, title: '업스테이지 다음 포털 인수 확정…AI 포털로 재탄생', slug: 'upstage-daum', category: 'IT', excerpt: '업스테이지가 다음 포털 인수를 확정했다. AI 검색 포털로 재탄생시켜 네이버에 도전하겠다는 전략이다.', content: '<p>AI 스타트업 업스테이지가 카카오의 다음 포털 인수를 최종 확정하고 5월 7일 공식 발표했다. 업스테이지는 다음 포털에 자사의 거대언어모델 기술을 접목해 완전히 새로운 AI 검색 포털로 재탄생시키겠다는 계획을 밝혔다.</p>', date: '2026-05-07' },
  { id: 54, title: '네이버 하이퍼클로바X 2.0 공개…한국어 AI 세계 5위', slug: 'naver-hyperclova', category: 'IT', excerpt: '네이버 하이퍼클로바X 2.0이 공개됐다. 한국어 AI 성능이 세계 5위 수준으로 향상됐고 글로벌 수출도 본격화된다.', content: '<p>네이버가 차세대 거대언어모델 하이퍼클로바X 2.0을 공개했다. 한국어 처리 능력에서 GPT-5에 준하는 성능을 달성했으며 다국어 지원도 대폭 강화됐다.</p>', date: '2026-05-05' },
  { id: 55, title: 'SKT 에이닷 MAU 500만 돌파…기업 시장 공략 본격화', slug: 'skt-aidot', category: 'IT', excerpt: 'SKT 에이닷이 MAU 500만 명을 돌파하고 기업 시장에 본격 진출했다. 출시 한 달 만에 1,000개 기업이 도입했다.', content: '<p>SK텔레콤의 AI 개인 비서 서비스 에이닷의 월간 활성 사용자가 500만 명을 돌파했다. 출시 2년 만에 국내 AI 비서 서비스 1위로 올라섰다.</p>', date: '2026-05-04' },
  { id: 56, title: '사이버 보안 위협 급증…피싱 공격 전년 대비 4배', slug: 'cybersecurity', category: 'IT', excerpt: '피싱 공격이 전년 대비 4배 급증했다. AI 기반 정교한 피싱과 딥페이크 보이스피싱 피해가 1,000억 원을 넘었다.', content: '<p>과학기술정보통신부가 발표한 2026년 1분기 사이버 침해 사고 현황에 따르면 피싱 공격 건수가 전년 동기 대비 4배 이상 급증했다. 딥페이크 기술을 활용한 보이스피싱 피해액이 올해만 1,000억 원을 넘어섰다.</p>', date: '2026-05-03' },
  { id: 57, title: '갤럭시 S26 온디바이스 AI 강화…실시간 통화 번역 탑재', slug: 'galaxy-s26', category: 'IT', excerpt: '갤럭시 S26에 실시간 통화 번역 등 온디바이스 AI 기능이 대폭 강화된다. 갤럭시 링과 연동한 AI 건강 관리도 핵심이다.', content: '<p>삼성전자가 하반기 출시 예정인 갤럭시 S26 시리즈의 주요 사양을 사전 공개했다. 인터넷 연결 없이도 실시간 통화 번역이 가능한 라이브 트랜슬레이트가 대화 중 바로 통역해준다.</p>', date: '2026-05-02' },
  { id: 58, title: '5G 가입자 3,500만 돌파…6G 표준화 경쟁 본격화', slug: '5g-6g', category: 'IT', excerpt: '국내 5G 가입자가 3,500만 명을 돌파했다. 동시에 2030년 상용화를 목표로 6G 표준화 경쟁에도 본격 뛰어들었다.', content: '<p>국내 5G 이동통신 가입자 수가 3,500만 명을 돌파하며 전체 이동통신 가입자의 55%를 넘어섰다. 과기정통부는 2030년 6G 상용화를 목표로 국가 6G 연구개발 투자를 올해 5,000억 원으로 늘렸다.</p>', date: '2026-05-01' },
  { id: 59, title: '소버린 AI 열풍…각국 자국 AI 확보 경쟁 가속', slug: 'sovereign-ai', category: 'IT', excerpt: '각국이 데이터 주권 확보를 위한 소버린 AI 구축에 나서고 있다. 한국도 2조 원을 투자해 국가 AI 컴퓨팅 센터를 구축한다.', content: '<p>자국의 문화, 언어, 법률에 최적화된 독자적인 AI를 확보하려는 소버린 AI 열풍이 전 세계적으로 가속화되고 있다. 한국도 국가 AI 컴퓨팅 센터 구축에 2조 원을 투자하기로 했다.</p>', date: '2026-05-06' },
  { id: 60, title: '한국 AI 스타트업 투자 상반기 1조원 돌파', slug: 'ai-startup', category: 'IT', excerpt: '국내 AI 스타트업 투자가 상반기 1조 원을 돌파했다. 역대 단일 기술 분야 반기 최대 기록으로 해외 자금도 30%를 차지했다.', content: '<p>2026년 상반기 국내 AI 스타트업에 대한 벤처 투자가 1조 원을 돌파했다. 전년 같은 기간 대비 2.3배 급증한 수치다.</p>', date: '2026-05-08' },

  // 문화
  { id: 61, title: '최예나 캐치캐치 중국 음원 1위…K팝 최초 기록', slug: 'choi-yena', category: '문화', excerpt: '최예나의 신곡이 중국 음원 차트 1위를 달성해 K팝 최초 기록을 세웠다. 중국 문화 시장 재개방의 신호탄이라는 평가다.', content: '<p>아이즈원 출신 솔로 가수 최예나의 신곡 캐치캐치가 중국 주요 음원 플랫폼에서 1위를 석권하며 K팝 최초 기록을 세웠다.</p>', date: '2026-05-07' },
  { id: 62, title: '임영웅 신곡 온기 전 차트 석권…콘서트 1시간 만에 매진', slug: 'lim-young-woong', category: '문화', excerpt: '임영웅 신곡 온기가 전 음원 차트를 석권했다. 전국 콘서트 예매는 오픈 1시간 만에 전석 매진됐다.', content: '<p>임영웅이 신곡 온기를 발표하며 멜론, 지니, 벅스 등 주요 음원 사이트 실시간 차트를 동시에 석권했다. 신곡 발매와 함께 발표된 전국 투어 콘서트 예매는 오픈 1시간 만에 매진됐다.</p>', date: '2026-05-06' },
  { id: 63, title: '아이브 HEYA 음방 5관왕…숏폼 챌린지 1억뷰', slug: 'ive-heya', category: '문화', excerpt: '아이브 HEYA가 음악방송 5관왕을 달성하고 숏폼 챌린지가 1억 뷰를 돌파했다. 스포티파이 글로벌 차트 5위도 기록했다.', content: '<p>걸그룹 아이브의 신곡 HEYA가 각종 음악 방송 5관왕을 달성하며 2026년 K팝 최고 히트곡으로 자리매김했다. 중독성 강한 후렴구와 안무를 담은 숏폼 챌린지 영상이 1억 뷰를 돌파했다.</p>', date: '2026-05-05' },
  { id: 64, title: '영화 파묘 동남아 한국영화 역대 흥행 1위', slug: 'movie-exhuma', category: '문화', excerpt: '영화 파묘가 인도네시아와 베트남에서 한국 영화 역대 흥행 1위를 기록했다. 동남아 합산 관객 300만 명을 돌파했다.', content: '<p>한국 영화 파묘가 인도네시아와 베트남에서 한국 영화 역대 흥행 1위를 기록했다. 두 나라 합산 누적 관객 수 300만 명을 돌파했다.</p>', date: '2026-05-04' },
  { id: 65, title: '눈물의 여왕 넷플릭스 글로벌 1위 14주 연속', slug: 'queen-of-tears', category: '문화', excerpt: '눈물의 여왕이 넷플릭스 글로벌 1위 14주 연속을 달성했다. 누적 10억 뷰로 K드라마 역대 2위 기록이다.', content: '<p>tvN 드라마 눈물의 여왕이 넷플릭스 글로벌 TV 부문 1위를 14주 연속 지키며 K드라마 역대 최장 1위 기록을 세웠다. 시청 횟수가 전 세계 누적 10억 회를 돌파했다.</p>', date: '2026-05-03' },
  { id: 66, title: '오징어 게임 2 12월 공개 확정…전 세계 기대감 폭발', slug: 'squid-game-2', category: '문화', excerpt: '오징어 게임 시즌 2가 올해 12월 공개된다. 역대 최대 마케팅 예산 2,000억 원과 함께 전 세계적 열풍을 예고하고 있다.', content: '<p>넷플릭스가 오징어 게임 시즌 2의 공개 일정을 2026년 12월로 확정했다. 넷플릭스는 오징어 게임 2의 마케팅 예산으로 역대 최대 규모인 2,000억 원 이상을 책정했다.</p>', date: '2026-05-07' },
  { id: 67, title: 'BTS 완전체 복귀 카운트다운…팬들 설렘 최고조', slug: 'bts-comeback', category: '문화', excerpt: 'BTS 완전체 복귀가 하반기 예정된 것으로 알려져 팬들의 기대가 최고조다. 9월 신보 발매와 연말 콘서트가 유력하다.', content: '<p>2026년 하반기 BTS 완전체 복귀를 앞두고 전 세계 팬들의 기대감이 최고조에 달하고 있다. 모든 멤버가 군 복무를 마친 뒤 처음으로 완전체로 함께하는 신보 발매와 월드 투어가 올해 안에 발표될 것으로 전망된다.</p>', date: '2026-05-06' },
  { id: 68, title: '한국 웹툰 글로벌 50억 달러 돌파…미국 주류로', slug: 'webtoon-global', category: '문화', excerpt: '한국 웹툰 글로벌 시장이 50억 달러를 돌파했다. 북미 시장에서 미국 전통 만화사들도 웹툰 형식을 채용하기 시작했다.', content: '<p>한국 웹툰의 글로벌 시장 규모가 50억 달러를 돌파했다. 네이버 웹툰 플랫폼의 미국 월간 활성 사용자가 2,000만 명을 넘었다.</p>', date: '2026-05-05' },
  { id: 69, title: '범죄도시 5 개봉 3일 300만 돌파…시리즈 최고 흥행', slug: 'crime-city-5', category: '문화', excerpt: '범죄도시 5가 개봉 3일 만에 300만 관객을 돌파했다. 역대 시리즈 최고 흥행 속도로 최종 1,500만 명이 전망된다.', content: '<p>마동석 주연의 범죄도시 5가 개봉 3일 만에 누적 관객 300만 명을 돌파하며 역대 시리즈 중 가장 빠른 흥행 속도를 기록하고 있다.</p>', date: '2026-05-04' },
  { id: 70, title: '서울 공연 시장 역대 최대…공연장마다 줄서기', slug: 'seoul-concerts', category: '문화', excerpt: '서울 공연 시장이 역대 최대 1조 5,000억 원 규모로 성장했다. K팝 콘서트부터 뮤지컬까지 전 장르에서 매진 행렬이다.', content: '<p>2026년 서울 공연 시장 규모가 역대 최대인 1조 5,000억 원을 넘어설 것으로 전망된다. K팝 콘서트는 물론 뮤지컬, 클래식, 연극 등 다양한 장르에서 관객이 급증하고 있다.</p>', date: '2026-05-08' },
];

export const articles: Article[] = raw.map(a => ({
  ...a,
  image: ARTICLE_IMAGES[a.slug] ?? IMAGES[a.category],
}));

export const CATEGORIES: Category[] = ['경제', '정치', '사회', '건강', '스포츠', 'IT', '문화'];
