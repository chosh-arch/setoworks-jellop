import { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { FileText } from 'lucide-react';
import { Header } from './components/Header';
import { ProductCard } from './components/ProductCard';
import { CampaignCard } from './components/CampaignCard';
import { InfluencerCard } from './components/InfluencerCard';
import { ProductModal } from './components/ProductModal';
import { CampaignModal } from './components/CampaignModal';
import { InfluencerModal } from './components/InfluencerModal';
import { BookmarkDrawer } from './components/BookmarkDrawer';
import { SkeletonCard } from './components/SkeletonCard';
import { EmptyState } from './components/EmptyState';
import { WelcomeState } from './components/WelcomeState';
import { GTMForm } from './components/GTMForm';
import { mockProducts, mockCampaigns, mockInfluencers } from './mockData';
import { translations } from './translations';
import { Language, Product, Campaign, Influencer, SocialPlatform, Category } from './types';

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

  // Filters for influencers
  const [platformFilter, setPlatformFilter] = useState<'all' | SocialPlatform>('all');
  const [tierFilter, setTierFilter] = useState<'all' | 'nano' | 'micro' | 'mid' | 'macro' | 'mega'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | Category>('all');

  // Expanded sections
  const [expandedSections, setExpandedSections] = useState({
    products: false,
    campaigns: false,
    influencers: false,
  });

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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setAppState('loading');

    // Simulate loading
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
    }, 1500);
  };

  const handleBookmark = (type: 'product' | 'campaign' | 'influencer', id: string) => {
    if (type === 'product') {
      setBookmarkedProducts((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
    } else if (type === 'campaign') {
      setBookmarkedCampaigns((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
    } else if (type === 'influencer') {
      setBookmarkedInfluencers((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
    }
  };

  // Search-based filtering
  const q = searchQuery.toLowerCase().trim();
  const searchedProducts = q ? mockProducts.filter((p) => matchProduct(p, q)) : mockProducts;
  const searchedCampaigns = q ? mockCampaigns.filter((c) => matchCampaign(c, q)) : mockCampaigns;
  const searchedInfluencers = q ? mockInfluencers.filter((inf) => matchInfluencer(inf, q)) : mockInfluencers;

  const filteredInfluencers = searchedInfluencers.filter((inf) => {
    if (platformFilter !== 'all' && inf.platform !== platformFilter) return false;
    if (tierFilter !== 'all' && inf.tier !== tierFilter) return false;
    if (categoryFilter !== 'all' && inf.category !== categoryFilter) return false;
    return true;
  });

  const displayProducts = expandedSections.products ? searchedProducts : searchedProducts.slice(0, 4);
  const displayCampaigns = expandedSections.campaigns ? searchedCampaigns : searchedCampaigns.slice(0, 4);
  const displayInfluencers = expandedSections.influencers ? filteredInfluencers : filteredInfluencers.slice(0, 6);

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
          <div className="space-y-12">
            {/* Section 1 Skeleton */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
                <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            </section>

            {/* Section 2 Skeleton */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
                <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            </section>

            {/* Section 3 Skeleton */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
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
          <div className="space-y-12">
            {/* Section 1: Similar Funded Products */}
            {searchedProducts.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {q ? `'${searchQuery}' 검색 결과 — ${t.section1Title}` : t.section1Title}
                </h2>
                <span className="px-3 py-1 bg-[#ff003b] text-white rounded-full text-sm">
                  {t.totalCount.replace('{count}', searchedProducts.length.toString())}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {displayProducts.map((product) => (
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
              {searchedProducts.length > 4 && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={() =>
                      setExpandedSections((prev) => ({ ...prev, products: !prev.products }))
                    }
                    className="px-6 py-3 bg-white text-gray-700 rounded-xl border-2 border-gray-200 hover:border-[#ff003b] hover:text-[#ff003b] transition-all"
                  >
                    {expandedSections.products
                      ? (language === 'ko' ? '접기' : language === 'ja' ? '折りたたむ' : language === 'zh' ? '收起' : 'Show Less')
                      : t.seeMore}
                  </button>
                </div>
              )}
            </section>
            )}

            {/* Section 2: Our Past Campaigns */}
            {searchedCampaigns.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {q ? `'${searchQuery}' 검색 결과 — ${t.section2Title}` : t.section2Title}
                </h2>
                <span className="px-3 py-1 bg-[#ff003b] text-white rounded-full text-sm">
                  {t.totalCount.replace('{count}', searchedCampaigns.length.toString())}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {displayCampaigns.map((campaign) => (
                  <CampaignCard
                    key={campaign.id}
                    campaign={campaign}
                    onClick={() => setSelectedCampaign(campaign)}
                    onBookmark={(id) => handleBookmark('campaign', id)}
                    isBookmarked={bookmarkedCampaigns.has(campaign.id)}
                    language={language}
                    translations={t}
                  />
                ))}
              </div>
              {searchedCampaigns.length > 4 && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={() =>
                      setExpandedSections((prev) => ({ ...prev, campaigns: !prev.campaigns }))
                    }
                    className="px-6 py-3 bg-white text-gray-700 rounded-xl border-2 border-gray-200 hover:border-[#ff003b] hover:text-[#ff003b] transition-all"
                  >
                    {expandedSections.campaigns
                      ? (language === 'ko' ? '접기' : language === 'ja' ? '折りたたむ' : language === 'zh' ? '收起' : 'Show Less')
                      : t.seeMore}
                  </button>
                </div>
              )}
            </section>
            )}

            {/* Section 3: Related Influencers */}
            {filteredInfluencers.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {q ? `'${searchQuery}' 검색 결과 — ${t.section3Title}` : t.section3Title}
                </h2>
                <span className="px-3 py-1 bg-[#ff003b] text-white rounded-full text-sm">
                  {t.totalCount.replace('{count}', filteredInfluencers.length.toString())}
                </span>
              </div>

              {/* Filter Bar */}
              <div className="flex flex-wrap gap-2 mb-6">
                <button
                  onClick={() => {
                    setPlatformFilter('all');
                    setTierFilter('all');
                    setCategoryFilter('all');
                  }}
                  className={`px-4 py-2 rounded-full text-sm transition-all ${
                    platformFilter === 'all' && tierFilter === 'all' && categoryFilter === 'all'
                      ? 'bg-[#ff003b] text-white'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-[#ff003b]'
                  }`}
                >
                  {t.filterAll}
                </button>

                {/* Tier Filters */}
                {([
                  { key: 'nano' as const, label: '나노 1K~10K', color: 'bg-emerald-500' },
                  { key: 'micro' as const, label: '마이크로 10K~50K', color: 'bg-teal-500' },
                  { key: 'mid' as const, label: '미드 50K~300K', color: 'bg-blue-500' },
                  { key: 'macro' as const, label: '매크로 300K~1M', color: 'bg-amber-500' },
                  { key: 'mega' as const, label: '메가 1M+', color: 'bg-red-500' },
                ]).map((tier) => (
                  <button
                    key={tier.key}
                    onClick={() => setTierFilter(tierFilter === tier.key ? 'all' : tier.key)}
                    className={`px-4 py-2 rounded-full text-sm transition-all ${
                      tierFilter === tier.key
                        ? 'bg-[#ff003b] text-white'
                        : 'bg-white text-gray-700 border border-gray-200 hover:border-[#ff003b]'
                    }`}
                  >
                    {tier.label}
                  </button>
                ))}

                <span className="text-gray-300 self-center">|</span>

                {/* Platform Filters */}
                {(['YouTube', 'Instagram', 'TikTok', 'Facebook', 'Threads', 'Dcard'] as SocialPlatform[]).map((platform) => (
                  <button
                    key={platform}
                    onClick={() => setPlatformFilter(platformFilter === platform ? 'all' : platform)}
                    className={`px-4 py-2 rounded-full text-sm transition-all ${
                      platformFilter === platform
                        ? 'bg-[#ff003b] text-white'
                        : 'bg-white text-gray-700 border border-gray-200 hover:border-[#ff003b]'
                    }`}
                  >
                    {platform}
                  </button>
                ))}

                {/* Category Dropdown */}
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as 'all' | Category)}
                  className="px-4 py-2 rounded-full text-sm bg-white text-gray-700 border border-gray-200 hover:border-[#ff003b] cursor-pointer transition-all"
                >
                  <option value="all">
                    {language === 'ko' ? '카테고리' : language === 'ja' ? 'カテゴリー' : language === 'zh' ? '类别' : 'Category'}
                  </option>
                  <option value="tech">{language === 'ko' ? '테크' : 'Tech'}</option>
                  <option value="lifestyle">{language === 'ko' ? '라이프스타일' : 'Lifestyle'}</option>
                  <option value="beauty">{language === 'ko' ? '뷰티' : 'Beauty'}</option>
                  <option value="food">{language === 'ko' ? '푸드' : 'Food'}</option>
                  <option value="game">{language === 'ko' ? '게임' : 'Game'}</option>
                  <option value="fashion">{language === 'ko' ? '패션' : 'Fashion'}</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayInfluencers.map((influencer) => (
                  <InfluencerCard
                    key={influencer.id}
                    influencer={influencer}
                    onClick={() => setSelectedInfluencer(influencer)}
                    onBookmark={(id) => handleBookmark('influencer', id)}
                    isBookmarked={bookmarkedInfluencers.has(influencer.id)}
                    language={language}
                    translations={t}
                  />
                ))}
              </div>
              {filteredInfluencers.length > 6 && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={() =>
                      setExpandedSections((prev) => ({ ...prev, influencers: !prev.influencers }))
                    }
                    className="px-6 py-3 bg-white text-gray-700 rounded-xl border-2 border-gray-200 hover:border-[#ff003b] hover:text-[#ff003b] transition-all"
                  >
                    {expandedSections.influencers
                      ? (language === 'ko' ? '접기' : language === 'ja' ? '折りたたむ' : language === 'zh' ? '收起' : 'Show Less')
                      : t.seeMore}
                  </button>
                </div>
              )}
            </section>
            )}

            {/* Empty results after filtering */}
            {searchedProducts.length === 0 && searchedCampaigns.length === 0 && filteredInfluencers.length === 0 && (
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

      {/* GTM Form Floating Button */}
      {(appState === 'results' || appState === 'welcome') && !showGTMForm && (
        <button
          onClick={() => setShowGTMForm(true)}
          className="fixed bottom-8 right-8 z-40 flex items-center gap-2 px-6 py-4 bg-[#ff003b] text-white rounded-full shadow-lg hover:bg-[#cc0030] transition-all hover:scale-105"
        >
          <FileText className="w-5 h-5" />
          <span className="font-bold">크라우드펀딩 요청 시작하기</span>
        </button>
      )}

      {/* GTM Form Overlay */}
      {showGTMForm && (
        <GTMForm onClose={() => setShowGTMForm(false)} />
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
