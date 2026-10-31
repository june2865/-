import React, { useState, useMemo } from 'react';
import {
  Search,
  Watch,
  Footprints,
  Sparkles,
  Palette,
  Shirt,
  Armchair,
  Wine,
  Package,
  PackageOpen,
  X,
  Hash,
} from 'lucide-react';
import { AuctionCategory, AuctionItem } from '../types/auction';
import { ProductCard } from './ProductCard';

interface HomeFeedProps {
  items: AuctionItem[];
  onSelectItem: (item: AuctionItem) => void;
  onToggleLike: (itemId: string, e: React.MouseEvent) => void;
  nowMs: number;
}

const CATEGORIES: Array<{
  name: AuctionCategory;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { name: '시계', icon: Watch },
  { name: '스니커즈', icon: Footprints },
  { name: '미술작품', icon: Palette },
  { name: '쥬얼리', icon: Sparkles },
  { name: '패션', icon: Shirt },
  { name: '가구', icon: Armchair },
  { name: '주류', icon: Wine },
  { name: '기타', icon: Package },
];

// 품목별 연관 검색어 및 동의어 사전 (품목명이나 관련 단어 검색 시 해당 카테고리 상품 자동 노출)
const CATEGORY_KEYWORDS: Record<AuctionCategory, string[]> = {
  시계: ['시계', '워치', 'watch', '롤렉스', '오메가', '파텍', '오데마', '까르띠에', '손목시계', '타임피스'],
  스니커즈: ['스니커즈', '신발', '운동화', '조던', '나이키', '아디다스', '뉴발란스', '슈즈', 'shoes', 'sneakers'],
  쥬얼리: ['쥬얼리', '주얼리', '보석', '반지', '목걸이', '팔찌', '귀걸이', '다이아', '다이아몬드', '골드', 'jewelry', '악세사리', '액세서리'],
  미술작품: ['미술작품', '미술', '그림', '아트', 'art', '판화', '회화', '조각', '예술', '포스터', '갤러리'],
  패션: ['패션', '의류', '옷', '명품', '가방', '핸드백', '지갑', '자켓', '코트', '에르메스', '샤넬', '루이비통', 'fashion', 'bag'],
  가구: ['가구', '인테리어', '의자', '체어', '테이블', '소파', '조명', '빈티지가구', 'furniture', 'chair'],
  주류: ['주류', '술', '위스키', '와인', '샴페인', '싱글몰트', '꼬냑', '사케', '보드카', 'whisky', 'wine', 'liquor', '양주', '맥캘란', '야마자키'],
  기타: ['기타', '수집품', '카메라', '음향기기', '오디오', '스피커', '헤드폰', '피규어', '전자기기', '컴퓨터', '노트북', '맥북', 'tech', 'etc'],
};

const POPULAR_SEARCH_TAGS = [
  '시계',
  '쥬얼리',
  '주류',
  '위스키',
  '와인',
  '컴퓨터',
  '스니커즈',
  '가방',
  '미술작품',
  '기타',
];

export const HomeFeed: React.FC<HomeFeedProps> = ({
  items,
  onSelectItem,
  onToggleLike,
  nowMs,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<AuctionCategory | 'all'>('all');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllBids, setShowAllBids] = useState(false);

  // Filter items
  const filteredItems = useMemo(() => {
    let result = items.filter((item) => item.status === 'active');

    if (selectedCategory !== 'all') {
      result = result.filter((item) => item.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const rawQ = searchQuery.toLowerCase().trim();
      const cleanQ = rawQ.replace(/^#+/, '').trim(); // '#' 없이 검색해도 매칭되도록 처리

      result = result.filter((item) => {
        // 1. 상품명 직접 검색
        if (
          item.title.toLowerCase().includes(cleanQ) ||
          item.title.toLowerCase().includes(rawQ)
        ) {
          return true;
        }

        // 2. 카테고리명 직접 검색 (예: '시계', '쥬얼리', '주류', '기타')
        if (item.category.toLowerCase().includes(cleanQ)) {
          return true;
        }

        // 3. 품목 관련 연관어 / 동의어 검색 (예: '와인', '위스키' -> '주류', '컴퓨터' -> '기타' 등)
        const catKeywords = CATEGORY_KEYWORDS[item.category] || [];
        if (catKeywords.some((kw) => kw.includes(cleanQ) || cleanQ.includes(kw))) {
          return true;
        }

        // 4. 판매자가 등록한 해시태그 매칭 ('#컴퓨터' 뿐만 아니라 '컴퓨터'만 쳐도 자동 매칭)
        if (item.tags && item.tags.length > 0) {
          const matchedTag = item.tags.some((tag) => {
            const cleanTag = tag.replace(/^#+/, '').toLowerCase().trim();
            return (
              cleanTag.includes(cleanQ) ||
              cleanQ.includes(cleanTag) ||
              tag.toLowerCase().includes(rawQ)
            );
          });
          if (matchedTag) return true;
        }

        // 5. 상세 설명 및 판매자명 매칭
        if (item.description.toLowerCase().includes(cleanQ)) {
          return true;
        }
        if (item.seller.name.toLowerCase().includes(cleanQ)) {
          return true;
        }

        return false;
      });
    }

    // Default main section highlights hot bids or all based on toggle
    if (!showAllBids && selectedCategory === 'all' && !searchQuery.trim()) {
      return result;
    }

    return result;
  }, [items, selectedCategory, searchQuery, showAllBids]);

  return (
    <div className="pb-24 pt-2">
      {/* Top Header */}
      <header className="px-4 py-3 bg-white sticky top-0 z-30 flex items-center justify-between border-b border-gray-100">
        <div>
          <span className="text-[11px] font-extrabold tracking-wider text-red-600 block uppercase">
            WEEKLY DROPS
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight">
            신규 옥션
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            type="button"
            aria-label="경매 검색"
            className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 hover:bg-gray-100 active:scale-95 text-gray-800 transition-colors"
          >
            {isSearchOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Search className="w-5 h-5 stroke-[2.2]" />
            )}
          </button>
        </div>
      </header>

      {/* Expandable Search Input */}
      {isSearchOpen && (
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 animate-in slide-in-from-top-2 duration-150 space-y-2">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="품목(시계, 쥬얼리, 주류), 해시태그(컴퓨터), 상품명..."
              className="w-full bg-white pl-9 pr-8 py-2 rounded-xl text-sm border border-gray-200 placeholder:text-gray-300 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-black"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-gray-400 hover:text-gray-600 p-1"
                type="button"
                aria-label="검색어 지우기"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Search Keyword Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-[10px] font-bold text-gray-600 shrink-0 flex items-center gap-0.5">
              <Hash className="w-3 h-3 text-gray-600" />
              추천 검색:
            </span>
            {POPULAR_SEARCH_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSearchQuery(tag)}
                className={`text-[11px] px-2 py-0.5 rounded-full border shrink-0 transition-colors ${
                  searchQuery.trim().replace(/^#+/, '') === tag
                    ? 'bg-black text-white border-black font-bold'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>

          {/* Search Result summary */}
          {searchQuery.trim() && (
            <div className="flex items-center justify-between text-[11px] text-gray-600 pt-0.5">
              <span>
                ‘<strong className="text-gray-900 font-bold">{searchQuery}</strong>’ 품목 및 해시태그 검색 결과 ({filteredItems.length}건)
              </span>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs text-red-600 hover:underline font-semibold"
              >
                검색 초기화
              </button>
            </div>
          )}
        </div>
      )}



      {/* Category Bar: Horizontally scrollable round icon buttons */}
      <div className="mt-4 px-4">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
          {/* All button */}
          <button
            onClick={() => setSelectedCategory('all')}
            type="button"
            className="flex flex-col items-center gap-1.5 min-w-[58px] select-none group"
          >
            <div
              className={`w-13 h-13 rounded-full flex items-center justify-center transition-all ${
                selectedCategory === 'all'
                  ? 'bg-black text-white ring-2 ring-black ring-offset-2'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-400'
              }`}
            >
              <span className="text-xs font-bold">ALL</span>
            </div>
            <span
              className={`text-[11px] tracking-tight ${
                selectedCategory === 'all'
                  ? 'font-bold text-black'
                  : 'text-gray-600 font-medium'
              }`}
            >
              전체
            </span>
          </button>

          {/* Individual Category round buttons */}
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.name;

            return (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(isSelected ? 'all' : cat.name)}
                type="button"
                className="flex flex-col items-center gap-1.5 min-w-[58px] select-none group"
              >
                <div
                  className={`w-13 h-13 rounded-full flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-black text-white ring-2 ring-black ring-offset-2'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-[11px] tracking-tight ${
                    isSelected
                      ? 'font-bold text-black'
                      : 'text-gray-600 font-medium'
                  }`}
                >
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Section Header */}
      <div className="mt-6 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-base sm:text-lg font-black text-gray-950 tracking-tight">
            {selectedCategory === 'all' ? '실시간 인기 입찰' : `${selectedCategory} 경매 목록`}
          </h2>
          <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
            {filteredItems.length}
          </span>
        </div>

        <button
          onClick={() => setShowAllBids(!showAllBids)}
          type="button"
          className="text-xs font-semibold text-gray-600 hover:text-black transition-colors"
        >
          {showAllBids ? '인기순 정렬' : '전체보기'}
        </button>
      </div>

      {/* Product List: 2-Column Grid */}
      <div className="mt-3 px-4">
        {filteredItems.length === 0 ? (
          /* Empty State */
          <div className="my-16 flex flex-col items-center justify-center text-center p-8 bg-white rounded-2xl border border-dashed border-gray-200">
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-3 text-gray-400">
              <PackageOpen className="w-8 h-8 stroke-[1.5]" />
            </div>
            <h3 className="text-base font-bold text-gray-800">
              진행 중인 경매가 없습니다
            </h3>
            <p className="text-xs text-gray-600 mt-1 max-w-xs">
              선택한 카테고리의 신규 옥션이 등록될 때까지 잠시만 기다려주시거나 새로운 물건을 직접 등록해보세요.
            </p>
            {selectedCategory !== 'all' && (
              <button
                onClick={() => setSelectedCategory('all')}
                className="mt-4 text-xs font-bold text-black underline underline-offset-4"
              >
                전체 카테고리 보기
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {filteredItems.map((item) => (
              <ProductCard
                key={item.id}
                item={item}
                onSelect={onSelectItem}
                onToggleLike={onToggleLike}
                nowMs={nowMs}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
