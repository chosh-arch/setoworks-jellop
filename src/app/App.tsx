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
import { Language, Product, Campaign, Influencer } from './types';

type AppState = 'welcome' | 'loading' | 'results' | 'empty';

function matchProduct(p: Product, q: string): boolean {
  return (
    p.name.toLowerCase().includes(q) ||
    p.description.toLowerCase().includes(q) ||
    p.tags.some((tag) => tag.toLowerCase().includes(q))
  );
}

function matchCampaign(c: Campaign, q: string): boolean {
  return (
    c.name.toLowerCase().includes(q) ||
    c.description.toLowerCase().includes(q) ||
    c.tags.some((tag) => tag.toLowerCase().includes(q))
  );
}

function matchInfluencer(inf: Influencer, q: string): boolean {
  return (
    inf.name.toLowerCase().includes(q) ||
    inf.category.toLowerCase().includes(q) ||
    inf.platform.toLowerCase().includes(q) ||
    (inf.campaigns?.some((cam) => cam.name.toLowerCase().includes(q)) ?? false)
  );
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

  // Bookmarks
  const [bookmarkedProducts, setBookmarkedProducts] = useState<Set<string>>(new Set());
  const [bookmarkedCampaigns, setBookmarkedCampaigns] = useState<Set<string>>(new Set());
  const [bookmarkedInfluencers, setBookmarkedInfluencers] = useState<Set<string>>(new Set());

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
      const hasCampaigns = mockCampaigns.some((c) => matchCampaign(c, q));
      const hasInfluencers = mockInfluencers.some((inf) => matchInfluencer(inf, q));
      if (hasProducts || hasCampaigns || hasInfluencers) {
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
  const searchedProducts = q ? mockProducts.filter((p) => matchProduct(p, q)) : mockProducts;
  const searchedCampaigns = q ? mockCampaigns.filter((c) => matchCampaign(c, q)) : mockCampaigns;
  const searchedInfluencers = q ? mockInfluencers.filter((inf) => matchInfluencer(inf, q)) : mockInfluencers;

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

            {/* ========== Section 1: Market - Funded Products ========== */}
            {searchedProducts.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-1 h-6 bg-[#ff003b] rounded-full" />
                  <h2 className="text-xl font-bold text-gray-900">
                    '{searchQuery}' 관련 펀딩 중인 제품
                  </h2>
                  <span className="text-sm text-gray-400">{t.section1Title}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  {searchedProducts.slice(0, 4).map((product) => (
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
            )}

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
              const avgMarket = Math.round(searchedProducts.reduce((s, p) => s + p.percentage, 0) / searchedProducts.length);
              const avgSeto = Math.round(searchedCampaigns.reduce((s, c) => s + c.achievementRate, 0) / searchedCampaigns.length);
              const setoFinal = searchedCampaigns[0]?.finalAmount || 100000000;
              const marketFinal = Math.round(setoFinal * (avgMarket / Math.max(avgSeto, 1)));
              const diff = avgSeto - avgMarket;

              // S-curve 30일 데이터 생성
              const curveData = Array.from({ length: 30 }, (_, i) => {
                const t = (i + 1) / 30;
                const sigmoid = 1 / (1 + Math.exp(-12 * (t - 0.4)));
                const marketSigmoid = 1 / (1 + Math.exp(-8 * (t - 0.5)));
                return {
                  day: `${i + 1}일`,
                  setoworks: Math.round(setoFinal * sigmoid),
                  market: Math.round(marketFinal * marketSigmoid),
                };
              });

              const fmtAmt = (v: number) => {
                if (v >= 100000000) return (v / 100000000).toFixed(1) + '억';
                if (v >= 10000) return (v / 10000).toFixed(0) + '만';
                return v.toLocaleString();
              };

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
                      <div className="text-5xl font-extrabold leading-none mb-1">+{diff.toLocaleString()}</div>
                      <div className="text-base font-bold opacity-90">%p</div>
                      <div className="mt-3 text-xs opacity-65 leading-relaxed">{avgMarket}% → {avgSeto.toLocaleString()}%</div>
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
        bookmarkedProducts={mockProducts.filter((p) => bookmarkedProducts.has(p.id))}
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
