import React from 'react';
import { Check } from 'lucide-react';
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

interface SocialLoginSectionProps {
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onShowToast?: (msg: string) => void;
}

export const SocialLoginSection: React.FC<SocialLoginSectionProps> = ({
  user,
  onUpdateUser,
  onShowToast,
}) => {
  const isLoggedIn = user.isLoggedIn !== false;
  const currentProvider: SocialLoginProvider = user.loginProvider || 'kakao';
  const linkedProviders: SocialLoginProvider[] = user.linkedProviders || ['kakao', 'naver', 'google'];

  const handleProviderSelect = (provider: SocialLoginProvider) => {
    const meta = SOCIAL_PROVIDERS[provider];
    const newLinked = Array.from(new Set([...linkedProviders, provider]));

    onUpdateUser({
      isLoggedIn: true,
      loginProvider: provider,
      linkedProviders: newLinked,
      name: meta.defaultName,
      avatar: meta.defaultAvatar,
      email: meta.defaultEmail,
    });

    playChimeSound('win');
    if (onShowToast) {
      onShowToast(`${meta.name} 계정으로 간편 로그인되었습니다 🎉`);
    }
  };

  const activeMeta = SOCIAL_PROVIDERS[currentProvider] || SOCIAL_PROVIDERS.kakao;

  return (
    <div className="mx-4 mt-3">
      {/* Container modeled after user's reference image */}
      <div className="bg-white rounded-[28px] p-5 sm:p-6 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
        {/* Title exactly matching screenshot */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-bold text-gray-950 tracking-tight">
            SNS 간편로그인
          </h3>

          {isLoggedIn ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {activeMeta.name} 연동 중
            </span>
          ) : (
            <span className="text-[11px] text-gray-400 font-medium">
              1초 터치 로그인
            </span>
          )}
        </div>

        {/* 5 Circular Social Login Buttons (Naver, Kakao, Facebook, Google, Apple) */}
        <div className="flex items-center justify-between gap-2 sm:gap-3 py-1">
          {ORDERED_PROVIDERS.map((pKey) => {
            const meta = SOCIAL_PROVIDERS[pKey];
            const isCurrent = isLoggedIn && currentProvider === pKey;

            return (
              <button
                key={pKey}
                type="button"
                onClick={() => handleProviderSelect(pKey)}
                title={`${meta.name} 간편로그인`}
                className="relative group flex flex-col items-center focus:outline-none"
              >
                {/* Round Icon Button */}
                <div
                  className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer shadow-xs active:scale-90 ${
                    meta.circleBg
                  } ${meta.circleBorder || ''} ${
                    isCurrent ? 'ring-3 ring-black/80 ring-offset-2 scale-105' : 'hover:scale-105'
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
                </div>

                {/* Active Check Indicator */}
                {isCurrent && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-black text-white flex items-center justify-center text-[10px] shadow-sm border border-white">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Status Bottom Bar */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1.5 min-w-0">
            {isLoggedIn ? (
              <>
                <span className="font-bold text-gray-900 truncate">
                  {user.email || activeMeta.defaultEmail}
                </span>
                <span className="text-[10px] text-gray-400">으로 로그인됨</span>
              </>
            ) : (
              <span className="text-gray-500">
                아이콘을 터치하면 별도 회원가입 없이 즉시 로그인됩니다.
              </span>
            )}
          </div>

          <span className="text-[11px] text-gray-400 font-medium shrink-0 ml-2">
            모바일 전용
          </span>
        </div>
      </div>
    </div>
  );
};
