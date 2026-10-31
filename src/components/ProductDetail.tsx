import React, { useState } from 'react';
import {
  ArrowLeft,
  Share2,
  Heart,
  Clock,
  Users,
  Flame,
  BadgeCheck,
  Star,
  ShieldCheck,
  Gavel,
  History,
  TrendingUp,
  AlertCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
  Check,
  Zap,
  Bot,
  ShieldAlert,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AuctionItem } from '../types/auction';
import {
  formatKRW,
  formatKoreanNumberWords,
  getTimeRemaining,
  playChimeSound,
} from '../utils/format';
import { BidConfirmModal } from './BidConfirmModal';

interface ProductDetailProps {
  item: AuctionItem;
  onBack: () => void;
  onToggleLike: (itemId: string, e: React.MouseEvent) => void;
  onPlaceBid: (
    itemId: string,
    amount: number,
    bidderName: string
  ) => { success: boolean; message: string };
  onBuyNow: (
    itemId: string,
    userName: string
  ) => { success: boolean; message: string };
  onAutoBid: (
    itemId: string,
    maxLimit: number,
    bidderName: string
  ) => { success: boolean; message: string; requiresInstantBuy?: boolean };
  nowMs: number;
  userName: string;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({
  item,
  onBack,
  onToggleLike,
  onPlaceBid,
  onBuyNow,
  onAutoBid,
  nowMs,
  userName,
}) => {
  const isMyItem =
    item.seller.name === userName || item.seller.name.includes(userName);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isAutoBidModalOpen, setIsAutoBidModalOpen] = useState(false);
  const [autoBidLimit, setAutoBidLimit] = useState<number>(
    item.myAutoBidLimit || item.currentPrice + item.minIncrement * 2
  );
  const [isPromptInstantBidOpen, setIsPromptInstantBidOpen] = useState(false);
  const [autoBidError, setAutoBidError] = useState<string | null>(null);
  const [isBidSheetOpen, setIsBidSheetOpen] = useState(false);
  const [isBuyNowModalOpen, setIsBuyNowModalOpen] = useState(false);
  const [bidAmount, setBidAmount] = useState<number>(
    item.currentPrice + item.minIncrement
  );
  const [copiedToast, setCopiedToast] = useState(false);
  const [bidError, setBidError] = useState<string | null>(null);
  const timeInfo = getTimeRemaining(item.endTime, nowMs);
  const nextMinBid = item.currentPrice + item.minIncrement;
  const isEnded = item.status === 'ended' || timeInfo.isExpired;

  // 80% Buy Now evaporation threshold rule
  const BUY_NOW_RATIO_THRESHOLD = 0.8;
  const isBuyNowClosed = Boolean(
    item.buyNowPrice && item.currentPrice >= item.buyNowPrice * BUY_NOW_RATIO_THRESHOLD
  );
  const isBuyNowAvailable = Boolean(item.buyNowPrice && !isBuyNowClosed);

  const handleConfirmQuickBid = () => {
    if (isMyItem) {
      setBidError('본인이 등록한 경매 물품에는 입찰할 수 없습니다.');
      return;
    }
    const nextPrice = item.currentPrice + item.minIncrement;
    const result = onPlaceBid(item.id, nextPrice, userName);
    if (result.success) {
      playChimeSound('bid');
      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.75 },
          colors: ['#000000', '#FF3B30', '#FF9500', '#FFCC00'],
        });
      } catch {}
      setIsConfirmModalOpen(false);
    } else {
      setBidError(result.message);
    }
  };

  const handleOpenAutoBidModal = () => {
    if (isMyItem) return;
    setAutoBidLimit(
      item.myAutoBidLimit || item.currentPrice + item.minIncrement * 2
    );
    setAutoBidError(null);
    setIsAutoBidModalOpen(true);
  };

  const handleSubmitAutoBid = () => {
    if (autoBidLimit < nextMinBid) {
      setAutoBidError(
        `자동 입찰 한도는 최소 ₩${nextMinBid.toLocaleString('ko-KR')} 이상이어야 합니다.`
      );
      return;
    }

    // User requirement: "만약에 자동 입찰 금액이 즉시 구매 금액과 같거나 높다면 즉시 입찰 하시겠습니까? 문구가 뜨도록 설계"
    // (단, 현재가가 80%를 넘지 않아 즉시구매가 유효할 때만 즉시 입찰 확인 모달 표시)
    if (isBuyNowAvailable && item.buyNowPrice && autoBidLimit >= item.buyNowPrice) {
      setIsPromptInstantBidOpen(true);
      return;
    }

    const result = onAutoBid(item.id, autoBidLimit, userName);
    if (result.success) {
      playChimeSound('bid');
      try {
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.7 },
          colors: ['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD'],
        });
      } catch {}
      setIsAutoBidModalOpen(false);
    } else {
      setAutoBidError(result.message);
    }
  };

  const handleConfirmInstantBidFromAuto = () => {
    setIsPromptInstantBidOpen(false);
    setIsAutoBidModalOpen(false);
    handleExecuteBuyNow();
  };

  const handleExecuteBuyNow = () => {
    if (isMyItem || isBuyNowClosed) return;
    const result = onBuyNow(item.id, userName);
    if (result.success) {
      playChimeSound('win');
      try {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.7 },
          colors: ['#F59E0B', '#EF4444', '#10B981', '#6366F1'],
        });
      } catch {}
      setIsBuyNowModalOpen(false);
    }
  };

  // Ensure bid amount stays at least nextMinBid
  const handleOpenBidSheet = () => {
    setBidAmount(item.currentPrice + item.minIncrement);
    setBidError(null);
    setIsBidSheetOpen(true);
  };

  const handleQuickAdd = (increment: number) => {
    setBidAmount((prev) => Math.max(nextMinBid, prev + increment));
    setBidError(null);
  };

  const handleExecuteBid = () => {
    if (bidAmount < nextMinBid) {
      setBidError(`최소 입찰 금액은 ${formatKRW(nextMinBid)} 이상이어야 합니다.`);
      return;
    }

    const result = onPlaceBid(item.id, bidAmount, userName);
    if (result.success) {
      playChimeSound('bid');
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#000000', '#FF3B30', '#FF9500', '#FFCC00'],
        });
      } catch {
        // Safe fallback
      }
      setIsBidSheetOpen(false);
    } else {
      setBidError(result.message);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            type="button"
            aria-label="뒤로가기"
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 active:scale-95 text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
          </button>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleShare}
              type="button"
              aria-label="공유하기"
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 active:scale-95 text-gray-700 transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={(e) => onToggleLike(item.id, e)}
              type="button"
              aria-label={item.isLiked ? '관심 해제' : '관심 등록'}
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 active:scale-95 text-gray-700 transition-colors"
            >
              <Heart
                className={`w-5 h-5 transition-transform duration-150 ${
                  item.isLiked
                    ? 'fill-red-500 text-red-500 scale-110'
                    : 'stroke-[1.8]'
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Share Toast */}
      {copiedToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-black text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg animate-in fade-in zoom-in-95">
          링크가 클립보드에 복사되었습니다!
        </div>
      )}

      {/* Main Content Area */}
      <main className="pt-14 max-w-md mx-auto">
        {/* Image Gallery (Swipe / Selectable) */}
        <div className="relative w-full aspect-square bg-gray-100 overflow-hidden select-none">
          <img
            src={item.images[currentImageIndex] || item.images[0]}
            alt={item.title}
            className="w-full h-full object-cover"
          />

          {/* Hot Badge */}
          {item.isHot && (
            <div className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-gradient-to-r from-red-600 to-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
              <Flame className="w-3.5 h-3.5 fill-current text-yellow-200 animate-pulse" />
              <span>HOT</span>
            </div>
          )}

          {/* Image Navigation Arrows */}
          {item.images.length > 1 && (
            <>
              <button
                onClick={() =>
                  setCurrentImageIndex((prev) =>
                    prev === 0 ? item.images.length - 1 : prev - 1
                  )
                }
                type="button"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/70 hover:bg-white text-black flex items-center justify-center backdrop-blur-xs shadow-md transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  setCurrentImageIndex((prev) =>
                    prev === item.images.length - 1 ? 0 : prev + 1
                  )
                }
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/70 hover:bg-white text-black flex items-center justify-center backdrop-blur-xs shadow-md transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Dots Indicator */}
          {item.images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-xs">
              {item.images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    currentImageIndex === idx
                      ? 'w-4 bg-white'
                      : 'bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Thumbnail Preview Row */}
        {item.images.length > 1 && (
          <div className="px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar bg-white border-b border-gray-100">
            {item.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                  currentImageIndex === idx
                    ? 'border-black ring-1 ring-black'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Real-Time Auction Timer Bar */}
        <div className="mx-4 mt-4 p-4 bg-gradient-to-r from-gray-950 via-gray-900 to-black text-white rounded-2xl shadow-lg flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                timeInfo.isUrgent
                  ? 'bg-red-500/20 text-red-400 animate-pulse'
                  : 'bg-white/10 text-amber-300'
              }`}
            >
              <Clock className="w-5 h-5" />
            </div>

            <div className="min-w-0">
              <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">
                남은 시간
              </span>
              {isEnded ? (
                <div>
                  <span className="text-xl font-mono font-black tracking-tight text-white whitespace-nowrap">
                    00:00
                  </span>
                  <span className="text-[10px] text-gray-400 font-semibold block leading-tight mt-0.5">
                    마감
                  </span>
                </div>
              ) : (
                <span className="text-xl font-mono font-black tracking-tight text-white whitespace-nowrap">
                  {timeInfo.text}
                </span>
              )}
            </div>
          </div>

          <div className="text-right shrink-0 whitespace-nowrap">
            <div className="inline-flex items-center justify-end gap-1.5 text-emerald-400 text-xs font-bold whitespace-nowrap">
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">입찰 참여 {item.bidCount}명</span>
            </div>
            <span className="text-[10px] text-gray-400 mt-0.5 block whitespace-nowrap">
              조회 {item.views.toLocaleString()}회
            </span>
          </div>
        </div>

        {/* Calm Outbid Alert Banner (Active & Unexpired Only) */}
        {!isMyItem && item.myBidStatus === 'outbid' && item.status === 'active' && !timeInfo.isExpired && item.endTime > nowMs && (
          <div className="mx-4 mt-3 rounded-2xl border border-rose-200 bg-rose-50/70 p-3.5 text-gray-900 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span className="text-xs font-bold text-rose-900 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                  상위 입찰 발생
                </span>
              </div>
              <span className="text-[11px] font-medium text-rose-700 bg-white px-2 py-0.5 rounded-md border border-rose-200/80">
                재입찰 가능
              </span>
            </div>

            <p className="text-xs text-gray-700 leading-relaxed">
              다른 입찰자가 더 높은 금액을 제시했습니다. 현재 최고가는 <strong className="font-bold text-gray-950">{formatKRW(item.currentPrice)}</strong>입니다.
            </p>

            {/* Price comparison box */}
            <div className="mt-2.5 p-2.5 bg-white rounded-xl border border-rose-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-gray-500 block">
                  현재 최고가
                </span>
                <span className="font-bold font-mono text-sm text-gray-950">
                  {formatKRW(item.currentPrice)}
                </span>
              </div>
              <div className="w-px h-6 bg-gray-200" />
              <div className="text-right">
                <span className="text-[10px] text-gray-500 block">
                  다음 추천 호가
                </span>
                <span className="font-bold font-mono text-sm text-rose-600">
                  {formatKRW(nextMinBid)}
                </span>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={handleOpenBidSheet}
                className="w-full py-2.5 px-3 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Gavel className="w-3.5 h-3.5" />
                <span>재입찰하기 ({formatKRW(nextMinBid)})</span>
              </button>
            </div>
          </div>
        )}



        {/* User Active Auto-Bid Limit Badge */}
        {!isMyItem && item.myAutoBidLimit && item.status === 'active' && (
          <div className="mx-4 mt-2 px-3.5 py-2.5 bg-blue-50 rounded-2xl border border-blue-200 text-xs text-blue-950 flex items-center justify-between shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold block text-blue-950">
                  스마트 자동 입찰 가동 중
                </span>
                <span className="text-[11px] text-blue-700 font-mono">
                  설정 한도: {formatKRW(item.myAutoBidLimit)}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleOpenAutoBidModal}
              className="px-2.5 py-1 bg-white border border-blue-300 text-blue-700 rounded-xl text-[11px] font-bold hover:bg-blue-100 transition-colors shadow-2xs"
            >
              한도 변경
            </button>
          </div>
        )}



        {/* Product Details Section */}
        <div className="px-4 mt-5 space-y-5">
          {/* Title & Category & Condition */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold bg-black text-white px-2 py-0.5 rounded-md">
                {item.category}
              </span>
              <span className="text-xs font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md">
                상태: {item.condition}
              </span>
              {item.autoRebidAllowed && (
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                  자동 재입찰 가능
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight leading-snug">
              {item.title}
            </h1>

            {/* Seller Hashtags */}
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center text-[11px] font-semibold text-blue-700 bg-blue-50/80 border border-blue-200/60 px-2 py-0.5 rounded-full"
                  >
                    #{tag.replace(/^#+/, '')}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Buy It Now (즉시구매) Banner: Active vs Closed */}
          {item.buyNowPrice && item.status === 'active' && (
            isBuyNowAvailable ? (
              <div className="p-3.5 sm:p-4 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-amber-500/10 border border-amber-300 rounded-2xl flex items-center justify-between shadow-xs gap-2">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      <span className="text-[10px] font-black bg-amber-500 text-white px-1.5 py-0.5 rounded shrink-0">
                        BUY NOW
                      </span>
                      <span className="text-xs font-black text-amber-950 whitespace-nowrap">
                        즉시구매 가능 물건
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-900 mt-0.5 break-keep leading-snug">
                      즉시구매가로 바로 낙찰받을 수 있습니다.
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0 pl-2">
                  <span className="text-[10px] text-amber-700 font-semibold block leading-tight">
                    즉시구매가
                  </span>
                  <span className="text-sm sm:text-base font-black text-amber-950 font-mono whitespace-nowrap">
                    {formatKRW(item.buyNowPrice)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-2.5 px-3.5 bg-gradient-to-r from-red-500/10 via-rose-500/5 to-red-500/10 border border-red-200/90 rounded-2xl flex items-center gap-2.5 shadow-2xs animate-in fade-in">
                <div className="w-6 h-6 rounded-lg bg-red-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                </div>
                <div className="min-w-0 flex-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                  <span className="text-[10px] font-black bg-red-600 text-white px-1.5 py-0.5 rounded shrink-0 leading-none">
                    즉시구매 마감
                  </span>
                  <p className="text-[11px] sm:text-xs text-red-950 font-semibold break-keep leading-snug">
                    현재가 상승으로 즉시구매가 마감되어 실시간 경매로 진행됩니다.
                  </p>
                </div>
              </div>
            )
          )}

          {/* Seller Profile Card */}
          <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                <img
                  src={item.seller.avatar}
                  alt={item.seller.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-gray-950">
                    {item.seller.name}
                  </span>
                  {item.seller.verified && (
                    <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-50" />
                  )}
                </div>

                <div className="flex items-center gap-2 mt-0.5">
                  <span className="flex items-center gap-0.5 text-xs font-bold text-amber-600">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    {item.seller.rating}
                  </span>
                  <span className="text-xs text-gray-400">·</span>
                  <span className="text-xs text-gray-500">
                    거래 {item.seller.salesCount}회
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-xl">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>인증 셀러</span>
            </div>
          </div>

          {/* Description Section */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
            <h3 className="text-sm font-bold text-gray-950 mb-2">
              상품 상세 설명
            </h3>
            <p className="text-xs sm:text-sm text-gray-700 whitespace-pre-line leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Real-time Bidding History Log */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <History className="w-4 h-4 text-gray-600" />
                <h3 className="text-sm font-bold text-gray-950">
                  실시간 입찰 내역
                </h3>
              </div>
              <span className="text-xs text-gray-500 font-semibold">
                총 {item.bids.length}건
              </span>
            </div>

            {item.bids.length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-400">
                아직 입찰 내역이 없습니다. 첫 번째 입찰자가 되어보세요!
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto no-scrollbar">
                {item.bids.map((bid, idx) => {
                  const isTopBid = idx === 0;

                  return (
                    <div
                      key={bid.id}
                      className={`p-2.5 rounded-xl flex items-center justify-between text-xs transition-colors ${
                        isTopBid
                          ? 'bg-amber-50/80 border border-amber-200'
                          : 'bg-gray-50 border border-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isTopBid ? (
                          <span className="w-5 h-5 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-[10px]">
                            1위
                          </span>
                        ) : (
                          <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 font-semibold flex items-center justify-center text-[10px]">
                            {idx + 1}
                          </span>
                        )}

                        <div>
                          <span
                            className={`font-bold ${
                              bid.isMe ? 'text-blue-600' : 'text-gray-900'
                            }`}
                          >
                            {bid.bidderName.replace(/\s*\(나\)\s*$/, '')} {bid.isMe && '(나)'}
                          </span>
                          <span className="text-[10px] text-gray-400 block">
                            {new Date(bid.timestamp).toLocaleTimeString('ko-KR', {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`font-black font-mono text-sm ${
                            isTopBid ? 'text-gray-950' : 'text-gray-700'
                          }`}
                        >
                          {formatKRW(bid.amount)}
                        </span>
                        {isTopBid && (
                          <span className="text-[10px] text-emerald-600 font-bold block">
                            {isEnded ? '낙찰자' : '낙찰 예정자'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pricing Summary Box (화면 맨 아래 실시간 입찰 내역 밑으로 이동) */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-500 font-semibold block">
                경매 시작가
              </span>
              <span className="text-sm font-bold text-gray-700 font-mono">
                {formatKRW(item.startPrice)}
              </span>
            </div>

            <div className="w-px h-8 bg-gray-200" />

            <div>
              <span className="text-xs text-gray-500 font-semibold block">
                최소 호가 단위
              </span>
              <span className="text-sm font-bold text-gray-700 font-mono">
                +{formatKRW(item.minIncrement)}
              </span>
            </div>

            <div className="w-px h-8 bg-gray-200" />

            <div className="text-right">
              <span className="text-xs text-red-600 font-bold block">
                {isEnded ? '최종 낙찰가' : '현재 최고가'}
              </span>
              <span className="text-lg font-black text-gray-950 font-mono">
                {formatKRW(item.currentPrice)}
              </span>
            </div>
          </div>

          {/* In-Page Bidding Section (실시간 입찰 내역 밑으로 이동) */}
          <div className="p-4 bg-white rounded-2xl border-2 border-gray-900/10 shadow-sm space-y-3">
            {item.status === 'ended' || timeInfo.isExpired ? (
              <div className="py-3 px-4 bg-gray-100 border border-gray-200 rounded-xl text-center text-xs font-bold text-gray-600">
                {item.isBuyNowWon ? '⚡ 즉시구매로 낙찰 완료된 경매입니다' : '경매가 마감되었습니다'}
              </div>
            ) : isMyItem ? (
              <div className="py-3 px-3 bg-red-50 border border-red-200 rounded-xl text-center flex items-center justify-center gap-1.5 text-xs text-red-700 font-bold">
                <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
                <span>본인이 등록한 경매 물품에는 입찰할 수 없습니다</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {/* 1. 입찰하기 버튼 (클릭 시 입찰 확인 모달) */}
                <button
                  type="button"
                  onClick={() => setIsConfirmModalOpen(true)}
                  className="py-3.5 px-3 bg-black hover:bg-gray-800 active:scale-[0.98] text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <Gavel className="w-4 h-4 stroke-[2.4]" />
                  <span>입찰하기 ({formatKRW(nextMinBid)})</span>
                </button>

                {/* 2. 자동 입찰 버튼 (스마트 자동 입찰 모달) */}
                <button
                  type="button"
                  onClick={handleOpenAutoBidModal}
                  className="py-3.5 px-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-black text-xs sm:text-sm rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <Bot className="w-4 h-4 stroke-[2.2]" />
                  <span>스마트 자동 입찰</span>
                </button>

                {/* 3. 즉시구매 버튼 (80% 미만 시만 노출, 80% 이상 시 자동 증발) */}
                {isBuyNowAvailable && (
                  <button
                    type="button"
                    onClick={() => setIsBuyNowModalOpen(true)}
                    className="col-span-2 py-3 px-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 active:scale-[0.98] text-white font-black text-xs sm:text-sm rounded-xl shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Zap className="w-4 h-4 fill-current text-yellow-100" />
                    <span>{formatKRW(item.buyNowPrice!)} 즉시구매</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Fixed Bottom Bidding Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-8px_20px_rgba(0,0,0,0.06)] px-4 py-3 pb-[max(env(safe-area-inset-bottom),12px)]">
        <div className="max-w-md mx-auto">
          {/* Calm Outbid notice pill (Active & Unexpired Only) */}
          {!isMyItem && item.myBidStatus === 'outbid' && item.status === 'active' && !timeInfo.isExpired && item.endTime > nowMs && (
            <div className="mb-2 py-1.5 px-3 bg-rose-50/90 border border-rose-200/80 rounded-xl flex items-center justify-between text-xs text-rose-900">
              <span className="flex items-center gap-1.5 font-medium text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                상위 입찰이 발생했습니다.
              </span>
              <span className="text-[10px] font-semibold text-rose-700 bg-white px-2 py-0.5 rounded border border-rose-200">
                재입찰 가능
              </span>
            </div>
          )}

          <div className="flex items-center justify-between gap-4">
            {/* Left: Current Highest Bid & Min Increment */}
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-gray-500 font-bold">
                  현재 최고가
                </span>
                <span className="text-[10px] text-red-600 bg-red-50 px-1 rounded font-semibold">
                  +{formatKRW(item.minIncrement)} 단위
                </span>
              </div>
              <span className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight font-mono truncate">
                {formatKRW(item.currentPrice)}
              </span>
            </div>

            {/* Right: Point Color Action Buttons */}
            {item.status === 'ended' || timeInfo.isExpired ? (
              <div className="flex-1 py-3 px-4 bg-gray-100 border border-gray-200 rounded-2xl text-center">
                <span className="text-xs font-bold text-gray-600">
                  {item.isBuyNowWon ? '⚡ 즉시구매로 낙찰 완료됨' : '경매가 마감되었습니다'}
                </span>
              </div>
            ) : isMyItem ? (
              /* Seller Self-Bidding Prevention (Requirement: "본인이 올린 입찰에는 비딩 못하도록 막아놔") */
              <div className="flex-1 py-3 px-3 bg-gray-100 border border-gray-200 rounded-2xl text-center flex items-center justify-center gap-1.5 text-gray-500">
                <ShieldAlert className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="text-xs font-bold leading-tight">본인 등록 물품 (입찰 불가)</span>
              </div>
            ) : (
              <div className="flex-1 flex items-center gap-1.5 sm:gap-2">
                {/* 일반 입찰 버튼 (상위 입찰 발생 시 차분한 재입찰 라벨) */}
                <button
                  onClick={() => setIsConfirmModalOpen(true)}
                  type="button"
                  className="flex-1 py-3 sm:py-3.5 px-2 active:scale-[0.98] bg-gray-950 hover:bg-black text-white font-bold text-xs rounded-2xl shadow-sm transition-all flex items-center justify-center gap-1"
                >
                  <Gavel className="w-3.5 h-3.5 stroke-[2.2]" />
                  <span>{item.myBidStatus === 'outbid' ? '재입찰하기' : '입찰하기'}</span>
                </button>

                {/* 자동 입찰 버튼 */}
                <button
                  onClick={handleOpenAutoBidModal}
                  type="button"
                  className="flex-1 py-3 sm:py-3.5 px-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-xs rounded-2xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-1"
                >
                  <Bot className="w-3.5 h-3.5 stroke-[2.2]" />
                  <span>자동 입찰</span>
                </button>

                {/* 즉시구매 버튼 */}
              {isBuyNowAvailable && (
                <button
                  onClick={() => setIsBuyNowModalOpen(true)}
                  type="button"
                  className="flex-1 py-3 sm:py-3.5 px-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-[0.98] text-white font-black text-xs rounded-2xl shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-1 animate-in fade-in zoom-in-95 duration-200"
                >
                  <Zap className="w-3.5 h-3.5 fill-current text-yellow-100" />
                  <span>즉시구매</span>
                </button>
              )}
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Bid Confirmation Modal: "입찰하시겠습니까?" (네 / 아니오) */}
      <BidConfirmModal
        isOpen={isConfirmModalOpen}
        item={item}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmQuickBid}
      />

      {/* Smart Auto-Bid Modal (Requirement: "자동입찰 눌러서 가격 설정할때 자동입찰에 대해 간략히 설명하고") */}
      {isAutoBidModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150"
          onClick={() => setIsAutoBidModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-2xl border border-gray-100 max-h-[85vh] sm:max-h-[88vh] overflow-y-auto animate-in zoom-in-95 duration-150 my-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-950">
                    스마트 자동 입찰 설정
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    최대 한도 내에서 시스템이 자동 호가 대리 입찰
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAutoBidModalOpen(false)}
                type="button"
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error if any */}
            {autoBidError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{autoBidError}</span>
              </div>
            )}

            {/* Explanation Callout (Requirement: "자동입찰에 대해 간략히 설명") */}
            <div className="mt-3.5 p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-2xl text-left space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-950">
                <Bot className="w-3.5 h-3.5 text-blue-600" />
                <span>자동 입찰(Proxy Bidding)이란?</span>
              </div>
              <p className="text-[11px] text-blue-900 leading-relaxed">
                지불 가능한 <strong>최대 한도 금액</strong>을 미리 설정해두면, 다른 경쟁 입찰자가 발생할 때마다 판매자의 최소 호가 단위(<strong>+{formatKRW(item.minIncrement)}</strong>)씩 시스템이 자동으로 올려 대리 입찰해 주는 스마트 기능입니다.
              </p>
              <div className="text-[10px] text-blue-700 space-y-0.5 pt-0.5">
                <p>• 설정한 최대 한도 금액을 초과하여 입찰되지 않습니다.</p>
                <p>• 다른 경쟁자가 없으면 최소 호가로 안전하게 낙찰받습니다.</p>
              </div>
            </div>

            {/* Current Price vs Increment */}
            <div className="mt-3.5 p-3.5 bg-gray-50 rounded-2xl space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-gray-600">
                <span>현재 최고 입찰가</span>
                <span className="font-bold text-gray-900 font-mono">
                  {formatKRW(item.currentPrice)}
                </span>
              </div>
              <div className="flex items-center justify-between text-gray-600">
                <span>판매자 최소 호가 단위</span>
                <span className="font-bold text-blue-600 font-mono">
                  +{formatKRW(item.minIncrement)}
                </span>
              </div>
              {item.buyNowPrice && (
                <div className="flex items-center justify-between text-amber-800 font-medium pt-1 border-t border-gray-200">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                    즉시 구매가
                  </span>
                  <span className="font-bold font-mono">
                    {formatKRW(item.buyNowPrice)}
                  </span>
                </div>
              )}
            </div>

            {/* Input Field for Auto-Bid Max Limit */}
            <div className="mt-3.5">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-gray-700 block">
                  내 자동 입찰 최대 한도 금액
                </label>
                <span className="text-[11px] text-gray-500">
                  최소 {formatKRW(nextMinBid)} 이상
                </span>
              </div>

              <div className="p-3.5 bg-white border-2 border-blue-600 rounded-2xl flex items-center justify-between shadow-xs">
                <span className="text-sm font-bold text-gray-400">₩</span>
                <input
                  type="number"
                  min={nextMinBid}
                  step={item.minIncrement}
                  value={autoBidLimit}
                  onChange={(e) => {
                    setAutoBidLimit(Number(e.target.value));
                    setAutoBidError(null);
                  }}
                  className="w-full text-right bg-transparent text-2xl font-black text-gray-950 focus:outline-none pr-1 font-mono"
                />
                <span className="text-sm font-bold text-gray-800">원</span>
              </div>
              <div className="text-right text-[11px] text-gray-400 font-medium pt-1 pr-4">
                {formatKoreanNumberWords(autoBidLimit)}
              </div>
            </div>

            {/* Quick Increment Buttons */}
            <div className="mt-2.5">
              <span className="text-[11px] text-gray-500 font-medium block mb-1">
                빠른 한도 증액:
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  item.minIncrement,
                  item.minIncrement * 2,
                  item.minIncrement * 5,
                  item.minIncrement * 10,
                ].map((inc) => (
                  <button
                    key={inc}
                    type="button"
                    onClick={() => {
                      setAutoBidLimit((prev) => Math.max(nextMinBid, prev + inc));
                      setAutoBidError(null);
                    }}
                    className="py-1.5 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-800 transition-all flex items-center justify-center gap-0.5"
                  >
                    <Plus className="w-3 h-3 text-gray-500" />
                    <span>
                      {inc >= 10000
                        ? `${inc / 10000}만`
                        : inc >= 1000
                        ? `${inc / 1000}천`
                        : `${inc.toLocaleString()}원`}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Warning if autoBidLimit >= buyNowPrice */}
            {isBuyNowAvailable && item.buyNowPrice && autoBidLimit >= item.buyNowPrice && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-center gap-2 text-amber-900 text-xs">
                <Zap className="w-4 h-4 text-amber-600 fill-amber-500 shrink-0" />
                <span className="leading-snug">
                  설정한 금액이 즉시 구매가({formatKRW(item.buyNowPrice)})와 같거나 높습니다. 설정 완료 시 <strong>즉시 입찰 확인 창</strong>이 표시됩니다.
                </span>
              </div>
            )}
            {isBuyNowClosed && item.buyNowPrice && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-900 text-xs">
                <Flame className="w-4 h-4 text-red-600 shrink-0" />
                <span className="leading-snug">
                  현재가가 즉시구매가의 80%를 초과하여 즉시구매는 마감되었습니다. 설정하신 한도 내에서 실시간 경매 자동 입찰로만 진행됩니다.
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAutoBidModalOpen(false)}
                className="py-3.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl text-xs transition-colors"
              >
                취소
              </button>

              <button
                type="button"
                onClick={handleSubmitAutoBid}
                className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-black text-sm rounded-2xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-1.5"
              >
                <Bot className="w-4 h-4" />
                <span>{formatKRW(autoBidLimit)} 자동 입찰 설정</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prompt Modal: "즉시 입찰 하시겠습니까?" (Requirement: "만약에 자동 입찰 금액이 즉시 구매 금액과 같거나 높다면 즉시 입찰 하시겠습니까? 문구가 뜨도록 설계") */}
      {isPromptInstantBidOpen && item.buyNowPrice && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 sm:p-6 shadow-2xl border border-gray-100 text-center animate-in zoom-in-95 duration-150">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/25 mb-3">
              <Zap className="w-7 h-7 fill-current" />
            </div>

            <h2 className="text-xl font-black text-gray-950 tracking-tight">
              즉시 입찰 하시겠습니까?
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              설정하신 자동 입찰 금액이 즉시 구매 금액 이상입니다.
            </p>

            <div className="mt-4 p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl text-left space-y-2">
              <div className="flex items-center justify-between text-xs text-amber-900">
                <span>내 자동 입찰 설정가</span>
                <span className="font-bold font-mono">
                  {formatKRW(autoBidLimit)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-amber-900">
                <span>판매자 즉시 구매가</span>
                <span className="font-black text-amber-600 font-mono">
                  {formatKRW(item.buyNowPrice)}
                </span>
              </div>
              <div className="pt-2 border-t border-amber-200/70 text-[11px] text-amber-800 leading-relaxed">
                경매 마감까지 대기하지 않고, 즉시 구매가(<strong>{formatKRW(item.buyNowPrice)}</strong>)로 즉시 낙찰받으시겠습니까?
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setIsPromptInstantBidOpen(false)}
                className="py-3 px-4 rounded-2xl bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-700 font-bold text-sm transition-all"
              >
                아니오
              </button>

              <button
                type="button"
                onClick={handleConfirmInstantBidFromAuto}
                className="py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-95 text-white font-black text-sm shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-1.5"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>네</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Bid Sheet / Modal */}
      {isBidSheetOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150"
          onClick={() => setIsBidSheetOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-2xl border border-gray-100 max-h-[85vh] sm:max-h-[88vh] overflow-y-auto animate-in zoom-in-95 duration-150 my-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                  <Gavel className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-gray-950">
                  실시간 경매 호가 입찰
                </h3>
              </div>

              <button
                onClick={() => setIsBidSheetOpen(false)}
                type="button"
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error Message */}
            {bidError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{bidError}</span>
              </div>
            )}

            {/* Current Price vs Next Min Bid */}
            <div className="mt-4 p-3.5 bg-gray-50 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>현재 최고 입찰가</span>
                <span className="font-bold text-gray-900 font-mono">
                  {formatKRW(item.currentPrice)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold text-gray-900">
                <span className="text-red-600">최소 입찰 가능 금액</span>
                <span className="text-red-600 font-mono">
                  {formatKRW(nextMinBid)}
                </span>
              </div>
            </div>

            {/* Bid Amount Input */}
            <div className="mt-4">
              <label className="text-xs font-bold text-gray-700 block mb-1">
                내 입찰 희망 금액
              </label>
              <div className="p-3.5 bg-white border-2 border-black rounded-2xl flex items-center justify-between shadow-xs">
                <span className="text-sm font-bold text-gray-400">₩</span>
                <input
                  type="number"
                  min={nextMinBid}
                  step={item.minIncrement}
                  value={bidAmount}
                  onChange={(e) => {
                    setBidAmount(Number(e.target.value));
                    setBidError(null);
                  }}
                  className="w-full text-right bg-transparent text-2xl font-black text-gray-950 focus:outline-none pr-1 font-mono"
                />
                <span className="text-sm font-bold text-gray-800">원</span>
              </div>
              <div className="text-right text-[11px] text-gray-400 font-medium pt-1 pr-4">
                {formatKoreanNumberWords(bidAmount)}
              </div>
            </div>

            {/* Quick Increment Buttons */}
            <div className="mt-3">
              <span className="text-[11px] text-gray-500 font-medium block mb-1.5">
                빠른 호가 추가:
              </span>
              <div className="grid grid-cols-4 gap-2">
                {[
                  item.minIncrement,
                  item.minIncrement * 2,
                  item.minIncrement * 5,
                  item.minIncrement * 10,
                ].map((inc) => (
                  <button
                    key={inc}
                    type="button"
                    onClick={() => handleQuickAdd(inc)}
                    className="py-2 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-800 transition-all flex items-center justify-center gap-0.5"
                  >
                    <Plus className="w-3 h-3 text-gray-500" />
                    <span>
                      {inc >= 10000
                        ? `${inc / 10000}만`
                        : inc >= 1000
                        ? `${inc / 1000}천`
                        : `${inc.toLocaleString()}원`}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Auction Policy Notice */}
            <div className="mt-4 p-3 bg-gray-50 rounded-xl text-[11px] text-gray-600 space-y-1">
              <div className="flex items-center gap-1 font-bold text-gray-900">
                <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                <span>실시간 경매 규정</span>
              </div>
              <p>• 입찰 후 즉시 현재 최고가로 반영되며, 이전 입찰자에게 알림이 전송됩니다.</p>
              <p className="text-red-600 font-semibold">• 마감 2분 이내 입찰 시 경매 시간이 2분 자동 연장됩니다.</p>
            </div>

            {/* Submit Bid Button */}
            <div className="mt-5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsBidSheetOpen(false)}
                className="py-3.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl text-xs transition-colors"
              >
                취소
              </button>

              <button
                type="button"
                onClick={handleExecuteBid}
                className="flex-1 py-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 active:scale-[0.99] text-white font-black text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Gavel className="w-4 h-4" />
                <span>{formatKRW(bidAmount)}으로 입찰 확정</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Buy It Now (즉시구매) Confirmation Sheet / Modal */}
      {isBuyNowModalOpen && isBuyNowAvailable && item.buyNowPrice && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150"
          onClick={() => setIsBuyNowModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-2xl border border-gray-100 max-h-[85vh] sm:max-h-[88vh] overflow-y-auto animate-in zoom-in-95 duration-150 my-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                  <Zap className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-950">
                    즉시구매 주문 확인
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    호가 경쟁 없이 판매자 희망가로 즉시 낙찰
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsBuyNowModalOpen(false)}
                type="button"
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Item Mini Card */}
            <div className="mt-4 p-3 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-200 shrink-0">
                <img
                  src={item.images[0]}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-gray-500 bg-white px-1.5 py-0.5 rounded border border-gray-200">
                  {item.category}
                </span>
                <p className="text-xs font-bold text-gray-950 truncate mt-0.5">
                  {item.title}
                </p>
                <p className="text-[11px] text-gray-500">
                  판매자: {item.seller.name}
                </p>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="mt-4 p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>현재 경매 최고가</span>
                <span className="font-mono">{formatKRW(item.currentPrice)}</span>
              </div>
              <div className="h-px bg-amber-200/60" />
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-950 block">
                    즉시구매 최종 결제금액
                  </span>
                  <span className="text-[10px] text-amber-700">
                    수수료 무료 · 안전 에스크로 적용
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-amber-950 font-mono block">
                    {formatKRW(item.buyNowPrice)}
                  </span>
                  <span className="text-[11px] text-amber-700 font-medium block">
                    {formatKoreanNumberWords(item.buyNowPrice)}
                  </span>
                </div>
              </div>
            </div>

            {/* Security Callout */}
            <div className="mt-3 p-3 bg-gray-50 rounded-xl text-[11px] text-gray-600 space-y-1">
              <div className="flex items-center gap-1 font-bold text-gray-800">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>안심 구매 안내</span>
              </div>
              <p>
                결제 승인 즉시 경매는 종료되며 회원님에게 최종 낙찰됩니다. 상품을 직접 수령하고 상태를 확인하기 전까지 결제 대금은 안전하게 보관됩니다.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mt-5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsBuyNowModalOpen(false)}
                className="py-3.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl text-xs transition-colors"
              >
                취소
              </button>

              <button
                type="button"
                onClick={handleExecuteBuyNow}
                className="flex-1 py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 active:scale-[0.99] text-white font-black text-sm rounded-2xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-current text-yellow-100" />
                <span>{formatKRW(item.buyNowPrice)} 즉시구매 확정</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
