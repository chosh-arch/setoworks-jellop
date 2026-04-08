import { useState } from 'react';
import { X, ExternalLink, Play, Image as ImageIcon, Eye, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { Influencer, Language, Translations, ContentItem } from '../types';

interface InfluencerModalProps {
  influencer: Influencer;
  onClose: () => void;
  language: Language;
  translations: Translations;
}

export function InfluencerModal({
  influencer,
  onClose,
  language,
  translations,
}: InfluencerModalProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'video' | 'image'>('all');

  const platformConfig = {
    YouTube: { color: 'bg-red-600', name: 'YouTube' },
    Instagram: { color: 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400', name: 'Instagram' },
    TikTok: { color: 'bg-black', name: 'TikTok' },
  };

  const categoryLabels = {
    tech: { ko: '테크', en: 'Tech', ja: 'テック', zh: '科技' },
    lifestyle: { ko: '라이프스타일', en: 'Lifestyle', ja: 'ライフスタイル', zh: '生活方式' },
    beauty: { ko: '뷰티', en: 'Beauty', ja: 'ビューティー', zh: '美妆' },
    food: { ko: '푸드', en: 'Food', ja: 'フード', zh: '美食' },
    game: { ko: '게임', en: 'Game', ja: 'ゲーム', zh: '游戏' },
    fashion: { ko: '패션', en: 'Fashion', ja: 'ファッション', zh: '时尚' },
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}${language === 'ko' ? '만' : 'M'}`;
    } else if (num >= 10000) {
      return `${(num / 10000).toFixed(1)}${language === 'ko' ? '만' : 'K'}`;
    }
    return num.toLocaleString(language === 'ko' ? 'ko-KR' : language === 'ja' ? 'ja-JP' : language === 'zh' ? 'zh-CN' : 'en-US');
  };

  const filteredContent = influencer.content.filter((item) => {
    if (activeTab === 'all') return true;
    return item.type === activeTab;
  });

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
        className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-all shadow-md"
        >
          <X className="w-6 h-6 text-gray-600" />
        </button>

        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start gap-4">
            {/* Profile Photo */}
            <div className="relative">
              <img
                src={influencer.profilePhoto}
                alt={influencer.name}
                className="w-24 h-24 rounded-full object-cover ring-4 ring-gray-100"
              />
              <div
                className={`absolute -bottom-2 -right-2 px-3 py-1 rounded-full text-white text-sm font-semibold ${platformConfig[influencer.platform].color} shadow-lg`}
              >
                {platformConfig[influencer.platform].name}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{influencer.name}</h2>
              
              {/* Category Tag */}
              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full mb-3">
                {categoryLabels[influencer.category][language]}
              </span>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-500">
                    {language === 'ko' ? '팔로워' : language === 'ja' ? 'フォロワー' : language === 'zh' ? '粉丝' : 'Followers'}
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {formatNumber(influencer.followerCount)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">{translations.engagementRate}</div>
                  <div className="text-lg font-bold text-[#ff003b]">{influencer.engagementRate}%</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">{translations.averageViews}</div>
                  <div className="text-lg font-bold text-gray-900">
                    {formatNumber(influencer.averageViews)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Feed Section */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {language === 'ko' ? '콘텐츠' : language === 'ja' ? 'コンテンツ' : language === 'zh' ? '内容' : 'Content'}
          </h3>

          {/* Tab Bar */}
          <div className="flex gap-2 mb-4 border-b border-gray-200">
            {(['all', 'video', 'image'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-medium transition-all ${
                  activeTab === tab
                    ? 'text-[#ff003b] border-b-2 border-[#ff003b]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab === 'all' ? translations.allTab : tab === 'video' ? translations.videoTab : translations.imageTab}
              </button>
            ))}
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {filteredContent.map((content) => (
              <ContentThumbnail
                key={content.id}
                content={content}
                language={language}
                translations={translations}
                formatNumber={formatNumber}
              />
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <div className="p-6 pt-0">
          <button className="w-full py-3 bg-[#ff003b] text-white rounded-xl hover:bg-[#cc002f] transition-colors flex items-center justify-center gap-2">
            <ExternalLink className="w-5 h-5" />
            {translations.channelLink}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function ContentThumbnail({
  content,
  language,
  translations,
  formatNumber,
}: {
  content: ContentItem;
  language: Language;
  translations: Translations;
  formatNumber: (num: number) => string;
}) {
  return (
    <a
      href={content.url}
      target="_blank"
      rel="noopener noreferrer"
      className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 group cursor-pointer"
    >
      <img
        src={content.thumbnailUrl}
        alt="Content"
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
      
      {/* Type Icon Overlay */}
      <div className="absolute top-2 right-2">
        {content.type === 'video' ? (
          <div className="p-1.5 rounded-full bg-black/70 text-white">
            <Play className="w-4 h-4" fill="white" />
          </div>
        ) : (
          <div className="p-1.5 rounded-full bg-black/70 text-white">
            <ImageIcon className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Hover Overlay with Stats */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 text-white">
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            <span>{formatNumber(content.viewCount)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className="w-3 h-3" />
            <span>{formatNumber(content.likeCount)}</span>
          </div>
        </div>
        <div className="text-xs opacity-80 mt-1">{content.datePosted}</div>
      </div>
    </a>
  );
}
