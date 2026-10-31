import React, { useState } from 'react';
import { X, ShieldCheck, Check } from 'lucide-react';
import { SocialLoginProvider, UserProfile } from '../types/auction';
import {
  NaverIcon,
  KakaoIcon,
  FacebookIcon,
  GoogleIcon,
  AppleIcon,
  SOCIAL_PROVIDERS,
  ORDERED_PROVIDERS,
} from './SocialAuthHelper';
import { playChimeSound } from '../utils/format';

interface SocialLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (provider: SocialLoginProvider) => void;
  currentUser?: UserProfile;
}

export const SocialLoginModal: React.FC<SocialLoginModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  currentUser,
}) => {
  const [selectedProvider, setSelectedProvider] = useState<SocialLoginProvider | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleProviderClick = (provider: SocialLoginProvider) => {
    setSelectedProvider(provider);
    setIsProcessing(true);
    playChimeSound('pop');

    setTimeout(() => {
      setIsProcessing(false);
      onLogin(provider);
      onClose();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h3 className="text-base sm:text-lg font-black text-gray-950">
              SNS 간편로그인
            </h3>
            <p className="text-[11px] text-gray-500">
              원하는 소셜 계정을 탭하여 1초 만에 로그인하세요.
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 5 Circular Buttons matching the reference image */}
        <div className="py-6 flex items-center justify-between gap-2 sm:gap-3 px-2">
          {ORDERED_PROVIDERS.map((pKey) => {
            const meta = SOCIAL_PROVIDERS[pKey];
            const isSelected = selectedProvider === pKey;
            const isCurrent = currentUser?.isLoggedIn !== false && currentUser?.loginProvider === pKey;

            return (
              <button
                key={pKey}
                type="button"
                disabled={isProcessing}
                onClick={() => handleProviderClick(pKey)}
                title={meta.name}
                className="group flex flex-col items-center gap-1.5 focus:outline-none"
              >
                <div
                  className={`relative w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-xs transition-all active:scale-90 cursor-pointer ${
                    meta.circleBg
                  } ${meta.circleBorder || ''} ${
                    isSelected ? 'ring-4 ring-black/80 scale-105' : 'hover:scale-105'
                  }`}
                >
                  {pKey === 'naver' && (
                    <NaverIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  )}
                  {pKey === 'kakao' && (
                    <KakaoIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#3B221F]" />
                  )}
                  {pKey === 'facebook' && (
                    <FacebookIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  )}
                  {pKey === 'google' && (
                    <GoogleIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                  )}
                  {pKey === 'apple' && (
                    <AppleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  )}

                  {isCurrent && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-black text-white flex items-center justify-center text-[10px] shadow-sm border border-white">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </div>

                <span className="text-[11px] font-bold text-gray-700">
                  {meta.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Security & Mobile Notice */}
        <div className="p-3 bg-gray-50 border border-gray-100 rounded-2xl flex items-center gap-2 text-gray-600">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <p className="text-[11px] leading-relaxed">
            모바일 환경에서 안전한 1초 원클릭 생체 인증 및 SSO가 지원됩니다.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full py-2.5 text-xs text-gray-500 hover:text-gray-900 font-bold text-center"
        >
          닫기
        </button>
      </div>
    </div>
  );
};
