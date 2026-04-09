import { useState, useEffect, useRef } from 'react';
import { Search, X, Bookmark, Presentation, ExternalLink } from 'lucide-react';
import { Language, Translations } from '../types';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onSearch: (query: string) => void;
  onOpenBookmarks: () => void;
  translations: Translations;
  searchQuery: string;
}

export function Header({
  language,
  onLanguageChange,
  onSearch,
  onOpenBookmarks,
  translations,
  searchQuery,
}: HeaderProps) {
  const [inputValue, setInputValue] = useState(searchQuery);
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowRecentSearches(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      onSearch(query);
      setShowRecentSearches(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(inputValue);
  };

  const removeRecentSearch = (query: string) => {
    const updated = recentSearches.filter(s => s !== query);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-[1280px] mx-auto px-6 py-4">
        <div className="flex items-center gap-6">
          {/* Logo — click to go home */}
          <div className="flex-shrink-0 cursor-pointer" onClick={() => window.location.reload()}>
            <img src="/setoworks_logo.png" alt="SETOWORKS" className="h-6" />
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl relative" ref={searchRef}>
            <form onSubmit={handleSubmit}>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onFocus={() => setShowRecentSearches(true)}
                  placeholder={translations.searchPlaceholder}
                  className="w-full pl-12 pr-24 py-3.5 rounded-2xl border-2 border-gray-200 focus:border-[#ff003b] focus:outline-none transition-all text-base shadow-sm focus:shadow-md"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 rounded-xl bg-[#ff003b] text-white text-sm font-bold hover:bg-[#cc002f] transition-colors"
                >
                  검색
                </button>
              </div>
            </form>

            {/* Recent Searches Dropdown */}
            {showRecentSearches && recentSearches.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                  <span className="text-sm font-medium text-gray-600">
                    {translations.recentSearches}
                  </span>
                </div>
                <div className="py-2">
                  {recentSearches.map((query, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 cursor-pointer group"
                    >
                      <span
                        onClick={() => {
                          setInputValue(query);
                          handleSearch(query);
                        }}
                        className="flex-1 text-gray-700"
                      >
                        {query}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeRecentSearch(query);
                        }}
                        className="p-1 rounded-full hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Influencer Admin DB */}
          <a
            href="/influencer-admin.html"
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold text-gray-600 border border-gray-200 hover:border-[#ff003b] hover:text-[#ff003b] transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            인플루언서 DB
          </a>

          {/* Strategy Deck Link */}
          <a
            href="/deck.html"
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold text-[#ff003b] border border-[#ff003b]/30 hover:bg-[#ff003b] hover:text-white transition-all"
          >
            <Presentation className="w-4 h-4" />
            전략 소개자료
          </a>

          {/* Bookmark Button */}
          <button
            onClick={onOpenBookmarks}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Bookmark className="w-6 h-6 text-gray-600" />
          </button>

          {/* Language Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
            {(['ko', 'en', 'ja', 'zh'] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => onLanguageChange(lang)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  language === lang
                    ? 'bg-white text-[#212121] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {lang === 'ko' ? '한' : lang === 'en' ? 'EN' : lang === 'ja' ? '日' : '中'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
