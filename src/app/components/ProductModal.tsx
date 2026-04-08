import { X, Star, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { Product, Language, Translations } from '../types';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
  onBookmark: (id: string) => void;
  isBookmarked: boolean;
  language: Language;
  translations: Translations;
}

export function ProductModal({
  product,
  onClose,
  onBookmark,
  isBookmarked,
  language,
  translations,
}: ProductModalProps) {
  const platformColors = {
    Wadiz: 'bg-[#FF6B6B]',
    Kickstarter: 'bg-[#05CE78]',
    Indiegogo: 'bg-[#E51075]',
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString(language === 'ko' ? 'ko-KR' : language === 'ja' ? 'ja-JP' : language === 'zh' ? 'zh-CN' : 'en-US');
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

        {/* Product Image */}
        <div className="relative aspect-video overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {/* Platform Badge */}
          <div className="absolute top-4 left-4">
            <span className={`px-4 py-2 rounded-full text-white ${platformColors[product.platform]}`}>
              {product.platform}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
          </div>

          {/* Funding Stats */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-gray-500">{translations.fundingGoal}</div>
                <div className="text-xl font-bold text-gray-900">
                  {formatNumber(product.fundingGoal)}
                  {language === 'ko' ? '원' : language === 'ja' ? '円' : language === 'zh' ? '元' : ' KRW'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">{translations.currentAmount}</div>
                <div className="text-xl font-bold text-[#ff003b]">
                  {formatNumber(product.currentAmount)}
                  {language === 'ko' ? '원' : language === 'ja' ? '円' : language === 'zh' ? '元' : ' KRW'}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-[#ff003b] h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(product.percentage, 100)}%` }}
                />
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="text-center">
                <div className="text-sm text-gray-500">{translations.achievement}</div>
                <div className="text-lg font-bold text-[#ff003b]">{product.percentage}%</div>
              </div>
              <div className="text-center border-x border-gray-200">
                <div className="text-sm text-gray-500">{translations.supporters}</div>
                <div className="text-lg font-bold text-gray-900">
                  {formatNumber(product.backerCount)}
                  {language === 'ko' ? '명' : language === 'ja' ? '人' : language === 'zh' ? '人' : ''}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500">{translations.daysLeft}</div>
                <div className="text-lg font-bold text-gray-900">
                  {language === 'ko' && `D-${product.daysLeft}`}
                  {language === 'en' && `${product.daysLeft}d`}
                  {language === 'ja' && `${product.daysLeft}日`}
                  {language === 'zh' && `${product.daysLeft}天`}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {language === 'ko' ? '상세 설명' : language === 'ja' ? '詳細説明' : language === 'zh' ? '详细说明' : 'Description'}
            </h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {product.fullDescription}
            </p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag, index) => (
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
              onClick={() => onBookmark(product.id)}
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
