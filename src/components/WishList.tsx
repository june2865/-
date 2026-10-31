import React, { useState, useMemo } from 'react';
import { Heart, ArrowUpDown, PackageOpen } from 'lucide-react';
import { AuctionItem } from '../types/auction';
import { ProductCard } from './ProductCard';

interface WishListProps {
  items: AuctionItem[];
  onSelectItem: (item: AuctionItem) => void;
  onToggleLike: (itemId: string, e: React.MouseEvent) => void;
  nowMs: number;
}

type SortOption = 'ending_soon' | 'price_low' | 'price_high';

export const WishList: React.FC<WishListProps> = ({
  items,
  onSelectItem,
  onToggleLike,
  nowMs,
}) => {
  const [sortOption, setSortOption] = useState<SortOption>('ending_soon');

  // Filter only items with isLiked === true
  const likedItems = useMemo(() => {
    const list = items.filter((item) => item.isLiked);

    return list.sort((a, b) => {
      if (sortOption === 'ending_soon') {
        return a.endTime - b.endTime;
      }
      if (sortOption === 'price_low') {
        return a.currentPrice - b.currentPrice;
      }
      if (sortOption === 'price_high') {
        return b.currentPrice - a.currentPrice;
      }
      return 0;
    });
  }, [items, sortOption]);

  return (
    <div className="pb-28 pt-2">
      {/* Top Header */}
      <header className="px-4 py-3 bg-white sticky top-0 z-30 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight">
            위시리스트
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            관심 등록한 옥션 물건 <span className="font-bold text-black">{likedItems.length}</span>개
          </p>
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5">
          <ArrowUpDown className="w-3.5 h-3.5 text-gray-500" />
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
            className="text-xs font-semibold bg-transparent border-none text-gray-700 focus:outline-none cursor-pointer"
          >
            <option value="ending_soon">마감 임박순</option>
            <option value="price_low">낮은 가격순</option>
            <option value="price_high">높은 가격순</option>
          </select>
        </div>
      </header>

      {/* Main List: 2-Column Grid of ProductCards */}
      <div className="px-4 mt-4">
        {likedItems.length === 0 ? (
          /* Empty State */
          <div className="my-16 py-12 px-6 bg-white rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-3 text-red-400">
              <Heart className="w-8 h-8 stroke-[1.5]" />
            </div>
            <h3 className="text-base font-bold text-gray-800">
              위시리스트가 비어있습니다
            </h3>
            <p className="text-xs text-gray-500 mt-1 max-w-xs">
              마음에 드는 상품의 하트 아이콘을 눌러 관심 목록에 추가하고 실시간 호가 변동을 추적해보세요.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {likedItems.map((item) => (
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
