import React from 'react';
import { Gavel, X, TrendingUp, AlertCircle, Sparkles } from 'lucide-react';
import { AuctionItem } from '../types/auction';
import { formatKRW, formatKoreanNumberWords } from '../utils/format';

interface BidConfirmModalProps {
  isOpen: boolean;
  item: AuctionItem | null;
  onClose: () => void;
  onConfirm: (item: AuctionItem) => void;
}

export const BidConfirmModal: React.FC<BidConfirmModalProps> = ({
  isOpen,
  item,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !item) return null;

  const nextBidPrice = item.currentPrice + item.minIncrement;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-sm rounded-3xl p-5 sm:p-6 shadow-2xl border border-gray-100 text-center animate-in zoom-in-95 duration-150"
      >
        {/* Top Icon Badge */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center shadow-md mb-3">
          <Gavel className="w-7 h-7 stroke-[2.2]" />
        </div>

        {/* Modal Main Prompt (User Requirement: "입찰하시겠습니까 문구뜨고 네 아니오") */}
        <h2 className="text-xl font-black text-gray-950 tracking-tight">
          입찰하시겠습니까?
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          최고가에서 판매자가 정한 호가만큼 증액하여 입찰합니다.
        </p>

        {/* Target Item Brief Info Card */}
        <div className="mt-4 p-3 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3 text-left">
          <img
            src={item.images[0]}
            alt={item.title}
            className="w-13 h-13 rounded-xl object-cover shrink-0 border border-gray-200"
          />
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold text-gray-500 bg-white px-1.5 py-0.5 rounded border border-gray-200 inline-block mb-0.5">
              {item.category}
            </span>
            <p className="text-xs font-bold text-gray-900 truncate">
              {item.title}
            </p>
            <p className="text-[11px] text-gray-500">
              판매자: {item.seller.name}
            </p>
          </div>
        </div>

        {/* Price Calculation Card */}
        <div className="mt-3.5 p-4 bg-gradient-to-br from-gray-50 to-gray-100/80 rounded-2xl border border-gray-200 text-left space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>현재 최고가</span>
            <span className="font-bold text-gray-900 font-mono">
              {formatKRW(item.currentPrice)}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-600">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
              <span>판매자 지정 호가</span>
            </span>
            <span className="font-extrabold text-blue-600 font-mono">
              +{formatKRW(item.minIncrement)}
            </span>
          </div>

          <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-black text-gray-900 block">
                최종 입찰 예정가
              </span>
              <span className="text-[10px] text-gray-500">
                (최고가 + 판매자 호가)
              </span>
            </div>
            <div className="text-right">
              <span className="text-lg sm:text-xl font-black text-red-600 font-mono block">
                {formatKRW(nextBidPrice)}
              </span>
              <span className="text-[11px] text-gray-400 font-medium block">
                {formatKoreanNumberWords(nextBidPrice)}
              </span>
            </div>
          </div>
        </div>

        {/* Sniping Protection Notice */}
        <div className="mt-3 px-2 text-[11px] text-gray-500 flex items-center justify-center gap-1 text-center">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>마감 2분 전 입찰 시 경매 시간이 2분 자동 연장됩니다.</span>
        </div>

        {/* Buttons: [아니오] & [네] */}
        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="py-3 px-4 rounded-2xl bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-700 font-bold text-sm transition-all"
          >
            아니오
          </button>

          <button
            type="button"
            onClick={() => onConfirm(item)}
            className="py-3 px-4 rounded-2xl bg-black hover:bg-gray-900 active:scale-95 text-white font-black text-sm shadow-lg shadow-black/15 transition-all flex items-center justify-center gap-1.5"
          >
            <Gavel className="w-4 h-4" />
            <span>네</span>
          </button>
        </div>
      </div>
    </div>
  );
};
