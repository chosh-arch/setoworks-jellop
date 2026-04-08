import { Star } from 'lucide-react';
import { Product, Language, Translations } from '../types';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  onBookmark: (id: string) => void;
  isBookmarked: boolean;
  language: Language;
  translations: Translations;
}

export function ProductCard({
  product,
  onClick,
  onBookmark,
  isBookmarked,
  language,
  translations,
}: ProductCardProps) {
  const platformColors = {
    Wadiz: 'bg-[#FF6B6B] text-white',
    Kickstarter: 'bg-[#05CE78] text-white',
    Indiegogo: 'bg-[#E51075] text-white',
  };

  const isDDay = product.daysLeft <= 3;
  
  const formatNumber = (num: number) => {
    return num.toLocaleString(language === 'ko' ? 'ko-KR' : language === 'ja' ? 'ja-JP' : language === 'zh' ? 'zh-CN' : 'en-US');
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative group"
    >
      {/* Bookmark Icon */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onBookmark(product.id);
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
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Platform Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 rounded-full text-sm ${platformColors[product.platform]}`}>
            {product.platform}
          </span>
        </div>
        {/* D-Day Badge */}
        {isDDay ? (
          <div className="absolute bottom-3 left-3">
            <span className="px-3 py-1 rounded-full text-sm bg-red-500 text-white font-semibold">
              {language === 'ko'
                ? '마감임박'
                : language === 'ja'
                ? '終了間近'
                : language === 'zh'
                ? '即将结束'
                : 'Ending Soon'}
            </span>
          </div>
        ) : null}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <h3 className="font-bold text-gray-900 line-clamp-1">{product.name}</h3>
        <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#ff003b] h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(product.percentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="font-semibold text-[#ff003b]">{product.percentage}%</span>
            <span className="text-gray-600">
              {formatNumber(product.backerCount)}
              {language === 'ko' ? '명' : language === 'ja' ? '人' : language === 'zh' ? '人' : ' backers'}
            </span>
          </div>
        </div>

        {/* Days Left */}
        <div className="text-sm text-gray-500">
          {language === 'ko' && `D-${product.daysLeft}`}
          {language === 'en' && `${product.daysLeft} days left`}
          {language === 'ja' && `残り${product.daysLeft}日`}
          {language === 'zh' && `剩余${product.daysLeft}天`}
        </div>
      </div>
    </div>
  );
}
