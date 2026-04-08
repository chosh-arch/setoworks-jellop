import { X, Star, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Campaign, Language, Translations } from '../types';

interface CampaignModalProps {
  campaign: Campaign;
  onClose: () => void;
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

const CHANNEL_COLORS = ['#ff003b', '#ff4d6d', '#ff8fa3', '#ffb3c1', '#ffd6de'];

export function CampaignModal({
  campaign,
  onClose,
  onBookmark,
  isBookmarked,
  language,
  translations,
}: CampaignModalProps) {
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

  const tooltipFormatter = (value: number) => {
    if (language === 'ko') {
      return formatKoreanAmount(value) + '원';
    }
    return formatNumber(value);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-all shadow-md"
        >
          <X className="w-6 h-6 text-gray-600" />
        </button>

        {/* Campaign Image */}
        <div className="relative aspect-video overflow-hidden">
          <img
            src={campaign.imageUrl}
            alt={campaign.name}
            className="w-full h-full object-cover"
          />
          {/* Status Badge */}
          <div className="absolute top-4 left-4">
            <span className={`px-4 py-2 rounded-full text-white ${statusConfig[campaign.status].bg}`}>
              {statusConfig[campaign.status].text}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{campaign.name}</h2>
          </div>

          {/* Campaign Period */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-sm text-gray-500 mb-1">{translations.campaignPeriod}</div>
            <div className="font-semibold text-gray-900">
              {campaign.startDate} – {campaign.endDate}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-500">{translations.finalAmount}</div>
                <div className="text-lg font-bold text-gray-900">
                  {formatNumber(campaign.finalAmount)}
                  {language === 'ko' ? '원' : language === 'ja' ? '円' : language === 'zh' ? '元' : ' KRW'}
                </div>
              </div>
              <div className="text-center border-x border-gray-200">
                <div className="text-sm text-gray-500">{translations.achievement}</div>
                <div className="text-lg font-bold text-[#ff003b]">{campaign.achievementRate}%</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500">{translations.supporters}</div>
                <div className="text-lg font-bold text-gray-900">
                  {formatNumber(campaign.backerCount)}
                  {language === 'ko' ? '명' : language === 'ja' ? '人' : language === 'zh' ? '人' : ''}
                </div>
              </div>
            </div>
          </div>

          {/* Funding Timeline Chart */}
          {campaign.fundingTimeline && campaign.fundingTimeline.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-3">
                {language === 'ko' ? '펀딩 추이' : language === 'ja' ? '資金調達推移' : language === 'zh' ? '资金趋势' : 'Funding Timeline'}
              </h3>
              <div className="bg-gray-50 rounded-xl p-4" style={{ height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={campaign.fundingTimeline} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                    <defs>
                      <linearGradient id={`modal-gradient-${campaign.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ff003b" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#ff003b" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 11, fill: '#9ca3af' }}
                      tickFormatter={(v) => `${v}${language === 'ko' ? '일' : 'd'}`}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#9ca3af' }}
                      tickFormatter={(v: number) => language === 'ko' ? formatKoreanAmount(v) : `${(v / 1000000).toFixed(0)}M`}
                      width={50}
                    />
                    <Tooltip
                      formatter={(value: number) => [tooltipFormatter(value), language === 'ko' ? '펀딩액' : 'Amount']}
                      labelFormatter={(label) => `Day ${label}`}
                      contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="#ff003b"
                      strokeWidth={2}
                      fill={`url(#modal-gradient-${campaign.id})`}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Channel Attribution Chart */}
          {campaign.channelAttribution && campaign.channelAttribution.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-3">
                {language === 'ko' ? '채널별 기여도' : language === 'ja' ? 'チャネル別貢献' : language === 'zh' ? '渠道贡献' : 'Channel Attribution'}
              </h3>
              <div className="bg-gray-50 rounded-xl p-4" style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={campaign.channelAttribution}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 11, fill: '#9ca3af' }}
                      tickFormatter={(v: number) => `${v}%`}
                    />
                    <YAxis
                      type="category"
                      dataKey="channel"
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                      width={75}
                    />
                    <Tooltip
                      formatter={(value: number, name: string, props: { payload: { amount: number } }) => {
                        return [`${value}% (${language === 'ko' ? formatKoreanAmount(props.payload.amount) + '원' : formatNumber(props.payload.amount)})`, language === 'ko' ? '비율' : 'Share'];
                      }}
                      contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
                      {campaign.channelAttribution.map((_entry, index) => (
                        <Cell key={index} fill={CHANNEL_COLORS[index % CHANNEL_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Setoworks Contribution Section */}
          <div className="bg-gradient-to-r from-red-50 to-white rounded-xl p-5 border border-red-100">
            <h3 className="text-sm font-semibold text-gray-500 mb-3">
              {language === 'ko' ? '세토웍스 기여도' : 'Setoworks Contribution'}
            </h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-4xl font-black text-[#ff003b]">
                {setoworksPercent}%
              </div>
              <div className="text-sm text-gray-600">
                <div>
                  {language === 'ko'
                    ? `전체 ${formatKoreanAmount(campaign.finalAmount)}원 중`
                    : `Out of ${formatNumber(campaign.finalAmount)}`}
                </div>
                <div className="font-bold text-[#ff003b]">
                  {language === 'ko'
                    ? `${formatKoreanAmount(campaign.setoworksAmount)}원이 세토웍스 마케팅 기여`
                    : `${formatNumber(campaign.setoworksAmount)} attributed to Setoworks`}
                </div>
              </div>
            </div>
            <div className="flex w-full h-8 rounded-full overflow-hidden bg-gray-200">
              <div
                className="bg-gray-400 flex items-center justify-center text-xs font-bold text-white"
                style={{ width: `${organicPercent}%` }}
              >
                {organicPercent > 12 ? `${language === 'ko' ? '자연유입' : 'Organic'} ${organicPercent}%` : ''}
              </div>
              <div
                className="bg-[#ff003b] flex items-center justify-center text-xs font-bold text-white"
                style={{ width: `${setoworksPercent}%` }}
              >
                {language === 'ko' ? '세토웍스' : 'Setoworks'} {setoworksPercent}%
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-3">
              {language === 'ko' ? '캠페인 진행도' : language === 'ja' ? 'キャンペーン進捗' : language === 'zh' ? '活动进度' : 'Campaign Timeline'}
            </h3>
            <div className="relative">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-full rounded-full ${statusConfig[campaign.status].bg}`}
                  style={{ width: campaign.status === 'ongoing' ? '60%' : '100%' }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>{campaign.startDate}</span>
                <span>{campaign.endDate}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {language === 'ko' ? '상세 설명' : language === 'ja' ? '詳細説明' : language === 'zh' ? '详细说明' : 'Description'}
            </h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {campaign.fullDescription}
            </p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {campaign.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button className="w-full py-3 bg-[#ff003b] text-white rounded-xl hover:bg-[#cc002f] transition-colors flex items-center justify-center gap-2">
              <ExternalLink className="w-5 h-5" />
              {translations.ctaButton}
            </button>
            <button
              onClick={() => onBookmark(campaign.id)}
              className="w-full py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <Star
                className={`w-5 h-5 ${
                  isBookmarked ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'
                }`}
              />
              {isBookmarked ? translations.bookmark : (language === 'ko' ? '저장하기' : language === 'ja' ? '保存する' : language === 'zh' ? '保存' : 'Save')}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
