import React from 'react';
import { SocialLoginProvider } from '../types/auction';

export function NaverIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M16.273 12.845 7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727z" />
    </svg>
  );
}

export function KakaoIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3C6.477 3 2 6.477 2 10.767c0 2.76 1.87 5.18 4.69 6.54l-1.19 4.37a.5.5 0 0 0 .74.55l5.22-3.46c.18.01.36.02.54.02 5.523 0 10-3.477 10-7.767C22 6.477 17.523 3 12 3z" />
    </svg>
  );
}

export function FacebookIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

export function GoogleIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

export function AppleIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.85-.92.04-2.02.62-2.66 1.37-.56.65-.99 1.72-.86 2.74 1.03.08 2.06-.52 2.6-1.26z" />
    </svg>
  );
}

export interface ProviderMeta {
  id: SocialLoginProvider;
  name: string;
  tagline: string;
  circleBg: string; // Tailored directly to reference image
  circleBorder?: string;
  iconColor: string;
  defaultEmail: string;
  defaultName: string;
  defaultAvatar: string;
}

export const ORDERED_PROVIDERS: SocialLoginProvider[] = [
  'naver',
  'kakao',
  'facebook',
  'google',
  'apple',
];

export const SOCIAL_PROVIDERS: Record<SocialLoginProvider, ProviderMeta> = {
  naver: {
    id: 'naver',
    name: '네이버',
    tagline: '네이버 아이디로 로그인',
    circleBg: 'bg-[#72BA6F] hover:bg-[#64aa61]',
    iconColor: 'text-white',
    defaultEmail: 'jh_auction@naver.com',
    defaultName: '김지훈',
    defaultAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  },
  kakao: {
    id: 'kakao',
    name: '카카오톡',
    tagline: '카카오 1초 간편 로그인',
    circleBg: 'bg-[#F9E054] hover:bg-[#ebd244]',
    iconColor: 'text-[#3B221F]',
    defaultEmail: 'jihun.collector@kakao.com',
    defaultName: '김지훈',
    defaultAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  },
  facebook: {
    id: 'facebook',
    name: '페이스북',
    tagline: 'Facebook으로 계속하기',
    circleBg: 'bg-[#536BA9] hover:bg-[#475c94]',
    iconColor: 'text-white',
    defaultEmail: 'jihun.fb@facebook.com',
    defaultName: '김지훈',
    defaultAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  },
  google: {
    id: 'google',
    name: 'Google',
    tagline: 'Google 계정으로 계속하기',
    circleBg: 'bg-white hover:bg-gray-50',
    circleBorder: 'border-2 border-[#5482EA]',
    iconColor: '',
    defaultEmail: 'juneyboy2865@gmail.com',
    defaultName: '김지훈',
    defaultAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
  },
  apple: {
    id: 'apple',
    name: 'Apple',
    tagline: 'Apple로 로그인',
    circleBg: 'bg-black hover:bg-neutral-800',
    iconColor: 'text-white',
    defaultEmail: 'jihun.apple@icloud.com',
    defaultName: '김지훈',
    defaultAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
  },
};
