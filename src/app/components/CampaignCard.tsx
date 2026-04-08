import { Star } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { Campaign, Language, Translations } from '../types';

interface CampaignCardProps {
  campaign: Campaign;
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

export function CampaignCard({
  campaign,
  onClick,
  onBookmark,
  isBookmarked,
  language,
  translations,
}: CampaignCardProps) {
  const statusConfig = {
    success: {
      bg: 'bg-[#12B76A]',
      text: language === 'ko' ? '성공' : language === 'ja' ? '成功' : language === 'zh' ? '成功' : 'Success',
    },
    failed: {
      bg: 'bg-[#F04438]',
      text: language === 'ko' ? '실패' : language === 'ja' ? '失敗' : language === 'zh' ? '失败' : 'Failed',
    },
    ongoing: {
      bg: 'bg-[#2E90FA]',
      text: language === 'ko' ? '진행중' : language === 'ja' ? '進行中' : language === 'zh' ? '进行中' : 'Ongoing',
    },
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString(language === 'ko' ? 'ko-KR' : language === 'ja' ? 'ja-JP' : language === 'zh' ? 'zh-CN' : 'en-US');
  };

  const setoworksPercent = campaign.finalAmount > 0
    ? Math.round((campaign.setoworksAmount / campaign.finalAmount) * 100)
    : 0;
  const organicPercent = 100 - setoworksPercent;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative group"
    >
      {/* Bookmark Icon */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onBookmark(campaign.id);
        }}
        className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-all shadow-md"
      >
        <Star
          className={`w-5 h-5 ${
            isBookmarked ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'
          }`}
        />
      </button>

      {/* Image */}
      <div className="relative aspect-video overflow-hidden bg-gray-100">
        <img
          src={campaign.imageUrl}
          alt={campaign.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 rounded-full text-sm text-white ${statusConfig[campaign.status].bg}`}>
            {statusConfig[campaign.status].text}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <h3 className="font-bold text-gray-900 line-clamp-1">{campaign.name}</h3>

        {/* Campaign Period */}
        <div className="text-sm text-gray-500">
          {campaign.startDate} – {campaign.endDate}
        </div>

        <p className="text-sm text-gray-600 line-clamp-2">{campaign.description}</p>

        {/* Prominent Funding Amount */}
        <div className="pt-1">
          <div className="text-xs text-gray-500">
            {language === 'ko' ? '최종 펀딩액' : language === 'ja' ? '最終金額' : language === 'zh' ? '最终金额' : 'Final Amount'}
          </div>
          <div className="text-2xl font-bold text-[#ff003b]">
            {language === 'ko' ? formatKoreanAmount(campaign.finalAmount) + '원' : formatNumber(campaign.finalAmount) + (language === 'ja' ? '円' : language === 'zh' ? '元' : ' KRW')}
          </div>
          <div className="text-sm font-semibold text-[#ff003b]">
            {language === 'ko' ? '달성률' : language === 'ja' ? '達成率' : language === 'zh' ? '达成率' : 'Achievement'} {campaign.achievementRate}%
          </div>
        </div>

        {/* Mini Funding Timeline Area Chart */}
        {campaign.fundingTimeline && campaign.fundingTimeline.length > 0 && (
          <div className="w-full" style={{ height: 80 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={campaign.fundingTimeline} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={`gradient-${campaign.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff003b" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#ff003b" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#ff003b"
                  strokeWidth={2}
                  fill={`url(#gradient-${campaign.id})`}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Setoworks Effect Bar */}
        <div className="space-y-1">
          <div className="text-xs font-semibold text-gray-700">
            {language === 'ko' ? '세토웍스 효과' : 'Setoworks Effect'}
          </div>
          <div className="flex w-full h-5 rounded-full overflow-hidden bg-gray-100">
            <div
              className="bg-gray-300 flex items-center justify-center text-[10px] font-bold text-gray-600"
              style={{ width: `${organicPercent}%` }}
            >
              {organicPercent > 15 ? `${organicPercent}%` : ''}
            </div>
            <div
              className="bg-[#ff003b] flex items-center justify-center text-[10px] font-bold text-white"
              style={{ width: `${setoworksPercent}%` }}
            >
              {setoworksPercent}%
            </div>
          </div>
          <div className="flex justify-between text-[10px] text-gray-500">
            <span>{language === 'ko' ? '자연유입' : 'Organic'}</span>
            <span className="text-[#ff003b] font-semibold">{language === 'ko' ? '세토웍스 마케팅' : 'Setoworks'}</span>
          </div>
        </div>

        {/* Participating Influencers */}
        {campaign.influencers && campaign.influencers.length > 0 && (
          <div className="pt-2 border-t border-gray-100">
            <div className="text-xs font-semibold text-gray-500 mb-2">
              {language === 'ko' ? '참여 인플루언서' : 'Influencers'}
            </div>
            <div className="flex items-center gap-1.5">
              {campaign.influencers.slice(0, 4).map((inf, idx) => (
                <div key={idx} className="relative group/inf">
                  <img
                    src={inf.profilePhoto}
                    alt={inf.name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-sm"
                  />
                  <div className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center text-white text-[7px] font-bold shadow ${
                    inf.tier === 'nano' || inf.tier === 'micro' ? 'bg-emerald-500' :
                    inf.tier === 'mid' ? 'bg-blue-500' :
                    inf.tier === 'macro' ? 'bg-amber-500' : 'bg-red-500'
                  }`}>
                    {inf.tier === 'nano' ? 'N' : inf.tier === 'micro' ? 'μ' : inf.tier === 'mid' ? 'M' : inf.tier === 'macro' ? 'A' : '★'}
                  </div>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-gray-900 text-white text-[11px] rounded-lg whitespace-nowrap opacity-0 group-hover/inf:opacity-100 transition-opacity pointer-events-none z-20 shadow-lg">
                    <div className="font-bold">{inf.name}</div>
                    <div className="text-gray-300">{inf.contribution}</div>
                  </div>
                </div>
              ))}
              {campaign.influencers.length > 4 && (
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                  +{campaign.influencers.length - 4}
                </div>
              )}
              <span className="text-xs text-gray-400 ml-1">{campaign.influencers.length}명</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
