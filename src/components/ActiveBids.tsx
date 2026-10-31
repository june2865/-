import React, { useState, useMemo } from 'react';
import {
  RotateCcw,
  Gavel,
  ChevronRight,
  Heart,
  Clock,
  Sparkles,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { AuctionItem } from '../types/auction';
import { formatKRW, getTimeRemaining, playChimeSound } from '../utils/format';

interface ActiveBidsProps {
  items: AuctionItem[];
  onSelectItem: (item: AuctionItem) => void;
  onToggleLike: (itemId: string, e: React.MouseEvent) => void;
  nowMs: number;
  onRefresh: () => void;
}

type BidFilterTab = 'all' | 'bidding' | 'lost' | 'completed';

export const ActiveBids: React.FC<ActiveBidsProps> = ({
  items,
  onSelectItem,
  onToggleLike,
  nowMs,
  onRefresh,
}) => {
  const [activeFilter, setActiveFilter] = useState<BidFilterTab>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Items in which the user has placed bids or has a bid status
  const myBidItems = useMemo(() => {
    return items.filter(
      (item) =>
        item.myBidStatus !== null &&
        item.myBidStatus !== undefined &&
        (item.bids.some((b) => b.isMe) || item.myBidStatus)
    );
  }, [items]);

  // Dashboard counts
  const winningCount = useMemo(() => {
    return myBidItems.filter(
      (item) => item.myBidStatus === 'winning' && item.status === 'active' && item.endTime > nowMs
    ).length;
  }, [myBidItems, nowMs]);

  const failedCount = useMemo(() => {
    return myBidItems.filter((item) => {
      const isEnded = item.status === 'ended' || item.endTime <= nowMs;
      if (isEnded) {
        return item.myBidStatus !== 'won';
      }
      return item.myBidStatus === 'outbid' || item.myBidStatus === 'lost';
    }).length;
  }, [myBidItems, nowMs]);

  // Outbid items (strictly active and not ended)
  const outbidItems = useMemo(() => {
    return myBidItems.filter(
      (item) => item.status === 'active' && item.endTime > nowMs && item.myBidStatus === 'outbid'
    );
  }, [myBidItems, nowMs]);

  // Filtered list
  const filteredItems = useMemo(() => {
    return myBidItems.filter((item) => {
      const isEnded = item.status === 'ended' || item.endTime <= nowMs;
      if (activeFilter === 'all') return true;
      if (activeFilter === 'bidding') {
        return !isEnded && item.myBidStatus === 'winning';
      }
      if (activeFilter === 'lost') {
        return (!isEnded && item.myBidStatus === 'outbid') || (isEnded && item.myBidStatus !== 'won');
      }
      if (activeFilter === 'completed') {
        return isEnded && item.myBidStatus === 'won';
      }
      return true;
    });
  }, [myBidItems, activeFilter, nowMs]);

  const handleRefreshClick = () => {
    setIsRefreshing(true);
    playChimeSound('pop');
    onRefresh();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  const getStatusBadge = (item: AuctionItem) => {
    const isEnded = item.status === 'ended' || item.endTime <= nowMs;

    if (isEnded) {
      if (item.myBidStatus === 'won') {
        if (item.isBuyNowWon) {
          return (
            <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300">
              <Zap className="w-3 h-3 text-amber-600 fill-amber-600" />
              즉시구매 낙찰
            </span>
          );
        }
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            낙찰 완료
          </span>
        );
      }
      return (
        <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
          낙찰 실패
        </span>
      );
    }

    if (item.myBidStatus === 'outbid') {
      return (
        <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
          <AlertCircle className="w-3 h-3 text-rose-500" />
          상위 입찰 발생
        </span>
      );
    }

    if (item.myBidStatus === 'winning') {
      return (
        <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
          최고가 유지
        </span>
      );
    }

    return null;
  };

  return (
    <div className="pb-28 pt-2">
      {/* Top Header */}
      <header className="px-4 py-3 bg-white sticky top-0 z-30 border-b border-gray-100">
        <h1 className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight">
          내 입찰 현황
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          실시간으로 변경되는 입찰 정보
        </p>
      </header>

      {/* Calm & Refined Outbid Alert Banner (Active & Unexpired Only) */}
      {outbidItems.length > 0 && (
        <div className="mx-4 mt-3 p-3 rounded-2xl bg-gray-900 text-white flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white">
                  상위 입찰 발생
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {outbidItems.length}건
                </span>
              </div>
              <p className="text-[11px] text-gray-300 truncate mt-0.5">
                더 높은 입찰가가 등록되었습니다. 종료 전 확인해보세요.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveFilter('lost')}
            className="px-3 py-1.5 bg-white text-gray-950 hover:bg-gray-100 active:scale-95 text-xs font-semibold rounded-xl shrink-0 transition-all cursor-pointer"
          >
            보기
          </button>
        </div>
      )}

      {/* Summary Dashboard: 2 Rounded Summary Cards */}
      <div className="px-4 mt-3 grid grid-cols-2 gap-3">
        {/* Left Card: 낙찰 예정 */}
        <div
          onClick={() => setActiveFilter('bidding')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeFilter === 'bidding'
              ? 'bg-black text-white border-black shadow-md'
              : 'bg-white text-gray-900 border-gray-100 shadow-xs hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-semibold ${
                activeFilter === 'bidding' ? 'text-gray-300' : 'text-gray-500'
              }`}
            >
              낙찰 예정
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                winningCount > 0 ? 'bg-emerald-400 animate-ping' : 'bg-gray-300'
              }`}
            />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black tracking-tight">
              {winningCount}
            </span>
            <span className="text-xs font-medium">건</span>
          </div>
          <p
            className={`text-[10px] mt-1 ${
              activeFilter === 'bidding' ? 'text-gray-400' : 'text-emerald-600'
            }`}
          >
            현재 최고가 유지 중
          </p>
        </div>

        {/* Right Card: 낙찰 실패 */}
        <div
          onClick={() => setActiveFilter('lost')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeFilter === 'lost'
              ? 'bg-black text-white border-black shadow-md'
              : 'bg-white text-gray-900 border-gray-100 shadow-xs hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-semibold ${
                activeFilter === 'lost' ? 'text-gray-300' : 'text-gray-500'
              }`}
            >
              낙찰 실패
            </span>
            <span className="w-2 h-2 rounded-full bg-red-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black tracking-tight text-red-500">
              {failedCount}
            </span>
            <span className="text-xs font-medium">건</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">
            호가 갱신 또는 마감
          </p>
        </div>
      </div>

      {/* 4 Capsule Filter Tabs */}
      <div className="px-4 mt-4">
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-full">
          <button
            onClick={() => setActiveFilter('all')}
            type="button"
            className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-all ${
              activeFilter === 'all'
                ? 'bg-white text-gray-950 shadow-xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            전체
          </button>
          <button
            onClick={() => setActiveFilter('bidding')}
            type="button"
            className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-all ${
              activeFilter === 'bidding'
                ? 'bg-white text-gray-950 shadow-xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            입찰 중
          </button>
          <button
            onClick={() => setActiveFilter('lost')}
            type="button"
            className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-all ${
              activeFilter === 'lost'
                ? 'bg-white text-gray-950 shadow-xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            낙찰 실패
          </button>
          <button
            onClick={() => setActiveFilter('completed')}
            type="button"
            className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-all ${
              activeFilter === 'completed'
                ? 'bg-white text-gray-950 shadow-xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            구매 완료
          </button>
        </div>
      </div>

      {/* List Header: 실시간 경매 참여 중 + 새로고침 */}
      <div className="px-4 mt-5 flex items-center justify-between">
        <h2 className="text-sm sm:text-base font-black text-gray-950 tracking-tight flex items-center gap-2">
          <span>실시간 경매 참여 중</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </h2>

        <button
          onClick={handleRefreshClick}
          type="button"
          className="flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-black py-1 px-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <RotateCcw
            className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-black' : ''}`}
          />
          <span>새로고침</span>
        </button>
      </div>

      {/* List Area */}
      <div className="px-4 mt-3 space-y-3">
        {filteredItems.length === 0 ? (
          /* Empty State */
          <div className="my-12 py-12 px-6 bg-white rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-3 text-gray-400">
              <Gavel className="w-8 h-8 stroke-[1.5]" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-gray-800">
              참여 중인 경매가 없습니다
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              지금 바로 새로운 경매에 참여해보세요
            </p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const timeInfo = getTimeRemaining(item.endTime, nowMs);

            const isEnded = item.status === 'ended' || timeInfo.isExpired || item.endTime <= nowMs;
            const isOutbid = !isEnded && item.myBidStatus === 'outbid';

            if (isOutbid) {
              return (
                <div
                  key={item.id}
                  onClick={() => onSelectItem(item)}
                  className="group rounded-2xl border border-gray-200 bg-white hover:border-gray-300 transition-all cursor-pointer relative select-none overflow-hidden shadow-xs"
                >
                  {/* Subtle Outbid Top Bar */}
                  <div className="bg-rose-50/70 border-b border-rose-100/80 px-3.5 py-1.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      <span className="text-[11px] font-semibold text-rose-800">
                        상위 입찰 발생
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono font-medium">
                      종료까지 {timeInfo.text}
                    </span>
                  </div>

                  <div className="p-3.5">
                    <div className="flex gap-3">
                      {/* Thumbnail */}
                      <div className="relative w-22 h-22 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-center gap-1 py-0.5 rounded-md text-[10px] font-mono font-medium bg-black/75 text-white">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{timeInfo.text}</span>
                        </div>
                      </div>

                      {/* Info Container */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-1">
                            <p className="text-xs sm:text-sm font-semibold text-gray-900 line-clamp-1 group-hover:text-black transition-colors">
                              {item.title}
                            </p>
                            <button
                              type="button"
                              onClick={(e) => onToggleLike(item.id, e)}
                              className="p-1 text-gray-400 hover:text-red-500 shrink-0"
                            >
                              <Heart
                                className={`w-4 h-4 ${
                                  item.isLiked ? 'fill-red-500 text-red-500' : ''
                                }`}
                              />
                            </button>
                          </div>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            판매자: {item.seller.name}
                          </p>
                        </div>

                        {/* Price Callout */}
                        <div className="mt-2 p-2 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-gray-500 block leading-tight">
                              현재 최고가
                            </span>
                            <span className="text-sm font-bold text-gray-950 font-mono">
                              {formatKRW(item.currentPrice)}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-gray-500 block leading-tight">
                              다음 입찰가
                            </span>
                            <span className="text-xs font-semibold text-gray-800 font-mono">
                              {formatKRW(item.currentPrice + item.minIncrement)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Clean Re-Bid CTA Button */}
                    <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectItem(item);
                        }}
                        className="w-full py-2.5 px-3 rounded-xl bg-gray-900 hover:bg-black text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Gavel className="w-3.5 h-3.5" />
                        <span>재입찰하기 ({formatKRW(item.currentPrice + item.minIncrement)})</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={item.id}
                onClick={() => onSelectItem(item)}
                className="group p-3.5 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_6px_rgba(0,0,0,0.03)] hover:shadow-md transition-all cursor-pointer flex gap-3 relative select-none"
              >
                {/* Thumbnail */}
                <div className="relative w-22 h-22 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Ended centered overlay or Active timer badge */}
                  {item.status === 'ended' || timeInfo.isExpired ? (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="bg-black/85 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-md whitespace-nowrap">
                        {item.isBuyNowWon ? '⚡ 즉시구매 완료' : '경매 마감'}
                      </span>
                    </div>
                  ) : (
                    <div
                      className={`absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-center gap-1 py-0.5 rounded-md text-[10px] font-mono font-semibold ${
                        timeInfo.isUrgent
                          ? 'bg-pink-100 text-pink-700'
                          : 'bg-black/75 text-white'
                      }`}
                    >
                      <Clock className="w-2.5 h-2.5" />
                      <span>{timeInfo.text}</span>
                    </div>
                  )}
                </div>

                {/* Info Container */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-1">
                      <p className="text-xs sm:text-sm font-semibold text-gray-900 line-clamp-1 group-hover:text-black">
                        {item.title}
                      </p>
                      <button
                        type="button"
                        onClick={(e) => onToggleLike(item.id, e)}
                        className="p-1 text-gray-400 hover:text-red-500 shrink-0"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            item.isLiked ? 'fill-red-500 text-red-500' : ''
                          }`}
                        />
                      </button>
                    </div>

                    <p className="text-[11px] text-gray-500 mt-0.5">
                      판매자: {item.seller.name}
                    </p>
                  </div>

                  <div className="mt-2 flex items-end justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 block leading-tight">
                        현재 최고가
                      </span>
                      <span className="text-sm sm:text-base font-black text-gray-950">
                        {formatKRW(item.currentPrice)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {getStatusBadge(item)}
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
