import React, { useState, useRef } from 'react';
import {
  Settings,
  BadgeCheck,
  Edit3,
  ChevronRight,
  Heart,
  Clock,
  ShieldCheck,
  CreditCard,
  HelpCircle,
  LogOut,
  X,
  Check,
  Camera,
  Upload,
  AlertCircle,
  LogIn,
  Key,
} from 'lucide-react';
import { AuctionItem, UserProfile } from '../types/auction';
import { formatKRW, getTimeRemaining } from '../utils/format';
import { SocialLoginSection } from './SocialLoginSection';
import { SocialLoginModal } from './SocialLoginModal';
import {
  NaverIcon,
  KakaoIcon,
  FacebookIcon,
  GoogleIcon,
  AppleIcon,
  SOCIAL_PROVIDERS,
} from './SocialAuthHelper';

interface MyPageProps {
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  recentBids: AuctionItem[];
  onSelectItem: (item: AuctionItem) => void;
  onToggleLike: (itemId: string, e: React.MouseEvent) => void;
  nowMs: number;
  onNavigateToTab: (tab: 'active_bids' | 'wishlist') => void;
  onShowToast?: (msg: string) => void;
}

const AVATAR_PRESETS = [
  {
    id: 'preset-1',
    label: '클래식 컬렉터',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'preset-2',
    label: '미니멀리스트',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'preset-3',
    label: '크리에이터',
    url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'preset-4',
    label: '워치 컬렉터',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'preset-5',
    label: '아트 디렉터',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'preset-6',
    label: '빈티지 큐레이터',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80',
  },
];

export const MyPage: React.FC<MyPageProps> = ({
  user,
  onUpdateUser,
  recentBids,
  onSelectItem,
  onToggleLike,
  nowMs,
  onNavigateToTab,
  onShowToast,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedName, setEditedName] = useState(user.name);
  const [editedAvatar, setEditedAvatar] = useState(user.avatar);
  const [avatarUploadError, setAvatarUploadError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isSocialLoginModalOpen, setIsSocialLoginModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenEditModal = () => {
    setEditedName(user.name);
    setEditedAvatar(user.avatar);
    setAvatarUploadError(null);
    setIsEditModalOpen(true);
  };

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAvatarUploadError('이미지 파일(PNG, JPG, WEBP 등)만 등록 가능합니다.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarUploadError('5MB 이하의 이미지만 등록 가능합니다.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setEditedAvatar(event.target.result);
        setAvatarUploadError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = () => {
    const trimmed = editedName.trim();
    if (!trimmed) return;
    onUpdateUser({
      name: trimmed,
      avatar: editedAvatar || user.avatar,
    });
    setIsEditModalOpen(false);
  };

  return (
    <div className="pb-28 pt-2">
      {/* Top Header */}
      <header className="px-4 py-3 bg-white sticky top-0 z-30 border-b border-gray-100 flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight">
          마이페이지
        </h1>

        <button
          onClick={() => setIsSettingsOpen(true)}
          type="button"
          aria-label="설정"
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 active:scale-95 text-gray-700 transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>
      </header>

      {/* Profile Card */}
      <div className="px-4 mt-3">
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-4">
            {/* Round Avatar with camera edit badge */}
            <button
              type="button"
              onClick={user.isLoggedIn !== false ? handleOpenEditModal : () => setIsSocialLoginModalOpen(true)}
              title={user.isLoggedIn !== false ? "프로필 사진 변경" : "로그인"}
              className="relative group shrink-0 rounded-full focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-transform active:scale-95"
            >
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md bg-gray-100">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>
              {user.isLoggedIn !== false && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-black text-white flex items-center justify-center shadow-md border-2 border-white group-hover:bg-gray-800 transition-colors">
                  <Camera className="w-3 h-3" />
                </div>
              )}
            </button>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-lg font-black text-gray-950 truncate">
                  {user.isLoggedIn !== false ? user.name : '게스트 사용자'}
                </h2>
                {user.verified && user.isLoggedIn !== false && (
                  <BadgeCheck className="w-5 h-5 text-blue-500 fill-blue-50 shrink-0" />
                )}
                {user.isLoggedIn !== false && user.loginProvider === 'naver' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#72BA6F] text-white text-[10px] font-black shrink-0 shadow-xs">
                    <NaverIcon className="w-2.5 h-2.5 text-white" />
                    <span>네이버</span>
                  </span>
                )}
                {user.isLoggedIn !== false && user.loginProvider === 'kakao' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F9E054] text-[#3B221F] text-[10px] font-black shrink-0 shadow-xs">
                    <KakaoIcon className="w-3 h-3 text-[#3B221F]" />
                    <span>카카오</span>
                  </span>
                )}
                {user.isLoggedIn !== false && user.loginProvider === 'facebook' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#536BA9] text-white text-[10px] font-black shrink-0 shadow-xs">
                    <FacebookIcon className="w-2.5 h-2.5 text-white" />
                    <span>페이스북</span>
                  </span>
                )}
                {user.isLoggedIn !== false && user.loginProvider === 'google' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-[#5482EA] text-gray-800 text-[10px] font-bold shrink-0 shadow-xs">
                    <GoogleIcon className="w-3 h-3" />
                    <span>Google</span>
                  </span>
                )}
                {user.isLoggedIn !== false && user.loginProvider === 'apple' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black text-white text-[10px] font-bold shrink-0 shadow-xs">
                    <AppleIcon className="w-2.5 h-2.5 text-white" />
                    <span>Apple</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 truncate mt-0.5">
                {user.isLoggedIn !== false ? (user.email || 'SNS 간편로그인 계정') : 'SNS 간편로그인이 필요합니다'}
              </p>
            </div>

            {/* Profile Action Button */}
            {user.isLoggedIn !== false ? (
              <button
                onClick={handleOpenEditModal}
                type="button"
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1 shrink-0 active:scale-95"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>프로필 수정</span>
              </button>
            ) : (
              <button
                onClick={() => setIsSocialLoginModalOpen(true)}
                type="button"
                className="px-3.5 py-1.5 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1 shrink-0 active:scale-95 shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>로그인</span>
              </button>
            )}
          </div>

          {/* 3-Column Activity Summary Board */}
          <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-3 divide-x divide-gray-100 text-center">
            <div
              onClick={() => onNavigateToTab('active_bids')}
              className="cursor-pointer group hover:bg-gray-50/50 py-1 rounded-xl transition-colors"
            >
              <span className="text-xs text-gray-600 block">낙찰</span>
              <span className="text-lg font-black text-gray-950 mt-0.5 block group-hover:text-emerald-600 transition-colors">
                {user.wonCount}
              </span>
            </div>

            <div className="cursor-pointer group hover:bg-gray-50/50 py-1 rounded-xl transition-colors">
              <span className="text-xs text-gray-600 block">판매</span>
              <span className="text-lg font-black text-gray-950 mt-0.5 block group-hover:text-black transition-colors">
                {user.sellingCount}
              </span>
            </div>

            <div
              onClick={() => onNavigateToTab('wishlist')}
              className="cursor-pointer group hover:bg-gray-50/50 py-1 rounded-xl transition-colors"
            >
              <span className="text-xs text-gray-600 block">관심</span>
              <span className="text-lg font-black text-gray-950 mt-0.5 block group-hover:text-red-500 transition-colors">
                {user.wishlistCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Verification & Trust Badge Callout */}
      <div className="mx-4 mt-4 p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-blue-950">
              공인 에스크로 안전결제 인증
            </p>
            <p className="text-[11px] text-blue-800">
              낙찰 확정 후 수령 전까지 결제 대금이 안전하게 보호됩니다.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Bids Section: Header & Product Cards */}
      <div className="mt-6 px-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-black text-gray-950 tracking-tight">
            최근 입찰 내역
          </h3>

          <button
            onClick={() => onNavigateToTab('active_bids')}
            type="button"
            className="text-xs font-bold text-gray-600 hover:text-black flex items-center gap-0.5"
          >
            <span>전체보기</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentBids.length === 0 ? (
          <div className="py-8 text-center bg-white rounded-2xl border border-dashed border-gray-200">
            <p className="text-xs text-gray-500">최근 입찰한 내역이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentBids.slice(0, 3).map((item) => {
              const timeInfo = getTimeRemaining(item.endTime, nowMs);

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectItem(item)}
                  className="p-3 bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center gap-3 select-none"
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{timeInfo.text}</span>
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {item.category}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-gray-900 truncate">
                      {item.title}
                    </p>

                    <div className="mt-1 flex items-baseline justify-between">
                      <span className="text-sm font-black text-gray-950">
                        {formatKRW(item.currentPrice)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => onToggleLike(item.id, e)}
                    className="p-1.5 text-gray-400 hover:text-red-500"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        item.isLiked ? 'fill-red-500 text-red-500' : ''
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SNS 간편로그인 (화면 맨 아래 배치) */}
      <div className="mt-5 mb-2">
        <SocialLoginSection
          user={user}
          onUpdateUser={onUpdateUser}
          onShowToast={onShowToast}
        />
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
              <h3 className="text-base font-black text-gray-950">프로필 수정</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Profile Photo Edit Section */}
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-100 shadow-md bg-gray-100 cursor-pointer relative"
                  >
                    <img
                      src={editedAvatar}
                      alt="프로필 미리보기"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity">
                      <Camera className="w-6 h-6 mb-0.5" />
                      <span className="text-[10px] font-bold">사진 변경</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="사진 업로드"
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-black text-white flex items-center justify-center shadow-lg border-2 border-white hover:bg-gray-800 transition-colors cursor-pointer active:scale-95"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileUpload}
                  className="hidden"
                />

                <div className="mt-2.5 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>내 기기에서 사진 선택</span>
                  </button>
                </div>

                {avatarUploadError && (
                  <div className="mt-2 text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{avatarUploadError}</span>
                  </div>
                )}
              </div>

              {/* Avatar Presets */}
              <div className="pt-1">
                <label className="text-xs font-bold text-gray-700 block mb-2">
                  추천 프로필 아바타 선택
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {AVATAR_PRESETS.map((preset) => {
                    const isSelected = editedAvatar === preset.url;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setEditedAvatar(preset.url);
                          setAvatarUploadError(null);
                        }}
                        title={preset.label}
                        className={`relative aspect-square rounded-full overflow-hidden border-2 transition-all p-0.5 ${
                          isSelected
                            ? 'border-black ring-2 ring-black scale-105'
                            : 'border-transparent opacity-70 hover:opacity-100 hover:scale-105'
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.label}
                          className="w-full h-full object-cover rounded-full"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Nickname Input */}
              <div className="pt-1">
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  닉네임
                </label>
                <input
                  type="text"
                  value={editedName}
                  maxLength={15}
                  onChange={(e) => setEditedName(e.target.value)}
                  placeholder="닉네임을 입력하세요"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="p-3 bg-gray-50 rounded-xl text-[11px] text-gray-500 leading-relaxed">
                💡 변경된 프로필 사진과 닉네임은 실시간 입찰 및 경매 물품 등록 시 즉시 반영됩니다.
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="flex-1 py-2.5 bg-black hover:bg-gray-900 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1 shadow-md active:scale-98"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>저장 완료</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Sheet */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-950">설정</h3>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Social Login Management Setting */}
              <div
                onClick={() => {
                  setIsSettingsOpen(false);
                  setIsSocialLoginModalOpen(true);
                }}
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-xs font-bold text-gray-800 cursor-pointer transition-colors active:scale-[0.99]"
              >
                <span className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-500" />
                  SNS 간편 로그인 관리 (카카오 · 네이버 · Google)
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 text-xs font-bold text-gray-800">
                <span className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-gray-500" />
                  결제 및 환불 계좌 관리
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 text-xs font-bold text-gray-800">
                <span className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-gray-500" />
                  경매 이용 규칙 및 가이드
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>

              {user.isLoggedIn !== false ? (
                <div
                  onClick={() => setIsLogoutConfirmOpen(true)}
                  className="flex items-center justify-between p-3 rounded-xl bg-red-50/70 hover:bg-red-50 text-xs font-bold text-red-600 cursor-pointer transition-colors active:scale-[0.99]"
                >
                  <span className="flex items-center gap-2">
                    <LogOut className="w-4 h-4 text-red-500" />
                    로그아웃
                  </span>
                  <ChevronRight className="w-4 h-4 text-red-400" />
                </div>
              ) : (
                <div
                  onClick={() => {
                    setIsSettingsOpen(false);
                    setIsSocialLoginModalOpen(true);
                  }}
                  className="flex items-center justify-between p-3 rounded-xl bg-black text-white text-xs font-bold cursor-pointer transition-colors active:scale-[0.99]"
                >
                  <span className="flex items-center gap-2">
                    <LogIn className="w-4 h-4 text-amber-300" />
                    SNS 간편 로그인하기
                  </span>
                  <ChevronRight className="w-4 h-4 text-white/60" />
                </div>
              )}
            </div>

            <button
              onClick={() => setIsSettingsOpen(false)}
              className="w-full mt-4 py-3 bg-black text-white text-xs font-bold rounded-xl"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* Logout Confirmation Dialog */}
      {isLogoutConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xs rounded-3xl p-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-black text-gray-950 mb-1.5">
              로그아웃 하시겠습니까?
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">
              로그아웃 시 카카오톡, 네이버, Google 간편 로그인 화면으로 전환되며 언제든 1초 만에 다시 로그인할 수 있습니다.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsLogoutConfirmOpen(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLogoutConfirmOpen(false);
                  setIsSettingsOpen(false);
                  onUpdateUser({ isLoggedIn: false, loginProvider: null });
                  if (onShowToast) onShowToast('안전하게 로그아웃되었습니다.');
                }}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm cursor-pointer"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Standalone Social Login Modal (Accessible from header/settings) */}
      <SocialLoginModal
        isOpen={isSocialLoginModalOpen}
        onClose={() => setIsSocialLoginModalOpen(false)}
        onLogin={(provider) => {
          const meta = SOCIAL_PROVIDERS[provider];
          const currentLinked = user.linkedProviders || ['kakao', 'google'];
          const newLinked = Array.from(new Set([...currentLinked, provider]));

          onUpdateUser({
            isLoggedIn: true,
            loginProvider: provider,
            linkedProviders: newLinked,
            name: meta.defaultName,
            avatar: meta.defaultAvatar,
            email: meta.defaultEmail,
          });

          if (onShowToast) {
            onShowToast(`${meta.name} 계정으로 간편 로그인되었습니다 🎉`);
          }
        }}
        currentUser={user}
      />
    </div>
  );
};
