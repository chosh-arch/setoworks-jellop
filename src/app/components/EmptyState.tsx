import { SearchX } from 'lucide-react';
import { Language } from '../types';

interface EmptyStateProps {
  language: Language;
  onReset: () => void;
}

export function EmptyState({ language, onReset }: EmptyStateProps) {
  const messages = {
    ko: {
      title: '검색 결과가 없습니다',
      description: '다른 키워드로 다시 검색해보세요',
      button: '다시 검색하기',
    },
    en: {
      title: 'No results found',
      description: 'Try searching with different keywords',
      button: 'Try again',
    },
    ja: {
      title: '結果が見つかりません',
      description: '別のキーワードで検索してください',
      button: '再検索',
    },
    zh: {
      title: '未找到结果',
      description: '尝试使用其他关键词搜索',
      button: '重新搜索',
    },
  };

  const msg = messages[language];

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
        <SearchX className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{msg.title}</h3>
      <p className="text-gray-600 mb-6 max-w-md">{msg.description}</p>
      <button
        onClick={onReset}
        className="px-6 py-3 bg-[#ff003b] text-white rounded-xl hover:bg-[#cc002f] transition-colors"
      >
        {msg.button}
      </button>
    </div>
  );
}
