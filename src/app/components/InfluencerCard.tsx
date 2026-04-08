import { Star } from 'lucide-react';
import { Influencer, Language, Translations, AdMetrics } from '../types';

interface InfluencerCardProps {
  influencer: Influencer;
  onClick: () => void;
  onBookmark: (id: string) => void;
  isBookmarked: boolean;
  language: Language;
  translations: Translations;
}

function formatKoreanAmount(num: number): string {
  if (num >= 100000000) {
    const eok = num / 100000000;
    return eok % 1 === 0 ? `${eok}억` : `${eok.toFixed(1)}억`;
  } else if (num >= 10000) {
    const man = num / 10000;
    return man % 1 === 0 ? `${man}만` : `${man.toFixed(0)}만`;
  }
  return num.toLocaleString('ko-KR');
}

export function InfluencerCard({
  influencer,
  onClick,
  onBookmark,
  isBookmarked,
  language,
  translations,
}: InfluencerCardProps) {
  const platformConfig = {
    YouTube: { color: 'bg-red-600', icon: '▶' },
    Instagram: { color: 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400', icon: '📷' },
    TikTok: { color: 'bg-black', icon: '♪' },
  };

  const categoryLabels = {
    tech: { ko: '테크', en: 'Tech', ja: 'テック', zh: '科技' },
    lifestyle: { ko: '라이프스타일', en: 'Lifestyle', ja: 'ライフスタイル', zh: '生活方式' },
    beauty: { ko: '뷰티', en: 'Beauty', ja: 'ビューティー', zh: '美妆' },
    food: { ko: '푸드', en: 'Food', ja: 'フード', zh: '美食' },
    game: { ko: '게임', en: 'Game', ja: 'ゲーム', zh: '游戏' },
    fashion: { ko: '패션', en: 'Fashion', ja: 'ファッション', zh: '时尚' },
  };

  const tierConfig: Record<string, {label:string;bg:string;text:string;border:string}> = {
    nano: { label: '나노', bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300' },
    micro: { label: '마이크로', bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-300' },
    mid: { label: '미드', bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
    macro: { label: '매크로', bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' },
    mega: { label: '메가', bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}${language === 'ko' ? '만' : 'M'}`;
    } else if (num >= 10000) {
      return `${(num / 10000).toFixed(1)}${language === 'ko' ? '만' : 'K'}`;
    }
    return num.toLocaleString(language === 'ko' ? 'ko-KR' : language === 'ja' ? 'ja-JP' : language === 'zh' ? 'zh-CN' : 'en-US');
  };

  const tier = tierConfig[influencer.tier];

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-md p-5 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative group"
    >
      {/* Bookmark Icon */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onBookmark(influencer.id);
        }}
        className="absolute top-3 right-3 z-10 p-2 rounded-full bg-gray-50 hover:bg-gray-100 transition-all"
      >
        <Star
          className={`w-5 h-5 ${
            isBookmarked ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'
          }`}
        />
      </button>

      <div className="flex items-start gap-4">
        {/* Profile Photo */}
        <div className="relative">
          <img
            src={influencer.profilePhoto}
            alt={influencer.name}
            className="w-16 h-16 rounded-full object-cover ring-2 ring-gray-200"
          />
          {/* Platform Badge */}
          <div
            className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full ${platformConfig[influencer.platform].color} flex items-center justify-center text-white text-xs font-bold shadow-md`}
          >
            {platformConfig[influencer.platform].icon}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-gray-900">{influencer.name}</h4>
            {/* Tier Badge */}
            <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full border ${tier.bg} ${tier.text} ${tier.border}`}>
              {tier.label}
            </span>
          </div>

          {/* Category Tag */}
          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
            {categoryLabels[influencer.category][language]}
          </span>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            <div>
              <span className="text-gray-500">
                {language === 'ko' ? '팔로워' : language === 'ja' ? 'フォロワー' : language === 'zh' ? '粉丝' : 'Followers'}:{' '}
              </span>
              <span className="font-semibold text-gray-900">{formatNumber(influencer.followerCount)}</span>
            </div>
            <div>
              <span className="text-gray-500">{translations.engagementRate}: </span>
              <span className="font-semibold text-[#ff003b]">{influencer.engagementRate}%</span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-500">{translations.averageViews}: </span>
              <span className="font-semibold text-gray-900">{formatNumber(influencer.averageViews)}</span>
            </div>
          </div>

          {/* Cost Per Post */}
          {influencer.costPerPost > 0 && (
            <div className="text-xs text-gray-500">
              {language === 'ko' ? '건당 비용' : 'Cost/Post'}:{' '}
              <span className="font-semibold text-gray-800">
                {language === 'ko' ? formatKoreanAmount(influencer.costPerPost) + '원' : influencer.costPerPost.toLocaleString() + ' KRW'}
              </span>
            </div>
          )}

          {/* Ad Metrics */}
          {influencer.adMetrics && (
            <div className="mt-2 pt-2 border-t border-gray-100 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
              <div>
                <span className="text-gray-500">{language === 'ko' ? '도달' : 'Reach'}: </span>
                <span className="font-semibold text-gray-800">{formatNumber(influencer.adMetrics.reach)}</span>
              </div>
              <div>
                <span className="text-gray-500">{language === 'ko' ? '전환' : 'Conv.'}: </span>
                <span className="font-semibold text-gray-800">{influencer.adMetrics.conversions.toLocaleString()}{language === 'ko' ? '건' : ''}</span>
              </div>
              <div>
                <span className="text-gray-500">{language === 'ko' ? '기여매출' : 'Revenue'}: </span>
                <span className="font-semibold text-gray-800">
                  {language === 'ko' ? formatKoreanAmount(influencer.adMetrics.attributedRevenue) + '원' : influencer.adMetrics.attributedRevenue.toLocaleString() + ' KRW'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">ROI: </span>
                <span className={`font-bold ${influencer.adMetrics.roi > 100 ? 'text-green-600' : 'text-red-500'}`}>
                  {influencer.adMetrics.roi > 100000 ? '∞' : `${influencer.adMetrics.roi.toLocaleString()}%`}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
