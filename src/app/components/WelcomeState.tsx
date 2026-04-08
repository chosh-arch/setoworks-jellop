import { Search, Sparkles, Clock, TrendingUp, Flame } from 'lucide-react';
import { Language } from '../types';

interface NewLaunch {
  name: string;
  platform: string;
  fundingGoal: string;
  hoursAgo: number;
  imageUrl: string;
}

interface TrendingProduct {
  name: string;
  platform: string;
  imageUrl: string;
  growthRate: number;
  currentAmount: string;
  backerCount: number;
  daysLive: number;
}

const newLaunches: NewLaunch[] = [
  { name: 'AirRing 360 무선 순환팬', platform: 'Kickstarter', fundingGoal: '$15,000', hoursAgo: 2, imageUrl: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=320&h=180&fit=crop' },
  { name: 'NoteSync E-Ink 태블릿', platform: 'Wadiz', fundingGoal: '2,000만원', hoursAgo: 5, imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=320&h=180&fit=crop' },
  { name: 'PureSleep 수면 트래커', platform: 'Indiegogo', fundingGoal: '$25,000', hoursAgo: 8, imageUrl: 'https://images.unsplash.com/photo-1557438159-51eec7a6c9e8?w=320&h=180&fit=crop' },
  { name: 'MagStand 무선충전 거치대', platform: 'Kickstarter', fundingGoal: '$10,000', hoursAgo: 11, imageUrl: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=320&h=180&fit=crop' },
  { name: 'CampLite LED 랜턴', platform: 'Makuake', fundingGoal: '¥1,500,000', hoursAgo: 14, imageUrl: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=320&h=180&fit=crop' },
  { name: 'SmartMug 온도유지 텀블러', platform: 'Wadiz', fundingGoal: '1,500만원', hoursAgo: 18, imageUrl: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=320&h=180&fit=crop' },
  { name: 'FlexKey 폴더블 키보드', platform: 'Kickstarter', fundingGoal: '$20,000', hoursAgo: 20, imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=320&h=180&fit=crop' },
  { name: 'AquaFilter 휴대 정수기', platform: 'Indiegogo', fundingGoal: '$12,000', hoursAgo: 22, imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=320&h=180&fit=crop' },
];

const trendingProducts: TrendingProduct[] = [
  { name: 'ZeroBreeze Mark 3 포터블 에어컨', platform: 'Kickstarter', imageUrl: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400&h=240&fit=crop', growthRate: 4200, currentAmount: '$630,000', backerCount: 3241, daysLive: 2 },
  { name: 'Pomodoro Cube 집중 타이머', platform: 'Wadiz', imageUrl: 'https://images.unsplash.com/photo-1563396983906-b3795482a59a?w=400&h=240&fit=crop', growthRate: 1850, currentAmount: '1억 8,500만원', backerCount: 2104, daysLive: 3 },
  { name: 'SoundPod 골전도 스피커 안경', platform: 'Kickstarter', imageUrl: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400&h=240&fit=crop', growthRate: 1240, currentAmount: '$186,000', backerCount: 1456, daysLive: 1 },
  { name: 'PetCam 360 반려동물 카메라', platform: 'Indiegogo', imageUrl: 'https://images.unsplash.com/photo-1583337130417-13104dec14a3?w=400&h=240&fit=crop', growthRate: 980, currentAmount: '$98,000', backerCount: 876, daysLive: 3 },
  { name: 'EcoWrap 재사용 실리콘 랩', platform: 'Wadiz', imageUrl: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=400&h=240&fit=crop', growthRate: 720, currentAmount: '7,200만원', backerCount: 1230, daysLive: 2 },
  { name: 'LumiDesk RGB 게이밍 데스크', platform: 'Kickstarter', imageUrl: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=400&h=240&fit=crop', growthRate: 560, currentAmount: '$84,000', backerCount: 612, daysLive: 3 },
];

const platformColors: Record<string, string> = {
  Kickstarter: 'bg-green-100 text-green-700',
  Wadiz: 'bg-blue-100 text-blue-700',
  Indiegogo: 'bg-purple-100 text-purple-700',
  Makuake: 'bg-orange-100 text-orange-700',
};

interface WelcomeStateProps {
  language: Language;
  onSampleSearch: (query: string) => void;
}

export function WelcomeState({ language, onSampleSearch }: WelcomeStateProps) {
  const content = {
    ko: {
      title: '제품을 검색해보세요',
      description: '관심있는 제품명을 입력하면 펀딩 정보와 인플루언서 데이터를 확인할 수 있습니다',
      sampleLabel: '예시 검색어',
      samples: ['스마트 워치', '무선 이어폰', '공기청정기', '전기 스쿠터', '폴더블 키보드'],
      newLabel: '24시간 내 신규 출시',
      trendLabel: '3일 내 성장률 TOP',
      trendDesc: '최근 3일간 가장 빠르게 성장 중인 펀딩 프로젝트',
    },
    en: {
      title: 'Search for Products',
      description: 'Enter a product name to discover funding information and influencer data',
      sampleLabel: 'Sample Keywords',
      samples: ['Smart Watch', 'Wireless Earbuds', 'Air Purifier', 'Electric Scooter', 'Foldable Keyboard'],
      newLabel: 'Launched in 24h',
      trendLabel: '3-Day Growth TOP',
      trendDesc: 'Fastest growing funding projects in the last 3 days',
    },
    ja: {
      title: '製品を検索',
      description: '製品名を入力してファンディング情報をご確認ください',
      sampleLabel: 'サンプル',
      samples: ['スマートウォッチ', 'ワイヤレスイヤホン', '空気清浄機', '電動スクーター', '折りたたみキーボード'],
      newLabel: '24時間以内の新規',
      trendLabel: '3日間成長率TOP',
      trendDesc: '直近3日間で最も成長したプロジェクト',
    },
    zh: {
      title: '搜索产品',
      description: '输入产品名称以查看众筹信息',
      sampleLabel: '示例',
      samples: ['智能手表', '无线耳机', '空气净化器', '电动滑板车', '折叠键盘'],
      newLabel: '24小时内新上线',
      trendLabel: '3天增长率TOP',
      trendDesc: '近3天增长最快的众筹项目',
    },
  };

  const msg = content[language];

  // Double the items for seamless loop
  const marqueeItems = [...newLaunches, ...newLaunches];

  return (
    <div className="flex flex-col">
      {/* Search Section */}
      <div className="flex flex-col items-center justify-center py-14 text-center max-w-2xl mx-auto">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#ff003b] to-[#2E90FA] flex items-center justify-center mb-5 shadow-lg">
          <Search className="w-10 h-10 text-white" />
        </div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-[#ff003b]" />
          <h2 className="text-3xl font-bold text-gray-900">{msg.title}</h2>
          <Sparkles className="w-5 h-5 text-[#ff003b]" />
        </div>
        <p className="text-base text-gray-600 mb-7">{msg.description}</p>
        <div className="w-full">
          <p className="text-sm font-medium text-gray-500 mb-3">{msg.sampleLabel}</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {msg.samples.map((sample, index) => (
              <button
                key={index}
                onClick={() => onSampleSearch(sample)}
                className="px-4 py-2 bg-white border-2 border-gray-200 rounded-full text-sm text-gray-700 hover:border-[#ff003b] hover:text-[#ff003b] transition-all hover:shadow-md"
              >
                {sample}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 24h New Launches — Marquee */}
      <div className="w-full max-w-[1280px] mx-auto mb-10">
        <div className="flex items-center gap-3 mb-4 px-2">
          <Flame className="w-5 h-5 text-[#ff003b]" />
          <h3 className="text-lg font-bold text-gray-900">{msg.newLabel}</h3>
          <span className="px-2.5 py-0.5 bg-[#ff003b] text-white rounded-full text-xs font-bold animate-pulse">LIVE</span>
        </div>
        <div className="overflow-hidden relative">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#F5F7FA] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#F5F7FA] to-transparent z-10 pointer-events-none" />
          <div
            className="flex gap-4 w-max"
            style={{
              animation: 'marqueeScroll 40s linear infinite',
            }}
          >
            {marqueeItems.map((item, idx) => (
              <div
                key={idx}
                className="flex-shrink-0 w-[260px] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
              >
                <div className="relative h-[100px] overflow-hidden bg-gray-100">
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute top-2 left-2">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${platformColors[item.platform] || 'bg-gray-100 text-gray-700'}`}>
                      {item.platform}
                    </span>
                  </div>
                  <div className="absolute top-2 right-2">
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-black/50 text-white">
                      <Clock className="w-3 h-3" />
                      {item.hoursAgo}h
                    </span>
                  </div>
                </div>
                <div className="p-3">
                  <h4 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1">{item.name}</h4>
                  <div className="text-sm font-bold text-[#ff003b]">{item.fundingGoal}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3-Day Growth TOP — Marquee (reverse direction) */}
      <div className="w-full max-w-[1280px] mx-auto pb-12">
        <div className="flex items-center gap-3 mb-4 px-2">
          <TrendingUp className="w-5 h-5 text-[#ff003b]" />
          <h3 className="text-lg font-bold text-gray-900">{msg.trendLabel}</h3>
          <span className="text-sm text-gray-500">{msg.trendDesc}</span>
        </div>
        <div className="overflow-hidden relative">
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#F5F7FA] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#F5F7FA] to-transparent z-10 pointer-events-none" />
          <div
            className="flex gap-4 w-max"
            style={{ animation: 'marqueeScrollReverse 45s linear infinite' }}
          >
            {[...trendingProducts, ...trendingProducts].map((item, idx) => (
              <div
                key={idx}
                className="flex-shrink-0 w-[300px] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
              >
                <div className="relative h-[110px] overflow-hidden bg-gray-100">
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute top-2 left-2">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${platformColors[item.platform] || 'bg-gray-100 text-gray-700'}`}>
                      {item.platform}
                    </span>
                  </div>
                  <div className="absolute top-2 right-2">
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#ff003b] text-white">
                      <TrendingUp className="w-3 h-3" />
                      {item.growthRate}%
                    </span>
                  </div>
                  {idx % trendingProducts.length < 3 && (
                    <div className="absolute bottom-2 left-2">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow ${
                        idx % trendingProducts.length === 0 ? 'bg-yellow-500' : idx % trendingProducts.length === 1 ? 'bg-gray-400' : 'bg-amber-700'
                      }`}>
                        {(idx % trendingProducts.length) + 1}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h4 className="font-bold text-gray-900 text-sm mb-1.5 line-clamp-1">{item.name}</h4>
                  <div className="flex items-center justify-between">
                    <div className="text-base font-bold text-[#ff003b]">{item.currentAmount}</div>
                    <div className="text-sm text-gray-600">{item.backerCount.toLocaleString()}{language === 'ko' ? '명' : ''}</div>
                    <div className="text-sm font-bold text-green-600">D+{item.daysLive}</div>
                  </div>
                </div>
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
        @keyframes marqueeScrollReverse {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
