import React from 'react';
import { Heart, Flame, Clock, AlertCircle, Zap } from 'lucide-react';
import { AuctionItem } from '../types/auction';
import { formatKRW, getTimeRemaining } from '../utils/format';

interface ProductCardProps {
  item: AuctionItem;
  onSelect: (item: AuctionItem) => void;
  onToggleLike: (itemId: string, e: React.MouseEvent) => void;
  nowMs: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  item,
  onSelect,
  onToggleLike,
  nowMs,
}) => {
  const timeInfo = getTimeRemaining(item.endTime, nowMs);

  // 80% Buy Now evaporation threshold rule
  const isBuyNowClosed = Boolean(
    item.buyNowPrice && item.currentPrice >= item.buyNowPrice * 0.8
  );
  const isBuyNowAvailable = Boolean(item.buyNowPrice && !isBuyNowClosed);

  // Auto scale font size based on length of price string to avoid clipping
  const priceFormatted = formatKRW(item.currentPrice);
  const getPriceFontSizeClass = () => {
    if (priceFormatted.length > 13) return 'text-xs sm:text-sm font-bold tracking-tight';
    if (priceFormatted.length > 10) return 'text-sm sm:text-base font-bold tracking-tight';
    return 'text-base sm:text-lg font-bold tracking-tight';
  };

  return (
    <div
      onClick={() => onSelect(item)}
      className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)] transition-all duration-200 cursor-pointer select-none active:scale-[0.98]"
    >
      {/* 1:1 Square Image Container */}
      <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
        <img
          src={item.images[0]}
          alt={item.title}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
        />

        {/* Top-Left: Popular 🔥 Flame Overlay Badge */}
        {item.isHot && (
          <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-gradient-to-r from-red-600 to-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md backdrop-blur-xs">
            <Flame className="w-3 h-3 fill-current text-yellow-200 animate-pulse" />
            <span>HOT</span>
          </div>
        )}

        {/* Bottom-Right: Dark capsule countdown timer badge (Separated to bottom to avoid overlapping with HOT on mobile) */}
        {!(timeInfo.isExpired || item.status === 'ended') && (
          <div
            className={`absolute bottom-2 right-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium tracking-tight shadow-md backdrop-blur-md transition-colors ${
              timeInfo.isUrgent
                ? 'bg-red-600/90 text-white animate-pulse'
                : 'bg-black/75 text-white'
            }`}
          >
            {timeInfo.isUrgent ? (
              <AlertCircle className="w-3 h-3 text-red-200 shrink-0" />
            ) : (
              <Clock className="w-3 h-3 text-gray-300 shrink-0" />
            )}
            <span className="font-mono tabular-nums font-semibold whitespace-nowrap">
              {timeInfo.text}
            </span>
          </div>
        )}

        {/* Ended overlay if auction finished */}
        {(timeInfo.isExpired || item.status === 'ended') && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-black/85 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
              {item.isBuyNowWon ? '⚡ 즉시구매 완료' : '경매 마감'}
            </span>
          </div>
        )}
      </div>

      {/* Info Area */}
      <div className="p-3 sm:p-3.5 flex flex-col justify-between flex-1 bg-white">
        {/* Line 1: Item Title with Graceful Ellipsis */}
        <div className="mb-2">
          <p
            className="text-[13px] sm:text-sm font-medium text-gray-900 line-clamp-2 leading-snug tracking-tight group-hover:text-black transition-colors"
            title={item.title}
          >
            {item.title}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <span className="text-[11px] text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
              {item.category}
            </span>
            <span className="text-[11px] text-gray-600">
              입찰 {item.bidCount}회
            </span>
            {isBuyNowAvailable && item.status === 'active' && (
              <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <Zap className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                즉시구매
              </span>
            )}
            {isBuyNowClosed && item.status === 'active' && (
              <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200/80 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                즉시구매 마감
              </span>
            )}
          </div>
        </div>

        {/* Line 2 (Justified): Bold Current Highest Bid & Heart Toggle */}
        <div className="flex items-center justify-between pt-1 border-t border-gray-50 mt-auto">
          <div className="min-w-0 pr-1 flex flex-col">
            <span className="text-[10px] text-gray-600 font-medium leading-none">
              현재 최고가
            </span>
            <span
              className={`text-gray-950 mt-0.5 truncate ${getPriceFontSizeClass()}`}
            >
              {priceFormatted}
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => onToggleLike(item.id, e)}
            aria-label={item.isLiked ? '관심 해제' : '관심 등록'}
            className="p-1.5 -mr-1 rounded-full hover:bg-gray-100 active:scale-90 transition-all text-gray-400 hover:text-red-500"
          >
            <Heart
              className={`w-5 h-5 transition-transform duration-150 ${
                item.isLiked
                  ? 'fill-red-500 text-red-500 scale-105'
                  : 'stroke-[1.8] hover:scale-110'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
