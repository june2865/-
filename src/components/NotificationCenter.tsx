import React from 'react';
import { CheckCheck, Bell, ArrowRight } from 'lucide-react';
import { AuctionNotification } from '../types/auction';

interface NotificationCenterProps {
  notifications: AuctionNotification[];
  onMarkAllAsRead: () => void;
  onSelectNotification: (notif: AuctionNotification) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onMarkAllAsRead,
  onSelectNotification,
}) => {
  const todayList = notifications.filter((n) => n.timeGroup === 'today');
  const yesterdayList = notifications.filter((n) => n.timeGroup === 'yesterday');

  const getTagStyle = (tag: string) => {
    switch (tag) {
      case 'OUTBID':
        return 'bg-red-50 text-red-600 border border-red-200';
      case 'WIN':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold';
      case 'SHIPPING':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const renderGroup = (title: string, list: AuctionNotification[]) => {
    if (list.length === 0) return null;

    return (
      <div className="mb-6">
        <div className="px-4 mb-2 flex items-center justify-between">
          <span className="text-xs font-bold text-gray-500 tracking-wider">
            {title}
          </span>
          <span className="text-[11px] text-gray-600">{list.length}건</span>
        </div>

        <div className="space-y-2 px-4">
          {list.map((item) => {
            const isOutbid = item.tag === 'OUTBID';

            return (
              <div
                key={item.id}
                onClick={() => onSelectNotification(item)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 select-none active:scale-[0.99] ${
                  isOutbid
                    ? 'border-rose-200 bg-rose-50/40 shadow-xs'
                    : item.isRead
                    ? 'bg-white border-gray-100 text-gray-700'
                    : 'bg-white border-black/10 shadow-[0_2px_8px_rgba(0,0,0,0.04)] ring-1 ring-black/5'
                }`}
              >
                {/* Rounded Square Product Thumbnail */}
                <div className="relative w-13 h-13 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                  <img
                    src={item.itemImage}
                    alt={item.itemTitle}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Center Info: Type, Time, Detailed message */}
                <div className="flex-1 min-w-0 pr-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold text-gray-950">
                      {isOutbid ? '상위 입찰 발생 알림' : item.title}
                    </span>
                    <span className="text-[10px] text-gray-500">{item.timeText}</span>
                  </div>
                  <p className="text-xs line-clamp-2 leading-relaxed text-gray-600">
                    {item.message}
                  </p>
                </div>

                {/* Right Side: Unread dot & English status tag */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="flex items-center gap-1.5">
                    {!item.isRead && (
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    )}
                    <span
                      className={`text-[9px] font-semibold px-1.5 py-0.5 rounded tracking-wide ${getTagStyle(
                        item.tag
                      )}`}
                    >
                      {isOutbid ? '상위 입찰' : item.tag}
                    </span>
                  </div>

                  {isOutbid ? (
                    <span className="text-[10px] font-semibold text-rose-700 flex items-center gap-0.5">
                      <span>재입찰하기</span>
                      <ArrowRight className="w-3 h-3 text-rose-700" />
                    </span>
                  ) : (
                    <ArrowRight className="w-3.5 h-3.5 text-gray-300" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="pb-28 pt-2">
      {/* Top Header */}
      <header className="px-4 py-3 bg-white sticky top-0 z-30 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight">
            알림 센터
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            나의 활동 알림
          </p>
        </div>

        <button
          onClick={onMarkAllAsRead}
          type="button"
          className="flex items-center gap-1 text-xs font-bold text-gray-600 hover:text-black py-1.5 px-2.5 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <CheckCheck className="w-3.5 h-3.5" />
          <span>전체 읽음</span>
        </button>
      </header>

      {/* Grouped Notifications */}
      <div className="mt-4">
        {notifications.length === 0 ? (
          <div className="my-16 py-12 px-6 bg-white rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-center mx-4">
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-3 text-gray-400">
              <Bell className="w-8 h-8 stroke-[1.5]" />
            </div>
            <h3 className="text-base font-bold text-gray-800">
              새로운 알림이 없습니다
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              경매 호가 갱신, 마감 임박, 낙찰 소식이 여기에 표시됩니다.
            </p>
          </div>
        ) : (
          <>
            {renderGroup('오늘', todayList)}
            {renderGroup('어제', yesterdayList)}
          </>
        )}
      </div>
    </div>
  );
};
