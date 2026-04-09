import { useState, useMemo } from 'react';
import { X, Search, ExternalLink, ChevronDown, ChevronUp, Youtube, Instagram, Facebook } from 'lucide-react';
import { mockInfluencers } from '../mockData';
import { Influencer, SocialPlatform } from '../types';

interface InfluencerBrowseProps {
  onClose: () => void;
}

const tierConfig: Record<string, { label: string; color: string; badgeColor: string }> = {
  nano: { label: '나노', color: 'text-emerald-600', badgeColor: 'bg-emerald-100 text-emerald-700' },
  micro: { label: '마이크로', color: 'text-teal-600', badgeColor: 'bg-teal-100 text-teal-700' },
  mid: { label: '미드', color: 'text-blue-600', badgeColor: 'bg-blue-100 text-blue-700' },
  macro: { label: '매크로', color: 'text-amber-600', badgeColor: 'bg-amber-100 text-amber-700' },
  mega: { label: '메가', color: 'text-red-600', badgeColor: 'bg-red-100 text-red-700' },
};

const tierOrder = ['nano', 'micro', 'mid', 'macro', 'mega'];

const platformIcons: Record<string, React.ReactNode> = {
  YouTube: <Youtube className="w-3.5 h-3.5 text-red-500" />,
  Instagram: <Instagram className="w-3.5 h-3.5 text-pink-500" />,
  Facebook: <Facebook className="w-3.5 h-3.5 text-blue-600" />,
  TikTok: <span className="text-[10px] font-bold text-gray-800">TT</span>,
  Threads: <span className="text-[10px] font-bold text-gray-800">Th</span>,
  Dcard: <span className="text-[10px] font-bold text-teal-600">Dc</span>,
};

function formatFollowerCount(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function formatKoreanAmount(num: number): string {
  if (num >= 100000000) {
    const eok = num / 100000000;
    return eok % 1 === 0 ? `${eok}억` : `${eok.toFixed(1)}억`;
  } else if (num >= 10000) {
    const man = Math.round(num / 10000);
    return `${man.toLocaleString()}만`;
  }
  return num.toLocaleString('ko-KR');
}

const allCategories = ['전체', 'tech', 'lifestyle', 'food', 'beauty', 'game', 'fashion', 'camping'];

export function InfluencerBrowse({ onClose }: InfluencerBrowseProps) {
  const [tierFilter, setTierFilter] = useState<string>('전체');
  const [platformFilter, setPlatformFilter] = useState<string>('전체');
  const [categoryFilter, setCategoryFilter] = useState<string>('전체');
  const [sourceFilter, setSourceFilter] = useState<string>('전체');
  const [searchText, setSearchText] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return mockInfluencers.filter((inf) => {
      if (tierFilter !== '전체' && tierConfig[inf.tier]?.label !== tierFilter) return false;
      if (platformFilter !== '전체' && inf.platform !== platformFilter) return false;
      if (categoryFilter !== '전체' && inf.category !== categoryFilter) return false;
      if (sourceFilter === '실제 데이터' && inf.source !== 'real') return false;
      if (sourceFilter === '목업' && inf.source === 'real') return false;
      if (searchText.trim()) {
        const q = searchText.toLowerCase();
        if (!inf.name.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [tierFilter, platformFilter, categoryFilter, sourceFilter, searchText]);

  const realCount = mockInfluencers.filter((i) => i.source === 'real').length;
  const filteredRealCount = filtered.filter((i) => i.source === 'real').length;
  const avgER = filtered.length > 0
    ? (filtered.reduce((s, i) => s + i.engagementRate, 0) / filtered.length).toFixed(1)
    : '0';
  const tierCounts = tierOrder.reduce<Record<string, number>>((acc, t) => {
    acc[t] = filtered.filter((i) => i.tier === t).length;
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center overflow-y-auto">
      <div className="w-full max-w-[1200px] min-h-screen bg-[#F5F7FA] my-0">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">인플루언서 DB</h1>
            <span className="px-2.5 py-1 bg-[#ff003b] text-white text-xs font-bold rounded-full">
              {filtered.length}명
            </span>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="bg-white border-b border-gray-100 px-6 py-4 space-y-3">
          {/* Row 1: Tier */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-gray-500 w-14 flex-shrink-0">등급</span>
            {['전체', '나노', '마이크로', '미드', '매크로', '메가'].map((t) => (
              <button
                key={t}
                onClick={() => setTierFilter(t)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  tierFilter === t
                    ? 'bg-[#ff003b] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Row 2: Platform */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-gray-500 w-14 flex-shrink-0">플랫폼</span>
            {['전체', 'YouTube', 'Instagram', 'TikTok', 'Facebook', 'Threads', 'Dcard'].map((p) => (
              <button
                key={p}
                onClick={() => setPlatformFilter(p)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  platformFilter === p
                    ? 'bg-[#ff003b] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Row 3: Category + Source + Search */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-semibold text-gray-500 w-14 flex-shrink-0">카테고리</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-700 bg-white focus:outline-none focus:border-[#ff003b]"
            >
              {allCategories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <span className="text-xs text-gray-300 mx-1">|</span>
            <span className="text-xs font-semibold text-gray-500">소스</span>
            {['전체', '실제 데이터', '목업'].map((s) => (
              <button
                key={s}
                onClick={() => setSourceFilter(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  sourceFilter === s
                    ? 'bg-[#ff003b] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {s}
              </button>
            ))}

            <span className="text-xs text-gray-300 mx-1">|</span>
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="이름으로 검색..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-[#ff003b]"
              />
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="px-6 py-6">
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg font-semibold mb-2">검색 결과 없음</p>
              <p className="text-sm">필터 조건을 변경해 보세요.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((inf) => (
                <InfluencerGridCard
                  key={inf.id}
                  influencer={inf}
                  isExpanded={expandedId === inf.id}
                  onToggle={() => setExpandedId(expandedId === inf.id ? null : inf.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Bottom stats bar */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-3 flex items-center gap-4 text-xs text-gray-500 flex-wrap">
          <span>총: <strong className="text-gray-900">{filtered.length}명</strong></span>
          <span className="text-gray-300">|</span>
          <span>실제 데이터: <strong className="text-green-600">{filteredRealCount}명</strong></span>
          <span className="text-gray-300">|</span>
          <span>평균 ER: <strong className="text-gray-900">{avgER}%</strong></span>
          <span className="text-gray-300">|</span>
          {tierOrder.map((t) => (
            <span key={t}>
              {tierConfig[t].label}: <strong>{tierCounts[t]}</strong>
              {t !== 'mega' && <span className="mx-1">/</span>}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function InfluencerGridCard({
  influencer: inf,
  isExpanded,
  onToggle,
}: {
  influencer: Influencer;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const tier = tierConfig[inf.tier];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      {/* Main card */}
      <div className="p-4 cursor-pointer" onClick={onToggle}>
        <div className="flex items-start gap-3">
          {/* Profile photo + platform badge */}
          <div className="relative flex-shrink-0">
            <img
              src={inf.profilePhoto}
              alt={inf.name}
              className="w-11 h-11 rounded-full object-cover ring-2 ring-gray-100"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-white border border-gray-200 flex items-center justify-center">
              {platformIcons[inf.platform] || <span className="text-[8px]">{inf.platform[0]}</span>}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="font-bold text-gray-900 text-sm truncate">{inf.name}</span>
              {inf.source === 'real' && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-green-100 text-green-700 flex-shrink-0">
                  실측
                </span>
              )}
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold flex-shrink-0 ${tier?.badgeColor || 'bg-gray-100 text-gray-600'}`}>
                {tier?.label}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              {inf.platform} · {inf.category}
            </div>
          </div>

          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-50">
          <div className="text-center">
            <div className="text-[10px] text-gray-400">팔로워</div>
            <div className="text-sm font-bold text-gray-700">{formatFollowerCount(inf.followerCount)}</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-gray-400">ER</div>
            <div className="text-sm font-bold text-gray-700">{inf.engagementRate}%</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-gray-400">평균 조회</div>
            <div className="text-sm font-bold text-gray-700">{formatFollowerCount(inf.averageViews)}</div>
          </div>
        </div>

        {/* Ad metrics row (if exists) */}
        {inf.adMetrics && (
          <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-gray-50">
            <div className="text-center">
              <div className="text-[10px] text-gray-400">도달</div>
              <div className="text-xs font-bold text-gray-600">{formatFollowerCount(inf.adMetrics.reach)}</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] text-gray-400">전환</div>
              <div className="text-xs font-bold text-gray-600">{inf.adMetrics.conversions.toLocaleString()}</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] text-gray-400">ROI</div>
              <div className="text-xs font-bold text-[#ff003b]">
                {inf.adMetrics.roi === Infinity || inf.adMetrics.roi > 100000 ? '무료' : `${inf.adMetrics.roi.toLocaleString()}%`}
              </div>
            </div>
          </div>
        )}

        {/* Campaign tags */}
        {inf.campaigns && inf.campaigns.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {inf.campaigns.map((cam) => (
              <span key={cam.campaignId} className="px-2 py-0.5 bg-gray-50 text-[10px] text-gray-500 rounded-full border border-gray-100">
                {cam.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="border-t border-gray-100 bg-gray-50 p-4 space-y-3">
          {/* Cost info */}
          <div className="text-xs text-gray-600">
            <span className="font-semibold">단가:</span>{' '}
            {inf.costPerPost > 0 ? `${formatKoreanAmount(inf.costPerPost)}원/건` : '무료 시딩'}
          </div>

          {/* Ad metrics detail */}
          {inf.adMetrics && (
            <div className="bg-white rounded-lg p-3 text-xs space-y-1">
              <div className="font-semibold text-gray-700 mb-2">광고 성과</div>
              <div className="grid grid-cols-2 gap-2">
                <div>도달: <strong>{inf.adMetrics.reach.toLocaleString()}</strong></div>
                <div>클릭: <strong>{inf.adMetrics.clicks.toLocaleString()}</strong></div>
                <div>전환: <strong>{inf.adMetrics.conversions.toLocaleString()}</strong></div>
                <div>기여매출: <strong className="text-[#ff003b]">{formatKoreanAmount(inf.adMetrics.attributedRevenue)}원</strong></div>
                <div>ROI: <strong>{inf.adMetrics.roi === Infinity || inf.adMetrics.roi > 100000 ? '무한 (무료)' : `${inf.adMetrics.roi.toLocaleString()}%`}</strong></div>
                <div>CPA: <strong>{inf.adMetrics.costPerAcquisition > 0 ? `${inf.adMetrics.costPerAcquisition.toLocaleString()}원` : '-'}</strong></div>
              </div>
            </div>
          )}

          {/* Content thumbnails */}
          {inf.content && inf.content.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-gray-700 mb-2">콘텐츠</div>
              <div className="flex gap-2 overflow-x-auto">
                {inf.content.map((c) => (
                  <div key={c.id} className="flex-shrink-0 w-32">
                    <img src={c.thumbnailUrl} alt="" className="w-32 h-20 rounded-lg object-cover" />
                    <div className="text-[10px] text-gray-500 mt-1">
                      조회 {c.viewCount.toLocaleString()} · 좋아요 {c.likeCount.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Channel link */}
          {inf.content?.[0]?.url && inf.content[0].url !== '#' && (
            <a
              href={inf.content[0].url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              채널 바로가기
            </a>
          )}

          {/* Campaign participation */}
          {inf.campaigns && inf.campaigns.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-gray-700 mb-2">캠페인 참여</div>
              <div className="space-y-1.5">
                {inf.campaigns.map((cam) => (
                  <div key={cam.campaignId} className="flex items-center gap-2 bg-white rounded-lg p-2">
                    <img src={cam.imageUrl} alt="" className="w-10 h-7 rounded object-cover" />
                    <div>
                      <div className="text-xs font-medium text-gray-800">{cam.name}</div>
                      <div className="text-[10px] text-gray-500">{cam.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
