import React, { useState } from 'react';
import {
  X,
  Camera,
  Plus,
  Trash2,
  Check,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  Info,
  Clock,
  Coins,
  Zap,
  AlertTriangle,
  Hash,
  Tag,
} from 'lucide-react';
import {
  AuctionCategory,
  AuctionItem,
  ProductCondition,
} from '../types/auction';
import {
  formatKRW,
  formatKoreanNumberWords,
  playChimeSound,
} from '../utils/format';

interface PostAuctionProps {
  onClose: () => void;
  onSubmitNewAuction: (newItem: AuctionItem) => void;
  userName: string;
  userAvatar?: string;
}

const CATEGORIES: AuctionCategory[] = [
  '시계',
  '스니커즈',
  '미술작품',
  '쥬얼리',
  '패션',
  '가구',
  '주류',
  '기타',
];

const CONDITIONS: ProductCondition[] = [
  '새제품',
  '중고(최상)',
  '중고(보통)',
  '파손/수리 필요',
];

export const PostAuction: React.FC<PostAuctionProps> = ({
  onClose,
  onSubmitNewAuction,
  userName,
  userAvatar,
}) => {
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 State
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80',
  ]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<AuctionCategory>('시계');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [condition, setCondition] = useState<ProductCondition>('새제품');
  const [description, setDescription] = useState('');

  // Step 2 State
  const [startPrice, setStartPrice] = useState<number>(1000000);
  const [allowBuyNow, setAllowBuyNow] = useState<boolean>(true);
  const [buyNowPrice, setBuyNowPrice] = useState<number>(1500000);
  const [minIncrement, setMinIncrement] = useState<number>(50000);
  const [durationHours, setDurationHours] = useState<number>(24);
  const [autoRebidAllowed, setAutoRebidAllowed] = useState<boolean>(true);

  // Error message
  const [error, setError] = useState<string | null>(null);

  // Hashtag Management Handlers
  const handleAddTag = (tagToAdd?: string) => {
    const raw = (tagToAdd !== undefined ? tagToAdd : tagInput).trim();
    if (!raw) return;
    const cleanTag = raw.replace(/^#+/, '').trim();
    if (!cleanTag) return;
    if (tags.some((t) => t.toLowerCase() === cleanTag.toLowerCase())) {
      setError('이미 추가된 해시태그입니다.');
      return;
    }
    if (tags.length >= 8) {
      setError('해시태그는 최대 8개까지 등록 가능합니다.');
      return;
    }
    setTags((prev) => [...prev, cleanTag]);
    setTagInput('');
    setError(null);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  // Handle local image file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length >= 6) {
      setError('사진은 최대 6장까지 등록 가능합니다.');
      return;
    }

    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImages((prev) => [...prev, event.target!.result as string].slice(0, 6));
        setError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Next Step Validation
  const handleNextStep = () => {
    if (images.length === 0) {
      setError('상품 사진을 최소 1장 이상 등록해주세요.');
      return;
    }
    if (!title.trim()) {
      setError('상품명을 입력해주세요.');
      return;
    }
    if (title.trim().length < 2) {
      setError('상품명은 2자 이상 입력해주세요.');
      return;
    }
    setError(null);
    setStep(2);
  };

  // Handle direct text/number input for startPrice
  const handleStartPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawDigits = e.target.value.replace(/[^0-9]/g, '');
    const num = rawDigits === '' ? 0 : parseInt(rawDigits, 10);
    setStartPrice(num);
    if (allowBuyNow && buyNowPrice <= num) {
      setBuyNowPrice(Math.round(num * 1.5));
    }
    setError(null);
  };

  // Adjust starting price via +/- buttons
  const adjustPrice = (amount: number) => {
    setStartPrice((prev) => {
      const nextP = Math.max(0, prev + amount);
      if (allowBuyNow && buyNowPrice <= nextP) {
        setBuyNowPrice(Math.round(nextP * 1.5));
      }
      return nextP;
    });
    setError(null);
  };

  // Handle direct text/number input for buyNowPrice
  const handleBuyNowPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawDigits = e.target.value.replace(/[^0-9]/g, '');
    const num = rawDigits === '' ? 0 : parseInt(rawDigits, 10);
    setBuyNowPrice(num);
    setError(null);
  };

  // Adjust buy now price via +/- buttons
  const adjustBuyNowPrice = (amount: number) => {
    setBuyNowPrice((prev) => Math.max(0, prev + amount));
    setError(null);
  };

  // Final Submit
  const handleSubmit = () => {
    if (startPrice <= 0) {
      setError('시작가는 0원보다 커야 합니다.');
      return;
    }

    if (allowBuyNow && buyNowPrice <= startPrice) {
      setError('즉시구매가는 경매 시작가보다 높아야 합니다.');
      return;
    }

    const now = Date.now();
    const newItem: AuctionItem = {
      id: `auc-new-${now}`,
      title: title.trim(),
      category,
      images,
      startPrice,
      currentPrice: startPrice,
      buyNowPrice: allowBuyNow ? buyNowPrice : null,
      minIncrement,
      endTime: now + durationHours * 3600 * 1000,
      seller: {
        name: userName || '김지훈',
        avatar:
          userAvatar ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        rating: 5.0,
        verified: true,
        salesCount: 1,
      },
      condition,
      description: description.trim() || '판매자가 등록한 정품 보증 경매 상품입니다.',
      tags: tags.length > 0 ? tags : undefined,
      isHot: true,
      isLiked: false,
      bidCount: 0,
      views: 1,
      autoRebidAllowed,
      bids: [],
      status: 'active',
      createdAt: now,
    };

    playChimeSound('win');
    onSubmitNewAuction(newItem);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-28">
      {/* Top Bar: Close (X) button + Centered Title */}
      <header className="px-4 py-3 bg-white sticky top-0 z-30 border-b border-gray-100 flex items-center justify-between">
        <button
          onClick={onClose}
          type="button"
          aria-label="닫기"
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 active:scale-95 text-gray-700 transition-colors"
        >
          <X className="w-5 h-5 stroke-[2.2]" />
        </button>

        <h1 className="text-base sm:text-lg font-black text-gray-950 tracking-tight">
          경매 등록
        </h1>

        <div className="w-9" />
      </header>

      {/* Stepper Progress Bar */}
      <div className="bg-white px-4 py-3 border-b border-gray-100 shadow-xs">
        <div className="flex items-center justify-between text-xs font-bold text-gray-500 mb-2">
          <span className={step === 1 ? 'text-black' : 'text-gray-400'}>
            ① 상품 정보 (사진과 제목을 입력하세요)
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
          <span className={step === 2 ? 'text-black' : 'text-gray-400'}>
            ② 가격 설정
          </span>
        </div>

        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-black transition-all duration-300"
            style={{ width: step === 1 ? '50%' : '100%' }}
          />
        </div>
      </div>

      {/* Error alert if any */}
      {error && (
        <div className="mx-4 mt-3 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2 animate-in fade-in">
          <Info className="w-4 h-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: 상품 정보 입력 */}
      {step === 1 && (
        <div className="px-4 mt-4 space-y-5 animate-in fade-in duration-200">
          {/* Photos Upload Box */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900">상품 사진</h3>
                <p className="text-[11px] text-gray-500">최대 6장까지 등록 가능</p>
              </div>
              <span className="text-xs font-semibold text-gray-500">
                <span className="text-black font-bold">{images.length}</span> / 6
              </span>
            </div>

            {/* Horizontal Square Photos Grid / Slots */}
            <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
              {/* Add Photo Button with Hidden File Input */}
              {images.length < 6 && (
                <label className="w-20 h-20 shrink-0 rounded-xl border-2 border-dashed border-gray-300 hover:border-black flex flex-col items-center justify-center cursor-pointer transition-colors bg-gray-50 hover:bg-gray-100">
                  <Camera className="w-5 h-5 text-gray-500" />
                  <span className="text-[10px] text-gray-500 font-semibold mt-1">
                    추가
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              )}

              {/* Rendered Uploaded Photos */}
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden border border-gray-200 group bg-gray-100"
                >
                  <img
                    src={img}
                    alt={`상품 사진 ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {/* Primary Badge */}
                  {idx === 0 && (
                    <span className="absolute bottom-1 left-1 bg-black text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      주 사진
                    </span>
                  )}
                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/70 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Title Input */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
            <label className="text-xs font-bold text-gray-700 block mb-1.5">
              상품명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: Hermès Birkin 30 Epsom Gold"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm placeholder:text-gray-300 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Category Dropdown */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
            <label className="text-xs font-bold text-gray-700 block mb-1.5">
              카테고리 선택 <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as AuctionCategory)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat} {cat === '주류' ? '/ 프리미엄 주류' : cat === '기타' ? '/ 디지털 & 테크 컬렉터블' : '/ 럭셔리 컬렉터블'}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Hashtags Input */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-blue-600" />
                <span>해시태그 등록 (검색 키워드)</span>
              </label>
              <span className="text-[11px] text-gray-400 font-medium">
                {tags.length}/8개
              </span>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
                  #
                </span>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="해시태그 입력"
                  className="w-full pl-7 pr-3 py-2 rounded-xl border border-gray-200 text-sm placeholder:text-gray-300 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <button
                type="button"
                onClick={() => handleAddTag()}
                className="px-3.5 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors shrink-0 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>추가</span>
              </button>
            </div>

            {/* Selected Tag Badges */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200/80 px-2.5 py-1 rounded-full text-xs font-semibold"
                  >
                    <span>#{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-500 p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Condition: 4 Selection Chips */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
            <label className="text-xs font-bold text-gray-700 block mb-2">
              상품 상태 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CONDITIONS.map((cond) => {
                const isSelected = condition === cond;
                return (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => setCondition(cond)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-black text-white border-black shadow-xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <span>{cond}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Description */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
            <label className="text-xs font-bold text-gray-700 block mb-1.5">
              상세 설명
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="제품 스펙, 실측 사이즈, 구매처, 부속품 구성(박스, 보증서) 등을 자세히 작성해주세요."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm placeholder:text-gray-300 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-black resize-none"
            />
          </div>

          {/* Next Button */}
          <button
            onClick={handleNextStep}
            type="button"
            className="w-full py-3.5 bg-black hover:bg-gray-900 active:scale-[0.99] text-white font-bold rounded-2xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            <span>다음: 가격 및 경매 옵션 설정</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 2: 가격 및 경매 옵션 */}
      {step === 2 && (
        <div className="px-4 mt-4 space-y-5 animate-in fade-in duration-200">
          {/* Starting Price Field with +/- buttons */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="w-4 h-4 text-amber-500" />
              <label className="text-xs font-bold text-gray-700">
                경매 시작가 (최저가)
              </label>
            </div>
            <p className="text-[11px] text-gray-500 mb-3">
              경매는 이 시작가에서 출발하여 입찰자들이 호가를 올려나갑니다.
            </p>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-black focus-within:bg-white transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 font-semibold font-mono">₩</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={startPrice === 0 ? '' : startPrice.toLocaleString('ko-KR')}
                  onChange={handleStartPriceChange}
                  placeholder="0"
                  className="w-full text-right bg-transparent text-xl font-black text-gray-950 focus:outline-none pr-1 font-mono tracking-tight"
                />
                <span className="text-xs text-gray-600 font-semibold">원</span>
              </div>
              <div className="text-right text-[11px] text-gray-400 font-medium pt-1 pr-4">
                {formatKoreanNumberWords(startPrice)}
              </div>
            </div>

            <div className="flex items-center gap-1.5 mt-3 flex-wrap">
              <button
                type="button"
                onClick={() => adjustPrice(-100000)}
                className="flex-1 py-1.5 px-1 text-xs font-bold bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-700"
              >
                -10만
              </button>
              <button
                type="button"
                onClick={() => adjustPrice(-10000)}
                className="flex-1 py-1.5 px-1 text-xs font-bold bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-700"
              >
                -1만
              </button>
              <button
                type="button"
                onClick={() => adjustPrice(-1000)}
                className="flex-1 py-1.5 px-1 text-xs font-bold bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-700"
              >
                -1천
              </button>
              <button
                type="button"
                onClick={() => adjustPrice(1000)}
                className="flex-1 py-1.5 px-1 text-xs font-bold bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-700"
              >
                +1천
              </button>
              <button
                type="button"
                onClick={() => adjustPrice(10000)}
                className="flex-1 py-1.5 px-1 text-xs font-bold bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-700"
              >
                +1만
              </button>
              <button
                type="button"
                onClick={() => adjustPrice(100000)}
                className="flex-1 py-1.5 px-1 text-xs font-bold bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-700"
              >
                +10만
              </button>
            </div>

            {/* Warning Callout Box for Starting Price */}
            <div className="mt-3.5 p-3 bg-red-50/90 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-900">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <span className="font-bold text-red-700 block mb-0.5">시작가 설정 주의사항</span>
                <span>시작가를 지나치게 낮게 설정하여 발생하는 낙찰 손해는 전적으로 판매자 본인에게 책임이 있습니다.</span>
              </div>
            </div>
          </div>

          {/* Buy It Now Option Setting */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Zap className="w-4 h-4 fill-amber-500 text-amber-500" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-900 block">
                    즉시구매가 (Buy It Now) 설정
                  </label>
                  <span className="text-[11px] text-gray-500">
                    구매자가 즉시 낙찰받을 수 있는 희망가입니다.
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAllowBuyNow(!allowBuyNow)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  allowBuyNow ? 'bg-amber-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    allowBuyNow ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {allowBuyNow && (
              <div className="mt-3.5 pt-3 border-t border-gray-100 space-y-2.5 animate-in fade-in">
                {/* Direct Input Field for Buy-It-Now */}
                <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/80 focus-within:border-amber-500 focus-within:bg-white transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-amber-700 font-semibold font-mono">₩</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={buyNowPrice === 0 ? '' : buyNowPrice.toLocaleString('ko-KR')}
                      onChange={handleBuyNowPriceChange}
                      placeholder="0"
                      className="w-full text-right bg-transparent text-xl font-black text-amber-950 focus:outline-none pr-1 font-mono tracking-tight"
                    />
                    <span className="text-xs text-amber-800 font-semibold">원</span>
                  </div>
                  <div className="text-right text-[11px] text-amber-700/60 font-medium pt-1 pr-4">
                    {formatKoreanNumberWords(buyNowPrice)}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-gray-500 font-medium">추천 배수:</span>
                  {[
                    { label: '시작가 +20%', val: Math.round(startPrice * 1.2) },
                    { label: '시작가 +50%', val: Math.round(startPrice * 1.5) },
                    { label: '시작가 2배', val: Math.round(startPrice * 2) },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setBuyNowPrice(preset.val)}
                      className="text-[10px] font-bold px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Quick +/- adjustment buttons for Buy Now */}
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  <button
                    type="button"
                    onClick={() => adjustBuyNowPrice(-100000)}
                    className="flex-1 py-1.5 px-1 text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/70 rounded-lg transition-colors"
                  >
                    -10만
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustBuyNowPrice(-10000)}
                    className="flex-1 py-1.5 px-1 text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/70 rounded-lg transition-colors"
                  >
                    -1만
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustBuyNowPrice(10000)}
                    className="flex-1 py-1.5 px-1 text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/70 rounded-lg transition-colors"
                  >
                    +1만
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustBuyNowPrice(100000)}
                    className="flex-1 py-1.5 px-1 text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/70 rounded-lg transition-colors"
                  >
                    +10만
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bid Increment Unit */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-gray-700 block">
                최소 호가 단위
              </label>
              <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md font-mono">
                현재 단위: +{minIncrement >= 10000 ? `${minIncrement / 10000}만원` : `${minIncrement / 1000}천원`}
              </span>
            </div>
            <p className="text-[11px] text-gray-500 mb-3">
              입찰자가 한 번에 올릴 수 있는 최소 호가 금액을 선택해주세요.
            </p>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[
                { unit: 1000, label: '+1천원' },
                { unit: 5000, label: '+5천원' },
                { unit: 10000, label: '+1만원' },
                { unit: 50000, label: '+5만원' },
                { unit: 100000, label: '+10만원' },
                { unit: 500000, label: '+50만원' },
              ].map(({ unit, label }) => (
                <button
                  key={unit}
                  type="button"
                  onClick={() => setMinIncrement(unit)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    minIncrement === unit
                      ? 'bg-black text-white border-black shadow-xs'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Auction Duration / End Time */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
            <div className="flex items-center gap-1.5 mb-1">
              <Clock className="w-4 h-4 text-blue-500" />
              <label className="text-xs font-bold text-gray-700">
                경매 마감 시간 설정
              </label>
            </div>
            <p className="text-[11px] text-gray-500 mb-3">
              설정된 마감 시간 기준 최고가를 제시한 사람이 최종 낙찰자가 됩니다.
            </p>

            <div className="grid grid-cols-4 gap-2">
              {[
                { label: '1시간 (초단기)', hours: 1 },
                { label: '6시간 (당일)', hours: 6 },
                { label: '24시간 (1일)', hours: 24 },
                { label: '3일 (추천)', hours: 72 },
              ].map((opt) => (
                <button
                  key={opt.hours}
                  type="button"
                  onClick={() => setDurationHours(opt.hours)}
                  className={`p-2 rounded-xl text-xs font-bold border transition-all text-center flex flex-col items-center justify-center ${
                    durationHours === opt.hours
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <span className="text-xs">{opt.hours}시간</span>
                  <span className="text-[9px] opacity-75 font-normal">
                    {opt.hours >= 24 ? `${opt.hours / 24}일` : '단기'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Auction Options: Auto-Rebid Toggle */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-gray-900">
                  자동 대리 재입찰 허용
                </h4>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  입찰자가 희망 최고가를 설정하면 호가 단위로 자동 입찰됩니다.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setAutoRebidAllowed(!autoRebidAllowed)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  autoRebidAllowed ? 'bg-black' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    autoRebidAllowed ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded-xl text-[11px] text-gray-600 space-y-1">
              <p className="font-semibold text-gray-800">💡 실시간 경매 연장 룰 적용 안내</p>
              <p>마감 2분 전 신규 입찰이 접수되면 스나이핑 방지를 위해 경매 마감 시간이 2분 자동 연장됩니다.</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStep(1)}
              type="button"
              className="py-3.5 px-4 bg-white border border-gray-300 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>이전</span>
            </button>

            <button
              onClick={handleSubmit}
              type="button"
              className="flex-1 py-3.5 bg-black hover:bg-gray-900 active:scale-[0.99] text-white font-bold rounded-2xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>경매 등록 완료</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
