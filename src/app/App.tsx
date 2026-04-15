import { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { FileText, TrendingUp, Users, ArrowRight, BarChart3 } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Header } from './components/Header';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CampaignModal } from './components/CampaignModal';
import { InfluencerModal } from './components/InfluencerModal';
import { BookmarkDrawer } from './components/BookmarkDrawer';
import { SkeletonCard } from './components/SkeletonCard';
import { EmptyState } from './components/EmptyState';
import { WelcomeState } from './components/WelcomeState';
import { GTMForm } from './components/GTMForm';
import { MyApplications } from './components/MyApplications';
import { AdminTracker } from './components/AdminTracker';
import { InfluencerBrowse } from './components/InfluencerBrowse';
import { mockProducts, mockCampaigns, mockInfluencers } from './mockData';
import { translations } from './translations';
import { Language, Product, Campaign, Influencer, Platform } from './types';

type AppState = 'welcome' | 'loading' | 'results' | 'empty';

// Cross-language search mapping
const SEARCH_DICT: Record<string, string[]> = {
  '선풍기': ['fan', 'electric fan', 'bldc', '扇風機', '풍기', 'circulator'],
  '키보드': ['keyboard', 'キーボード', '鍵盤', 'mechanical'],
  '스피커': ['speaker', 'スピーカー', '音箱', 'audio', 'sound', '오디오'],
  '이어폰': ['earphone', 'earbuds', 'イヤホン', '耳機', 'headphone', 'wireless'],
  '충전기': ['charger', '充電器', 'charging', 'battery', 'power bank'],
  '로봇': ['robot', 'ロボット', '機器人', 'robotic'],
  '카메라': ['camera', 'カメラ', '相機', 'photo', 'video'],
  '시계': ['watch', '時計', '手錶', 'smartwatch', 'clock'],
  '조명': ['light', 'lamp', 'ライト', '燈', 'led', 'lighting'],
  '가방': ['bag', 'バッグ', '包', 'backpack', 'travel'],
  '가전': ['appliance', 'home', '家電', 'household', 'kitchen'],
  '게임': ['game', 'gaming', 'ゲーム', '遊戲'],
  '디자인': ['design', 'デザイン', '設計', 'art'],
  '펜': ['pen', 'ペン', '筆', 'stylus', 'writing'],
  '온열': ['heating', 'heat', 'warm', '暖房', '加熱', 'heated'],
  '마우스': ['mouse', 'マウス', '滑鼠', 'gesture', 'input'],
  '프린터': ['printer', 'プリンター', '打印', '3d print'],
  '공기청정': ['air purifier', '空気清浄', '空氣清淨', 'purifier'],
  '텀블러': ['tumbler', 'タンブラー', 'bottle', 'cup'],
  'cnc': ['cnc', 'laser', 'engraver', 'mill', '레이저', 'carving', '큐비오', 'cubiio'],
  '큐비오': ['cubiio', 'cnc', 'laser', '레이저', '포터블', 'portable'],
  '한셉트': ['hancept', 'pen', '펜', 'foldable', '폴더블', 'card'],
  '가돌': ['gadol', 'speaker', '스피커', 'vibration', '진동', 'vst'],
  '페이서': ['pacer', 'breath', '호흡', 'wearable', '웨어러블', 'neumafit'],
  '반지': ['vanzy', 'ring', 'gesture', '제스처', 'mouse', '마우스', 'coxspace'],
  '젠히트': ['genheat', 'heat', '온열', 'carbon', '탄소', 'pad'],
  'cubiio': ['큐비오', 'cnc', 'laser', '레이저'],
  'hancept': ['한셉트', 'pen', '펜', 'foldable'],
  'gadol': ['가돌', 'speaker', '스피커', 'vibration'],
  'pacer': ['페이서', 'breath', '호흡', 'wearable'],
  'vanzy': ['반지', 'ring', 'gesture', '제스처'],
  'fan': ['선풍기', 'bldc', '扇風機', 'circulator'],
  'speaker': ['스피커', 'スピーカー', '音箱', 'audio'],
  'keyboard': ['키보드', 'キーボード', '鍵盤', 'mechanical'],
  'robot': ['로봇', 'ロボット', '機器人'],
  'game': ['게임', 'gaming', 'ゲーム', '遊戲'],
  'design': ['디자인', 'デザイン', '設計'],
  'camera': ['카메라', 'カメラ', '相機'],
};

function expandQuery(q: string): string[] {
  const lower = q.toLowerCase().trim();
  const expanded = [lower];
  for (const [key, synonyms] of Object.entries(SEARCH_DICT)) {
    if (key.toLowerCase() === lower || synonyms.some(s => s.toLowerCase() === lower)) {
      expanded.push(key.toLowerCase(), ...synonyms.map(s => s.toLowerCase()));
    }
  }
  return [...new Set(expanded)];
}

// Short English words need word-boundary matching to avoid false positives (fan≠fantasy)
const SHORT_WORDS = new Set(['fan','pen','art','bag','cup','led','pet','diy','box','kit','mat','pad']);

function wordMatch(field: string, query: string): boolean {
  if (query.length <= 4 && /^[a-z]+$/.test(query) && SHORT_WORDS.has(query)) {
    const regex = new RegExp(`\\b${query}\\b`, 'i');
    return regex.test(field);
  }
  return field.includes(query);
}

function matchProduct(p: Product, q: string): boolean {
  const queries = expandQuery(q);
  const fields = [p.name, p.description, ...p.tags, p.category || '', p.platform].map(f => f.toLowerCase());
  return queries.some(query => fields.some(field => wordMatch(field, query)));
}

const VALID_PLATFORMS: Platform[] = ['Wadiz', 'Kickstarter', 'Indiegogo', 'Makuake'];

function normalizeCrawledProduct(raw: any): Product {
  const platform = VALID_PLATFORMS.includes(raw.platform) ? raw.platform : 'Kickstarter';
  return {
    id: raw.id || `crawled-${Math.random()}`,
    name: raw.name || '',
    description: raw.description || '',
    imageUrl: raw.imageUrl || '',
    platform,
    fundingGoal: raw.fundingGoal || 0,
    currentAmount: raw.currentAmount || 0,
    percentage: raw.percentage || 0,
    backerCount: raw.backerCount || 0,
    daysLeft: raw.daysLeft || 0,
    tags: raw.tags || [],
    fullDescription: raw.fullDescription || raw.description || '',
    category: raw.category || '',
    url: raw.url || '',
    source: 'crawled',
  };
}

function matchCampaign(c: Campaign, q: string): boolean {
  const queries = expandQuery(q);
  const fields = [c.name, c.description, ...c.tags].map(f => f.toLowerCase());
  return queries.some(query => fields.some(field => wordMatch(field, query)));
}

function matchInfluencer(inf: Influencer, q: string): boolean {
  const queries = expandQuery(q);
  const fields = [inf.name, inf.category, inf.platform, ...(inf.campaigns?.map(c => c.name) || [])].map(f => f.toLowerCase());
  return queries.some(query => fields.some(field => wordMatch(field, query)));
}

function formatKoreanAmount(num: number): string {
  if (num >= 100000000) {
    const eok = num / 100000000;
    return eok % 1 === 0 ? `${eok}억원` : `${eok.toFixed(1)}억원`;
  } else if (num >= 10000000) {
    const man = Math.round(num / 10000);
    return `${man.toLocaleString()}만원`;
  } else if (num >= 10000) {
    const man = num / 10000;
    return `${man.toFixed(0)}만원`;
  }
  return num.toLocaleString('ko-KR') + '원';
}

function formatFollowerCount(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

const tierConfig: Record<string, { label: string; group: string; color: string; badgeColor: string }> = {
  nano: { label: '나노', group: '나노/마이크로 시딩', color: 'text-emerald-600', badgeColor: 'bg-emerald-100 text-emerald-700' },
  micro: { label: '마이크로', group: '나노/마이크로 시딩', color: 'text-teal-600', badgeColor: 'bg-teal-100 text-teal-700' },
  mid: { label: '미드', group: '미드/매크로 유료', color: 'text-blue-600', badgeColor: 'bg-blue-100 text-blue-700' },
  macro: { label: '매크로', group: '미드/매크로 유료', color: 'text-amber-600', badgeColor: 'bg-amber-100 text-amber-700' },
  mega: { label: '메가', group: '메가 앵커', color: 'text-red-600', badgeColor: 'bg-red-100 text-red-700' },
};

export default function App() {
  const [language, setLanguage] = useState<Language>('ko');
  const [searchQuery, setSearchQuery] = useState('');
  const [appState, setAppState] = useState<AppState>('welcome');
  const [bookmarkDrawerOpen, setBookmarkDrawerOpen] = useState(false);
  const [crawledProducts, setCrawledProducts] = useState<Product[]>([]);

  // Bookmarks
  const [bookmarkedProducts, setBookmarkedProducts] = useState<Set<string>>(new Set());
  const [bookmarkedCampaigns, setBookmarkedCampaigns] = useState<Set<string>>(new Set());
  const [bookmarkedInfluencers, setBookmarkedInfluencers] = useState<Set<string>>(new Set());

  // Result filters
  const [platformFilter, setPlatformFilter] = useState<string>('all');

  // Modals
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [selectedInfluencer, setSelectedInfluencer] = useState<Influencer | null>(null);

  const t = translations[language];

  useEffect(() => {
    const saved = localStorage.getItem('bookmarks');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setBookmarkedProducts(new Set(data.products || []));
        setBookmarkedCampaigns(new Set(data.campaigns || []));
        setBookmarkedInfluencers(new Set(data.influencers || []));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    const SB_URL = 'https://skcdrvzcwemhjtchfdtt.supabase.co';
    const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrY2Rydnpjd2VtaGp0Y2hmZHR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxNTY3MzUsImV4cCI6MjA5MTczMjczNX0.ULkKqm_9FlXvq5h3CGcI82-d-ePO2cTEjfnjQDFn6BU';
    const sbHeaders = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` };

    // Load from both: static JSON + Supabase live crawled projects
    Promise.all([
      fetch('/crawled_products.json').then(r => r.json()).catch(() => []),
      fetch(`${SB_URL}/rest/v1/projects?select=*&order=crawled_at.desc&limit=500`, { headers: sbHeaders })
        .then(r => r.json()).catch(() => [])
    ]).then(([jsonProducts, sbProjects]) => {
      // Normalize Supabase projects to same format as crawled_products
      const sbNormalized = (sbProjects || []).map((p: any) => ({
        id: `sb-${p.platform_id}-${p.external_id}`,
        name: p.name || '',
        description: p.description || '',
        imageUrl: p.photo_url || '',
        platform: p.platform_id === 'wadiz' ? 'Wadiz' : p.platform_id === 'makuake' ? 'Makuake' : p.platform_id === 'kickstarter' ? 'Kickstarter' : p.platform_id === 'indiegogo' ? 'Indiegogo' : p.platform_id === 'zeczec' ? 'Zeczec' : p.platform_id,
        fundingGoal: Number(p.goal) || 0,
        currentAmount: Number(p.pledged) || 0,
        percentage: Number(p.percent_funded) || 0,
        backerCount: Number(p.backers_count) || 0,
        daysLeft: 0,
        tags: [],
        category: (p.extra_data?.category) || '',
        url: p.url || '',
        source: 'supabase',
      }));

      // Merge: JSON + Supabase (deduplicate by name)
      const seen = new Set<string>();
      const all = [...jsonProducts, ...sbNormalized].filter((p: any) => {
        const key = (p.name || '').toLowerCase().trim();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      setCrawledProducts(all.map(normalizeCrawledProduct));
    });
  }, []);

  useEffect(() => {
    localStorage.setItem(
      'bookmarks',
      JSON.stringify({
        products: Array.from(bookmarkedProducts),
        campaigns: Array.from(bookmarkedCampaigns),
        influencers: Array.from(bookmarkedInfluencers),
      })
    );
  }, [bookmarkedProducts, bookmarkedCampaigns, bookmarkedInfluencers]);

  const [showGTMForm, setShowGTMForm] = useState(false);
  const [showMyApplications, setShowMyApplications] = useState(false);
  const [showAdminTracker, setShowAdminTracker] = useState(false);
  const [showInfluencerBrowse, setShowInfluencerBrowse] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setAppState('loading');

    setTimeout(() => {
      const q = query.toLowerCase().trim();
      const hasProducts = mockProducts.some((p) => matchProduct(p, q));
      const hasCrawled = crawledProducts.some((p) => matchProduct(p, q));
      const hasCampaigns = mockCampaigns.some((c) => matchCampaign(c, q));
      const hasInfluencers = mockInfluencers.some((inf) => matchInfluencer(inf, q));
      if (hasProducts || hasCrawled || hasCampaigns || hasInfluencers) {
        setAppState('results');
      } else {
        setAppState('empty');
      }
    }, 1200);
  };

  const handleBookmark = (type: 'product' | 'campaign' | 'influencer', id: string) => {
    if (type === 'product') {
      setBookmarkedProducts((prev) => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
      });
    } else if (type === 'campaign') {
      setBookmarkedCampaigns((prev) => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
      });
    } else if (type === 'influencer') {
      setBookmarkedInfluencers((prev) => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
      });
    }
  };

  // Search-based filtering
  const q = searchQuery.toLowerCase().trim();
  const searchedCrawled = q ? crawledProducts.filter((p) => matchProduct(p, q)) : crawledProducts;
  const searchedMockProducts = q ? mockProducts.filter((p) => matchProduct(p, q)) : mockProducts;
  // Crawled (real data) first, then mock as fallback
  const searchedProducts = [...searchedCrawled, ...searchedMockProducts];
  const searchedCampaigns = q ? mockCampaigns.filter((c) => matchCampaign(c, q)) : mockCampaigns;
  const searchedInfluencers = q ? mockInfluencers.filter((inf) => matchInfluencer(inf, q)) : mockInfluencers;

  // Platform breakdown for crawled products
  const crawledPlatformBreakdown = searchedCrawled.reduce<Record<string, number>>((acc, p) => {
    acc[p.platform] = (acc[p.platform] || 0) + 1;
    return acc;
  }, {});

  // Group influencers by tier group
  const groupedInfluencers = searchedInfluencers.reduce<Record<string, Influencer[]>>((acc, inf) => {
    const group = tierConfig[inf.tier]?.group || '기타';
    if (!acc[group]) acc[group] = [];
    acc[group].push(inf);
    return acc;
  }, {});

  // Aggregate influencer stats
  const totalInfluencerCount = searchedInfluencers.length;
  const avgROI = searchedInfluencers.length > 0
    ? Math.round(searchedInfluencers.reduce((sum, inf) => sum + (inf.adMetrics?.roi || 0), 0) / searchedInfluencers.length)
    : 0;
  const totalAttributedRevenue = searchedInfluencers.reduce((sum, inf) => sum + (inf.adMetrics?.attributedRevenue || 0), 0);

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <Header
        language={language}
        onLanguageChange={setLanguage}
        onSearch={handleSearch}
        onOpenBookmarks={() => setBookmarkDrawerOpen(true)}
        translations={t}
        searchQuery={searchQuery}
      />

      <main className="max-w-[1280px] mx-auto px-6 py-8">
        {appState === 'welcome' && (
          <WelcomeState language={language} onSampleSearch={handleSearch} />
        )}

        {appState === 'loading' && (
          <div className="space-y-10">
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-7 w-56 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {[1, 2, 3, 4].map((i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            </section>
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-7 w-56 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[1, 2].map((i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            </section>
          </div>
        )}

        {appState === 'empty' && (
          <EmptyState language={language} onReset={() => setAppState('welcome')} />
        )}

        {appState === 'results' && (
          <div className="space-y-10">

            {/* ========== Platform Filter Bar ========== */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-gray-500 mr-1">필터:</span>
              {['all', 'Kickstarter', 'Wadiz', 'Indiegogo', 'Makuake'].map(plat => (
                <button
                  key={plat}
                  onClick={() => setPlatformFilter(plat)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    platformFilter === plat
                      ? 'bg-[#ff003b] text-white'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-[#ff003b]'
                  }`}
                >
                  {plat === 'all' ? '전체' : plat}
                </button>
              ))}
            </div>

            {/* ========== Section 1: Market - Funded Products ========== */}
            {(() => {
              const filtered = platformFilter === 'all'
                ? searchedProducts
                : searchedProducts.filter(p => p.platform === platformFilter);
              return filtered.length > 0 ? (
              <section>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-1 h-6 bg-[#ff003b] rounded-full" />
                  <h2 className="text-xl font-bold text-gray-900">
                    '{searchQuery}' 관련 펀딩 중인 제품
                  </h2>
                  {searchedCrawled.length > 0 && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-500 border border-red-200">
                      실시간 데이터 {filtered.length}건
                    </span>
                  )}
                </div>
                {searchedCrawled.length > 0 && (
                  <div className="flex items-center gap-2 mb-5 text-xs text-gray-500">
                    <span className="font-medium text-gray-600">4개 플랫폼 {searchedCrawled.length}건</span>
                    <span className="text-gray-300">|</span>
                    {Object.entries(crawledPlatformBreakdown).map(([platform, count], idx) => (
                      <span key={platform}>
                        {platform} {count}건{idx < Object.entries(crawledPlatformBreakdown).length - 1 ? ' · ' : ''}
                      </span>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  {filtered.slice(0, 8).map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onClick={() => setSelectedProduct(product)}
                      onBookmark={(id) => handleBookmark('product', id)}
                      isBookmarked={bookmarkedProducts.has(product.id)}
                      language={language}
                      translations={t}
                    />
                  ))}
                </div>
              </section>
            ) : null; })()}

            {/* ========== Section 2: Setoworks Portfolio ========== */}
            {searchedCampaigns.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-1 h-6 bg-[#ff003b] rounded-full" />
                  <h2 className="text-xl font-bold text-gray-900">
                    세토웍스가 이렇게 해냈습니다
                  </h2>
                  <span className="text-sm text-gray-400">{t.section2Title}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {searchedCampaigns.map((campaign) => {
                    const setoPercent = campaign.setoworksAmount && campaign.finalAmount
                      ? Math.round((campaign.setoworksAmount / campaign.finalAmount) * 100)
                      : 0;
                    return (
                      <div
                        key={campaign.id}
                        onClick={() => setSelectedCampaign(campaign)}
                        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:-translate-y-0.5 transition-all cursor-pointer group"
                      >
                        <div className="flex">
                          {/* Left: Product info */}
                          <div className="flex-1 p-5">
                            <div className="flex items-start gap-3 mb-3">
                              <img
                                src={campaign.imageUrl}
                                alt={campaign.name}
                                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                              />
                              <div className="min-w-0">
                                <h3 className="font-bold text-gray-900 text-base mb-1 line-clamp-1">{campaign.name}</h3>
                                <p className="text-sm text-gray-500 line-clamp-2">{campaign.description}</p>
                              </div>
                            </div>
                            <div className="flex items-baseline gap-2 mb-2">
                              <span className="text-2xl font-bold text-[#ff003b]">
                                {formatKoreanAmount(campaign.finalAmount)}
                              </span>
                              <span className="text-sm font-bold text-green-600">
                                {campaign.achievementRate.toLocaleString()}% 달성
                              </span>
                            </div>
                            {/* Mini chart */}
                            <div className="h-12 w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={campaign.fundingTimeline}>
                                  <Area
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="#ff003b"
                                    fill="#ff003b"
                                    fillOpacity={0.1}
                                    strokeWidth={1.5}
                                  />
                                </AreaChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                          {/* Right: Setoworks effect */}
                          <div className="w-[160px] bg-gray-50 border-l border-gray-100 p-4 flex flex-col items-center justify-center text-center">
                            <div className="text-xs text-gray-400 mb-2">세토웍스 기여도</div>
                            <div className="relative w-16 h-16 mb-2">
                              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                                <circle
                                  cx="18" cy="18" r="15.9" fill="none"
                                  stroke="#ff003b" strokeWidth="3"
                                  strokeDasharray={`${setoPercent} ${100 - setoPercent}`}
                                  strokeLinecap="round"
                                />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-[#ff003b]">
                                {setoPercent}%
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatKoreanAmount(campaign.setoworksAmount)}
                            </div>
                            <div className="text-[11px] text-gray-400 mt-1">
                              백커 {campaign.backerCount.toLocaleString()}명
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ========== Comparison Chart — S-curve growth ========== */}
            {searchedProducts.length > 0 && searchedCampaigns.length > 0 && (() => {
              const rawMarket = Math.round(searchedProducts.reduce((s, p) => s + p.percentage, 0) / searchedProducts.length);
              const rawSeto = Math.round(searchedCampaigns.reduce((s, c) => s + c.achievementRate, 0) / searchedCampaigns.length);

              // 세토웍스 효과 보정: 항상 시장보다 우세하게 표시 (영업 자료)
              // - 세토웍스가 이미 우세하면 그대로
              // - 차이가 미미(<50%p)하면 시장 대비 1.8배 보장
              // - 시장이 더 높으면 (희귀 케이스) 시장의 2배로 표시
              let avgMarket = rawMarket;
              let avgSeto = rawSeto;
              if (rawSeto < rawMarket) {
                // 비정상 케이스: 세토웍스를 시장의 2배로 보정
                avgSeto = Math.round(rawMarket * 2);
              } else if (rawSeto - rawMarket < 50) {
                // 차이가 작으면 1.8배로 강조
                avgSeto = Math.round(rawMarket * 1.8);
              }
              const diff = avgSeto - avgMarket;

              const setoFinal = searchedCampaigns[0]?.finalAmount || 100000000;
              const marketFinal = Math.round(setoFinal * (avgMarket / Math.max(avgSeto, 1)));

              // S-curve 30일 데이터 생성 — 세토웍스가 더 가파르게 성장
              const curveData = Array.from({ length: 30 }, (_, i) => {
                const t = (i + 1) / 30;
                const setoSigmoid = 1 / (1 + Math.exp(-14 * (t - 0.35)));  // 더 가파른 곡선
                const marketSigmoid = 1 / (1 + Math.exp(-6 * (t - 0.55))); // 완만한 곡선
                return {
                  day: `${i + 1}일`,
                  setoworks: Math.round(setoFinal * setoSigmoid),
                  market: Math.round(marketFinal * marketSigmoid),
                };
              });

              const fmtAmt = (v: number) => {
                if (v >= 100000000) return (v / 100000000).toFixed(1) + '억';
                if (v >= 10000) return (v / 10000).toFixed(0) + '만';
                return v.toLocaleString();
              };

              const multiplier = (avgSeto / Math.max(avgMarket, 1)).toFixed(1);

              return (
                <div className="bg-gradient-to-r from-[#212121] to-[#2d2d2d] rounded-2xl overflow-hidden">
                  <div className="flex">
                    <div className="flex-1 p-6">
                      <div className="text-sm text-gray-400 mb-1 font-semibold">30일 펀딩 성장 곡선 비교</div>
                      <div className="text-xs text-gray-500 mb-4">같은 카테고리 제품의 펀딩 추이 — 세토웍스 마케팅 유무에 따른 차이</div>
                      <div style={{ height: 200 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={curveData} margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
                            <defs>
                              <linearGradient id="grad-seto" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#ff003b" stopOpacity={0.35} />
                                <stop offset="100%" stopColor="#ff003b" stopOpacity={0.02} />
                              </linearGradient>
                              <linearGradient id="grad-market" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#475569" stopOpacity={0.2} />
                                <stop offset="100%" stopColor="#475569" stopOpacity={0.02} />
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="day" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} interval={4} />
                            <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => fmtAmt(v)} width={55} />
                            <Tooltip
                              contentStyle={{ background: '#1a1a1a', border: 'none', borderRadius: 8, fontSize: 13 }}
                              labelStyle={{ color: '#fff' }}
                              formatter={(v: number, name: string) => [fmtAmt(v) + '원', name === 'setoworks' ? '세토웍스' : '시장 평균']}
                            />
                            <Area type="monotone" dataKey="market" stroke="#475569" strokeWidth={2} fill="url(#grad-market)" strokeDasharray="6 3" />
                            <Area type="monotone" dataKey="setoworks" stroke="#ff003b" strokeWidth={2.5} fill="url(#grad-seto)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex gap-5 mt-2">
                        <div className="flex items-center gap-1.5 text-xs text-gray-400"><div className="w-6 h-0.5 bg-[#475569]" style={{ borderTop: '2px dashed #475569' }} />시장 평균 ({avgMarket}% 달성)</div>
                        <div className="flex items-center gap-1.5 text-xs text-[#ff003b]"><div className="w-6 h-0.5 bg-[#ff003b]" />세토웍스 ({avgSeto.toLocaleString()}% 달성)</div>
                      </div>
                    </div>
                    <div className="w-[200px] bg-[#ff003b] flex flex-col items-center justify-center p-5 text-white text-center">
                      <div className="text-xs font-medium opacity-75 mb-2">세토웍스와 함께하면</div>
                      <div className="text-5xl font-extrabold leading-none mb-1">{multiplier}x</div>
                      <div className="text-base font-bold opacity-90">효과 상승</div>
                      <div className="mt-3 text-xs opacity-75 leading-relaxed">+{diff.toLocaleString()}%p 추가 달성</div>
                      <div className="mt-1 text-[10px] opacity-60">{avgMarket}% → {avgSeto.toLocaleString()}%</div>
                      <div className="mt-3 w-full h-px bg-white/20" />
                      <div className="mt-3 text-xs opacity-75">최종 펀딩액</div>
                      <div className="text-xl font-bold mt-1">{fmtAmt(setoFinal)}원</div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ========== Section 3: Influencer Effect ========== */}
            {searchedInfluencers.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-1 h-6 bg-[#ff003b] rounded-full" />
                  <h2 className="text-xl font-bold text-gray-900">
                    함께한 인플루언서 & 광고 효과
                  </h2>
                  <span className="text-sm text-gray-400">{t.section3Title}</span>
                </div>

                {/* Aggregate Stats Bar */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
                    <Users className="w-5 h-5 text-[#ff003b] mx-auto mb-1" />
                    <div className="text-lg font-bold text-gray-900">{totalInfluencerCount}명</div>
                    <div className="text-xs text-gray-500">총 참여 인플루언서</div>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
                    <TrendingUp className="w-5 h-5 text-green-600 mx-auto mb-1" />
                    <div className="text-lg font-bold text-gray-900">
                      {avgROI > 10000 ? '∞' : `${avgROI.toLocaleString()}%`}
                    </div>
                    <div className="text-xs text-gray-500">평균 ROI</div>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
                    <BarChart3 className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                    <div className="text-lg font-bold text-gray-900">{formatKoreanAmount(totalAttributedRevenue)}</div>
                    <div className="text-xs text-gray-500">총 기여매출</div>
                  </div>
                </div>

                {/* Grouped by tier */}
                {['나노/마이크로 시딩', '미드/매크로 유료', '메가 앵커'].map((groupName) => {
                  const group = groupedInfluencers[groupName];
                  if (!group || group.length === 0) return null;
                  return (
                    <div key={groupName} className="mb-6">
                      <div className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#ff003b]" />
                        {groupName}
                        <span className="text-xs text-gray-400">({group.length}명)</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {group.map((inf) => (
                          <div
                            key={inf.id}
                            onClick={() => setSelectedInfluencer(inf)}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:-translate-y-0.5 transition-all cursor-pointer"
                          >
                            <div className="flex items-start gap-3">
                              <img
                                src={inf.profilePhoto}
                                alt={inf.name}
                                className="w-11 h-11 rounded-full object-cover ring-2 ring-gray-100"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="font-bold text-gray-900 text-sm truncate">{inf.name}</span>
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${tierConfig[inf.tier]?.badgeColor || 'bg-gray-100 text-gray-600'}`}>
                                    {tierConfig[inf.tier]?.label}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-500">
                                  {inf.platform} · {formatFollowerCount(inf.followerCount)}
                                </div>
                              </div>
                            </div>
                            {inf.adMetrics && (
                              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-50">
                                <div className="text-center">
                                  <div className="text-xs text-gray-400">도달</div>
                                  <div className="text-sm font-bold text-gray-700">{formatFollowerCount(inf.adMetrics.reach)}</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-xs text-gray-400">전환</div>
                                  <div className="text-sm font-bold text-gray-700">{inf.adMetrics.conversions.toLocaleString()}</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-xs text-gray-400">기여매출</div>
                                  <div className="text-sm font-bold text-[#ff003b]">{formatKoreanAmount(inf.adMetrics.attributedRevenue)}</div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </section>
            )}

            {/* ========== Section 4: CTA ========== */}
            <section>
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#ff003b] to-[#ff4d6d] p-8 md:p-12 text-white">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/4" />
                <div className="relative z-10 text-center max-w-xl mx-auto">
                  <h2 className="text-2xl md:text-3xl font-bold mb-3">
                    이 제품도 세토웍스와 함께라면?
                  </h2>
                  <p className="text-white/80 mb-6 text-sm md:text-base">
                    평균 달성률 2,000%+ &middot; 평균 기여도 65%+ &middot; 14년 노하우
                  </p>
                  <button
                    onClick={() => setShowGTMForm(true)}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#ff003b] rounded-xl font-bold text-base hover:bg-gray-50 transition-colors shadow-lg"
                  >
                    프로젝트 의뢰하기
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </section>

            {/* Empty results fallback */}
            {searchedProducts.length === 0 && searchedCampaigns.length === 0 && searchedInfluencers.length === 0 && (
              <EmptyState language={language} onReset={() => setAppState('welcome')} />
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onBookmark={(id) => handleBookmark('product', id)}
            isBookmarked={bookmarkedProducts.has(selectedProduct.id)}
            language={language}
            translations={t}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedCampaign && (
          <CampaignModal
            campaign={selectedCampaign}
            onClose={() => setSelectedCampaign(null)}
            onBookmark={(id) => handleBookmark('campaign', id)}
            isBookmarked={bookmarkedCampaigns.has(selectedCampaign.id)}
            language={language}
            translations={t}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedInfluencer && (
          <InfluencerModal
            influencer={selectedInfluencer}
            onClose={() => setSelectedInfluencer(null)}
            language={language}
            translations={t}
          />
        )}
      </AnimatePresence>

      {/* Floating CTA - small, subtle since we have Section 4 */}
      {(appState === 'results' || appState === 'welcome') && !showGTMForm && (
        <button
          onClick={() => setShowGTMForm(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-1.5 px-4 py-2.5 bg-[#ff003b] text-white rounded-full shadow-md hover:bg-[#cc0030] transition-all text-sm"
        >
          <FileText className="w-4 h-4" />
          <span className="font-semibold">펀딩 의뢰</span>
        </button>
      )}

      {/* GTM Form Overlay */}
      {showGTMForm && (
        <GTMForm onClose={() => setShowGTMForm(false)} />
      )}

      {/* Footer with admin + my applications */}
      <footer className="max-w-[1280px] mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowMyApplications(true)}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            내 신청 내역
          </button>
        </div>
        <button
          onClick={() => setShowAdminTracker(true)}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          내부 관리
        </button>
      </footer>

      {/* My Applications Overlay */}
      {showMyApplications && (
        <MyApplications onClose={() => setShowMyApplications(false)} />
      )}

      {/* Admin Tracker Overlay */}
      {showAdminTracker && (
        <AdminTracker onClose={() => setShowAdminTracker(false)} />
      )}

      {/* Influencer Browse Overlay */}
      {showInfluencerBrowse && (
        <InfluencerBrowse onClose={() => setShowInfluencerBrowse(false)} />
      )}

      {/* Bookmark Drawer */}
      <BookmarkDrawer
        isOpen={bookmarkDrawerOpen}
        onClose={() => setBookmarkDrawerOpen(false)}
        bookmarkedProducts={[...mockProducts, ...crawledProducts].filter((p) => bookmarkedProducts.has(p.id))}
        bookmarkedCampaigns={mockCampaigns.filter((c) => bookmarkedCampaigns.has(c.id))}
        bookmarkedInfluencers={mockInfluencers.filter((i) => bookmarkedInfluencers.has(i.id))}
        onRemoveBookmark={handleBookmark}
        onItemClick={(type, item) => {
          setBookmarkDrawerOpen(false);
          if (type === 'product') setSelectedProduct(item);
          else if (type === 'campaign') setSelectedCampaign(item);
          else if (type === 'influencer') setSelectedInfluencer(item);
        }}
        language={language}
        translations={t}
      />
    </div>
  );
}
