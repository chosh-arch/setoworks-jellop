import { useState } from 'react';
import { X, Star, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Campaign, Influencer, Language, Translations } from '../types';

interface BookmarkDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarkedProducts: Product[];
  bookmarkedCampaigns: Campaign[];
  bookmarkedInfluencers: Influencer[];
  onRemoveBookmark: (type: 'product' | 'campaign' | 'influencer', id: string) => void;
  onItemClick: (type: 'product' | 'campaign' | 'influencer', item: any) => void;
  language: Language;
  translations: Translations;
}

export function BookmarkDrawer({
  isOpen,
  onClose,
  bookmarkedProducts,
  bookmarkedCampaigns,
  bookmarkedInfluencers,
  onRemoveBookmark,
  onItemClick,
  language,
  translations,
}: BookmarkDrawerProps) {
  const [activeTab, setActiveTab] = useState<'products' | 'campaigns' | 'influencers'>('products');

  const tabs = [
    { id: 'products' as const, label: language === 'ko' ? '펀딩 제품' : language === 'ja' ? 'ファンディング製品' : language === 'zh' ? '众筹产品' : 'Funded Products' },
    { id: 'campaigns' as const, label: language === 'ko' ? '우리 제품' : language === 'ja' ? '過去製品' : language === 'zh' ? '我们的产品' : 'Our Products' },
    { id: 'influencers' as const, label: language === 'ko' ? '인플루언서' : language === 'ja' ? 'インフルエンサー' : language === 'zh' ? '网红' : 'Influencers' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                <h2 className="text-xl font-bold text-gray-900">{translations.bookmark}</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 bg-white px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-[#ff003b] text-[#ff003b]'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-[#F5F7FA]">
              {activeTab === 'products' && (
                <BookmarkList
                  items={bookmarkedProducts}
                  type="product"
                  onRemove={onRemoveBookmark}
                  onClick={onItemClick}
                  language={language}
                  translations={translations}
                />
              )}
              {activeTab === 'campaigns' && (
                <BookmarkList
                  items={bookmarkedCampaigns}
                  type="campaign"
                  onRemove={onRemoveBookmark}
                  onClick={onItemClick}
                  language={language}
                  translations={translations}
                />
              )}
              {activeTab === 'influencers' && (
                <BookmarkList
                  items={bookmarkedInfluencers}
                  type="influencer"
                  onRemove={onRemoveBookmark}
                  onClick={onItemClick}
                  language={language}
                  translations={translations}
                />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function BookmarkList({
  items,
  type,
  onRemove,
  onClick,
  language,
  translations,
}: {
  items: any[];
  type: 'product' | 'campaign' | 'influencer';
  onRemove: (type: 'product' | 'campaign' | 'influencer', id: string) => void;
  onClick: (type: 'product' | 'campaign' | 'influencer', item: any) => void;
  language: Language;
  translations: Translations;
}) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Star className="w-16 h-16 text-gray-300 mb-4" />
        <p className="text-gray-500">
          {language === 'ko' ? '저장된 항목이 없습니다' : language === 'ja' ? '保存されたアイテムはありません' : language === 'zh' ? '没有保存的项目' : 'No saved items'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.id}
          onClick={() => onClick(type, item)}
          className="bg-white rounded-xl p-4 cursor-pointer hover:shadow-md transition-all group"
        >
          <div className="flex gap-3">
            {/* Thumbnail */}
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              <img
                src={type === 'influencer' ? item.profilePhoto : item.imageUrl}
                alt={item.name}
                className={`w-full h-full object-cover ${type === 'influencer' ? 'rounded-full' : ''}`}
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 line-clamp-1 mb-1">{item.name}</h4>
              {type === 'product' && (
                <div className="text-sm text-gray-600">
                  <span className="font-semibold text-[#ff003b]">{item.percentage}%</span>
                  <span className="mx-2">•</span>
                  <span>
                    {language === 'ko' && `D-${item.daysLeft}`}
                    {language === 'en' && `${item.daysLeft}d left`}
                    {language === 'ja' && `残り${item.daysLeft}日`}
                    {language === 'zh' && `剩余${item.daysLeft}天`}
                  </span>
                </div>
              )}
              {type === 'campaign' && (
                <div className="text-sm text-gray-600">
                  <span className="font-semibold text-[#ff003b]">{item.achievementRate}%</span>
                  <span className="mx-2">•</span>
                  <span>{item.status === 'success' ? (language === 'ko' ? '성공' : 'Success') : item.status === 'failed' ? (language === 'ko' ? '실패' : 'Failed') : (language === 'ko' ? '진행중' : 'Ongoing')}</span>
                </div>
              )}
              {type === 'influencer' && (
                <div className="text-sm text-gray-600">
                  <span>{item.platform}</span>
                  <span className="mx-2">•</span>
                  <span>{item.engagementRate}%</span>
                </div>
              )}
            </div>

            {/* Remove Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(type, item.id);
              }}
              className="p-2 rounded-full hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-5 h-5 text-red-500" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
