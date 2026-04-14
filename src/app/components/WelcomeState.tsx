import { Search, TrendingUp } from 'lucide-react';
import { Language } from '../types';

interface TrendingItem {
  name: string;
  platform: string;
  currentAmount: string;
  growthRate: number;
}

const trendingItems: TrendingItem[] = [
  { name: '큐비오X 포터블 CNC 레이저', platform: 'Kickstarter', currentAmount: '30억+', growthRate: 5000 },
  { name: '한셉트 제로 MK2 폴더블 펜', platform: 'Kickstarter', currentAmount: '$161K', growthRate: 2729 },
  { name: 'GADOL 가돌 360° 진동 스피커', platform: 'Kickstarter', currentAmount: '$120K', growthRate: 1600 },
  { name: 'PACER 페이서 호흡 분석기', platform: 'Kickstarter', currentAmount: '$110K', growthRate: 1500 },
  { name: 'VANZY 반지 2.0 제스처 마우스', platform: 'Kickstarter', currentAmount: '$82K', growthRate: 820 },
  { name: '젠히트 GenHeat 초슬림 온열패드', platform: '5개국 멀티', currentAmount: '6억+', growthRate: 600 },
];

interface WelcomeStateProps {
  language: Language;
  onSampleSearch: (query: string) => void;
}

export function WelcomeState({ language, onSampleSearch }: WelcomeStateProps) {
  const content = {
    ko: {
      tagline: '글로벌 크라우드펀딩의 시작',
      searchPlaceholder: '제품명을 검색하세요',
      searchButton: '검색',
      sampleLabel: '예시',
      samples: ['큐비오', '한셉트', '가돌', '페이서', '반지'],
      stat1Value: '14년',
      stat1Label: '업력',
      stat2Value: '1,200건+',
      stat2Label: '프로젝트',
      stat3Value: '520억원',
      stat3Label: '누적 펀딩',
      trendLabel: '실시간 펀딩 트렌드',
    },
    en: {
      tagline: 'Global Crowdfunding Starts Here',
      searchPlaceholder: 'Search product name',
      searchButton: 'Search',
      sampleLabel: 'Try',
      samples: ['Cubiio', 'Hancept', 'GADOL', 'PACER', 'VANZY'],
      stat1Value: '14 yrs',
      stat1Label: 'Experience',
      stat2Value: '1,200+',
      stat2Label: 'Projects',
      stat3Value: '$40M+',
      stat3Label: 'Total Funded',
      trendLabel: 'Live Funding Trends',
    },
    ja: {
      tagline: 'グローバルクラウドファンディングの始まり',
      searchPlaceholder: '製品名を検索',
      searchButton: '検索',
      sampleLabel: '例',
      samples: ['キュビオ', 'ハンセプト', 'ガドル', 'ペイサー', 'バンジ'],
      stat1Value: '14年',
      stat1Label: '業歴',
      stat2Value: '1,200件+',
      stat2Label: 'プロジェクト',
      stat3Value: '520億',
      stat3Label: '累計資金',
      trendLabel: 'リアルタイムトレンド',
    },
    zh: {
      tagline: '全球众筹从这里开始',
      searchPlaceholder: '搜索产品名称',
      searchButton: '搜索',
      sampleLabel: '示例',
      samples: ['Cubiio', 'Hancept', 'GADOL', 'PACER', 'VANZY'],
      stat1Value: '14年',
      stat1Label: '经验',
      stat2Value: '1,200+',
      stat2Label: '项目',
      stat3Value: '520亿',
      stat3Label: '累计资金',
      trendLabel: '实时众筹趋势',
    },
  };

  const msg = content[language];

  const marqueeItems = [...trendingItems, ...trendingItems];

  const handleSampleClick = (sample: string) => {
    onSampleSearch(sample);
  };

  return (
    <div className="flex flex-col">
      {/* Hero: Logo + Tagline + Search */}
      <div className="flex flex-col items-center justify-center pt-16 pb-12 text-center max-w-2xl mx-auto">
        <img
          src="/setoworks_logo.png"
          alt="SETOWORKS"
          className="h-12 mb-6"
        />
        <p className="text-lg text-gray-500 mb-8 tracking-wide">{msg.tagline}</p>

        {/* Search Bar */}
        <div className="w-full flex gap-2 mb-5">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={msg.searchPlaceholder}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-[#ff003b] focus:outline-none transition-colors text-base"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = (e.target as HTMLInputElement).value.trim();
                  if (val) onSampleSearch(val);
                }
              }}
            />
          </div>
          <button
            onClick={() => {
              const input = document.querySelector<HTMLInputElement>('.welcome-search-input');
              if (input?.value.trim()) onSampleSearch(input.value.trim());
            }}
            className="px-6 py-3.5 bg-[#ff003b] text-white rounded-xl font-bold hover:bg-[#cc0030] transition-colors"
          >
            {msg.searchButton}
          </button>
        </div>

        {/* Sample Keywords */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <span className="text-sm text-gray-400">{msg.sampleLabel}:</span>
          {msg.samples.map((sample, index) => (
            <button
              key={index}
              onClick={() => handleSampleClick(sample)}
              className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-600 hover:border-[#ff003b] hover:text-[#ff003b] transition-all"
            >
              {sample}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="w-full max-w-[720px] mx-auto mb-12">
        <div className="grid grid-cols-3 bg-white rounded-xl shadow-sm border border-gray-100 divide-x divide-gray-100">
          <div className="py-6 text-center">
            <div className="text-2xl font-bold text-gray-900">{msg.stat1Value}</div>
            <div className="text-sm text-gray-500 mt-1">{msg.stat1Label}</div>
          </div>
          <div className="py-6 text-center">
            <div className="text-2xl font-bold text-[#ff003b]">{msg.stat2Value}</div>
            <div className="text-sm text-gray-500 mt-1">{msg.stat2Label}</div>
          </div>
          <div className="py-6 text-center">
            <div className="text-2xl font-bold text-gray-900">{msg.stat3Value}</div>
            <div className="text-sm text-gray-500 mt-1">{msg.stat3Label}</div>
          </div>
        </div>
      </div>

      {/* Trending Marquee (single row, subtle) */}
      <div className="w-full max-w-[1280px] mx-auto pb-8">
        <div className="flex items-center gap-2 mb-3 px-2">
          <TrendingUp className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400">{msg.trendLabel}</span>
        </div>
        <div className="overflow-hidden relative">
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#F5F7FA] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#F5F7FA] to-transparent z-10 pointer-events-none" />
          <div
            className="flex gap-3 w-max"
            style={{ animation: 'marqueeScroll 35s linear infinite' }}
          >
            {marqueeItems.map((item, idx) => (
              <div
                key={idx}
                className="flex-shrink-0 flex items-center gap-3 px-4 py-2 bg-white/70 rounded-lg border border-gray-100 text-sm"
              >
                <span className="font-medium text-gray-700 whitespace-nowrap">{item.name}</span>
                <span className="text-gray-400">{item.platform}</span>
                <span className="font-bold text-[#ff003b]">{item.currentAmount}</span>
                <span className="text-xs text-green-600 font-medium flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" />
                  {item.growthRate}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marqueeScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
