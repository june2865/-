import React from 'react';
import {
  Home,
  Gavel,
  Heart,
  PlusCircle,
  Bell,
  User,
} from 'lucide-react';
import { NavTab } from '../types/auction';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  unreadNotificationCount: number;
  activeBidsCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  unreadNotificationCount,
  activeBidsCount,
}) => {
  const navItems: Array<{
    id: NavTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    showBadgeDot?: boolean;
    isPrimary?: boolean;
  }> = [
    {
      id: 'home',
      label: '홈피드',
      icon: Home,
    },
    {
      id: 'active_bids',
      label: '내 입찰',
      icon: Gavel,
      badge: activeBidsCount > 0 ? activeBidsCount : undefined,
    },
    {
      id: 'wishlist',
      label: '위시리스트',
      icon: Heart,
    },
    {
      id: 'post',
      label: '경매등록',
      icon: PlusCircle,
      isPrimary: true,
    },
    {
      id: 'notification',
      label: '알림',
      icon: Bell,
      badge: unreadNotificationCount > 0 ? unreadNotificationCount : undefined,
    },
    {
      id: 'mypage',
      label: '마이페이지',
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-[0_-4px_16px_rgba(0,0,0,0.03)] pb-[max(env(safe-area-inset-bottom),8px)] pt-1.5 transition-all">
      <div className="max-w-md mx-auto px-2">
        <div className="grid grid-cols-6 items-center">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                type="button"
                className={`relative flex flex-col items-center justify-center py-1 rounded-xl transition-all select-none active:scale-95 ${
                  isActive ? 'text-black font-semibold' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <div className="relative">
                  {item.isPrimary ? (
                    <div
                      className={`p-1 rounded-full transition-colors ${
                        isActive
                          ? 'bg-black text-white'
                          : 'text-gray-700 hover:text-black'
                      }`}
                    >
                      <Icon className="w-5 h-5 stroke-[2.2]" />
                    </div>
                  ) : (
                    <Icon
                      className={`w-5 h-5 transition-transform duration-200 ${
                        isActive ? 'scale-110 stroke-[2.4] text-black' : 'stroke-[1.75]'
                      }`}
                    />
                  )}

                  {/* Badge count / dot */}
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[9px] font-bold px-1.5 min-w-[16px] h-4 rounded-full flex items-center justify-center shadow-xs">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>

                <span
                  className={`text-[10px] tracking-tight mt-0.5 truncate max-w-full ${
                    isActive ? 'text-black font-bold' : 'text-gray-500 font-medium'
                  }`}
                >
                  {item.label}
                </span>

                {/* Subtle active indicator dot */}
                {isActive && !item.isPrimary && (
                  <span className="w-1 h-1 bg-black rounded-full mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
