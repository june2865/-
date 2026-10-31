import React, { useState, useEffect } from 'react';
import {
  INITIAL_AUCTIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_USER_PROFILE,
} from './data/mockData';
import {
  AuctionItem,
  AuctionNotification,
  NavTab,
  UserProfile,
} from './types/auction';
import { BottomNav } from './components/BottomNav';
import { HomeFeed } from './components/HomeFeed';
import { ActiveBids } from './components/ActiveBids';
import { WishList } from './components/WishList';
import { PostAuction } from './components/PostAuction';
import { NotificationCenter } from './components/NotificationCenter';
import { MyPage } from './components/MyPage';
import { ProductDetail } from './components/ProductDetail';
import { playChimeSound } from './utils/format';
import confetti from 'canvas-confetti';

const STORAGE_KEYS = {
  AUCTIONS: 'auctio_items_v3',
  NOTIFICATIONS: 'auctio_notifs_v1',
  USER: 'auctio_user_v1',
};

export default function App() {
  // Real-time ticker: updates every 1000ms
  const [nowMs, setNowMs] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Persistent State
  const [items, setItems] = useState<AuctionItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUCTIONS);
    if (saved) {
      try {
        const parsed: AuctionItem[] = JSON.parse(saved);
        // Replace or sanitize legacy data and merge buyNowPrice if missing
        const mapped = parsed.map((item) => {
          if ((item.category as string) === '슈퍼카') {
            item.category = '미술작품';
          }
          const initialMatch = INITIAL_AUCTIONS.find((init) => init.id === item.id);
          if (item.buyNowPrice === undefined) {
            if (initialMatch?.buyNowPrice) {
              item.buyNowPrice = initialMatch.buyNowPrice;
            } else {
              item.buyNowPrice = Math.round(item.currentPrice * 1.25);
            }
          }
          if (!item.tags && initialMatch?.tags) {
            item.tags = initialMatch.tags;
          }
          if (item.bids) {
            item.bids = item.bids.map((b) => ({
              ...b,
              bidderName: b.bidderName ? b.bidderName.replace(/\s*\(나\)\s*$/, '') : b.bidderName,
            }));
          }
          if (item.winnerName) {
            item.winnerName = item.winnerName.replace(/\s*\(나\)\s*$/, '');
          }
          return item;
        });

        const existingIds = new Set(mapped.map((i) => i.id));
        const missingNew = INITIAL_AUCTIONS.filter((init) => !existingIds.has(init.id));
        return [...mapped, ...missingNew];
      } catch {
        // fallback
      }
    }
    return INITIAL_AUCTIONS;
  });

  const [notifications, setNotifications] = useState<AuctionNotification[]>(
    () => {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
      return INITIAL_NOTIFICATIONS;
    }
  );

  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_USER_PROFILE,
          ...parsed,
          isLoggedIn: parsed.isLoggedIn !== undefined ? parsed.isLoggedIn : true,
          loginProvider: parsed.loginProvider || 'kakao',
          linkedProviders: parsed.linkedProviders || ['kakao', 'google'],
        };
      } catch {
        // fallback
      }
    }
    return INITIAL_USER_PROFILE;
  });

  // Navigation State
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUCTIONS, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.NOTIFICATIONS,
      JSON.stringify(notifications)
    );
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }, [user]);

  // Selected Item Object
  const selectedItem = items.find((item) => item.id === selectedItemId) || null;

  // Global Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Toggle Like / Wishlist
  const handleToggleLike = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const targetItem = items.find((item) => item.id === itemId);
    const wasLiked = targetItem ? targetItem.isLiked : false;
    const nextLiked = !wasLiked;

    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return { ...item, isLiked: nextLiked };
        }
        return item;
      })
    );

    setUser((prev) => ({
      ...prev,
      wishlistCount: Math.max(
        0,
        prev.wishlistCount + (nextLiked ? 1 : -1)
      ),
    }));

    playChimeSound('pop');
    if (nextLiked) {
      showToast('위시리스트에 추가되었습니다');
    } else {
      showToast('위시리스트에서 제외되었습니다');
    }
  };

  // Place Bid (English Auction Mechanics)
  const handlePlaceBid = (
    itemId: string,
    amount: number,
    bidderName: string
  ): { success: boolean; message: string } => {
    const targetItem = items.find((i) => i.id === itemId);
    if (!targetItem) {
      return { success: false, message: '상품 정보를 찾을 수 없습니다.' };
    }

    if (nowMs >= targetItem.endTime) {
      return { success: false, message: '이미 마감된 경매입니다.' };
    }

    // Block seller from bidding on their own auction
    if (
      targetItem.seller.name === bidderName ||
      targetItem.seller.name.includes(bidderName)
    ) {
      return {
        success: false,
        message: '본인이 등록한 경매 물품에는 입찰할 수 없습니다.',
      };
    }

    const minRequired = targetItem.currentPrice + targetItem.minIncrement;
    if (amount < minRequired) {
      return {
        success: false,
        message: `최소 입찰 가능 금액은 ₩${minRequired.toLocaleString('ko-KR')} 이상입니다.`,
      };
    }

    // Anti-sniping rule: If bid placed within last 2 minutes, extend by 2 minutes
    const remainingMs = targetItem.endTime - nowMs;
    const shouldExtend = remainingMs < 2 * 60 * 1000;
    const newEndTime = shouldExtend
      ? targetItem.endTime + 2 * 60 * 1000
      : targetItem.endTime;

    const newBid = {
      id: `bid-${Date.now()}`,
      bidderName,
      bidderAvatar: user.avatar,
      amount,
      timestamp: Date.now(),
      isMe: true,
    };

    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            currentPrice: amount,
            bidCount: item.bidCount + 1,
            endTime: newEndTime,
            myBidStatus: 'winning',
            bids: [newBid, ...item.bids],
          };
        }
        return item;
      })
    );

    // Add winning notification
    const newNotif: AuctionNotification = {
      id: `notif-${Date.now()}`,
      type: 'win',
      title: '입찰 성공 (최고가 달성)',
      message: `${targetItem.title}에 ₩${amount.toLocaleString(
        'ko-KR'
      )}으로 최고가 입찰을 완료했습니다!`,
      auctionId: targetItem.id,
      itemTitle: targetItem.title,
      itemImage: targetItem.images[0],
      timestamp: Date.now(),
      timeGroup: 'today',
      timeText: '방금 전',
      isRead: false,
      tag: 'WIN',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    showToast(
      shouldExtend
        ? '입찰 성공! 마감 임박으로 경매 시간이 2분 연장되었습니다 ⏱️'
        : '입찰이 성공적으로 등록되었습니다! 🎯'
    );

    return { success: true, message: '입찰 완료' };
  };

  // Auto-Bid (자동 입찰) Handler
  const handleAutoBid = (
    itemId: string,
    maxLimit: number,
    bidderName: string
  ): { success: boolean; message: string; requiresInstantBuy?: boolean } => {
    const targetItem = items.find((i) => i.id === itemId);
    if (!targetItem) {
      return { success: false, message: '상품 정보를 찾을 수 없습니다.' };
    }

    if (nowMs >= targetItem.endTime || targetItem.status === 'ended') {
      return { success: false, message: '이미 마감된 경매입니다.' };
    }

    // Block seller from bidding on their own auction
    if (
      targetItem.seller.name === bidderName ||
      targetItem.seller.name.includes(bidderName)
    ) {
      return {
        success: false,
        message: '본인이 등록한 경매 물품에는 입찰할 수 없습니다.',
      };
    }

    const minRequired = targetItem.currentPrice + targetItem.minIncrement;
    if (maxLimit < minRequired) {
      return {
        success: false,
        message: `자동 입찰 한도는 최소 ₩${minRequired.toLocaleString('ko-KR')} 이상이어야 합니다.`,
      };
    }

    // Check if maxLimit >= buyNowPrice (only active when buy now has not reached 80% threshold)
    const isBuyNowClosed = Boolean(
      targetItem.buyNowPrice && targetItem.currentPrice >= targetItem.buyNowPrice * 0.8
    );
    if (!isBuyNowClosed && targetItem.buyNowPrice && maxLimit >= targetItem.buyNowPrice) {
      return {
        success: false,
        requiresInstantBuy: true,
        message: '설정한 금액이 즉시 구매 금액 이상입니다.',
      };
    }

    const isCurrentlyWinning = targetItem.myBidStatus === 'winning';
    const initialBidPrice = isCurrentlyWinning ? targetItem.currentPrice : minRequired;

    const remainingMs = targetItem.endTime - nowMs;
    const shouldExtend = remainingMs < 2 * 60 * 1000;
    const newEndTime = shouldExtend
      ? targetItem.endTime + 2 * 60 * 1000
      : targetItem.endTime;

    const newBid = {
      id: `bid-auto-${Date.now()}`,
      bidderName: `${bidderName} (🤖자동입찰)`,
      bidderAvatar: user.avatar,
      amount: initialBidPrice,
      timestamp: Date.now(),
      isMe: true,
    };

    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            currentPrice: initialBidPrice,
            bidCount: isCurrentlyWinning ? item.bidCount : item.bidCount + 1,
            endTime: newEndTime,
            myBidStatus: 'winning',
            myAutoBidLimit: maxLimit,
            bids: isCurrentlyWinning ? item.bids : [newBid, ...item.bids],
          };
        }
        return item;
      })
    );

    const newNotif: AuctionNotification = {
      id: `notif-auto-${Date.now()}`,
      type: 'win',
      title: '자동 입찰 등록 완료',
      message: `${targetItem.title}에 최대 ₩${maxLimit.toLocaleString(
        'ko-KR'
      )} 한도로 자동 입찰이 활성화되었습니다.`,
      auctionId: targetItem.id,
      itemTitle: targetItem.title,
      itemImage: targetItem.images[0],
      timestamp: Date.now(),
      timeGroup: 'today',
      timeText: '방금 전',
      isRead: false,
      tag: 'WIN',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    return {
      success: true,
      message: `최대 ₩${maxLimit.toLocaleString('ko-KR')} 한도로 자동 입찰이 설정되었습니다.`,
    };
  };

  // Instant Buy It Now (즉시구매) Handler
  const handleBuyNow = (
    itemId: string,
    buyerName: string
  ): { success: boolean; message: string } => {
    const targetItem = items.find((i) => i.id === itemId);
    if (!targetItem) {
      return { success: false, message: '상품 정보를 찾을 수 없습니다.' };
    }

    if (targetItem.status === 'ended') {
      return { success: false, message: '이미 마감된 경매입니다.' };
    }

    // Block seller from buying their own auction
    if (
      targetItem.seller.name === buyerName ||
      targetItem.seller.name.includes(buyerName)
    ) {
      return {
        success: false,
        message: '본인이 등록한 경매 물품은 구매할 수 없습니다.',
      };
    }

    if (!targetItem.buyNowPrice) {
      return { success: false, message: '즉시구매가 설정되지 않은 상품입니다.' };
    }

    // 80% threshold rule: evaporate/disable buy now once currentPrice reaches 80% of buyNowPrice
    if (targetItem.currentPrice >= targetItem.buyNowPrice * 0.8) {
      return {
        success: false,
        message: '현재가가 즉시 구매가의 80%를 넘어 즉시 구매가 마감되었습니다.',
      };
    }

    const buyPrice = targetItem.buyNowPrice;

    const newBid = {
      id: `bid-buynow-${Date.now()}`,
      bidderName: `${buyerName} (⚡즉시구매)`,
      bidderAvatar: user.avatar,
      amount: buyPrice,
      timestamp: Date.now(),
      isMe: true,
    };

    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            currentPrice: buyPrice,
            bidCount: item.bidCount + 1,
            status: 'ended',
            winnerName: buyerName,
            isBuyNowWon: true,
            myBidStatus: 'won',
            bids: [newBid, ...item.bids],
          };
        }
        return item;
      })
    );

    setUser((prev) => ({
      ...prev,
      wonCount: prev.wonCount + 1,
    }));

    const newNotif: AuctionNotification = {
      id: `notif-buynow-${Date.now()}`,
      type: 'win',
      title: '⚡ 즉시구매 최종 낙찰 성공!',
      message: `${targetItem.title}을 즉시구매가 ₩${buyPrice.toLocaleString(
        'ko-KR'
      )}에 최종 낙찰받았습니다! 결제 및 배송 절차가 안전하게 시작됩니다.`,
      auctionId: targetItem.id,
      itemTitle: targetItem.title,
      itemImage: targetItem.images[0],
      timestamp: Date.now(),
      timeGroup: 'today',
      timeText: '방금 전',
      isRead: false,
      tag: 'WIN',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    playChimeSound('win');
    showToast(`⚡ 즉시구매 완료! '${targetItem.title}' 낙찰 확정`);

    return { success: true, message: '즉시구매 완료' };
  };

  // Add New Auction from PostAuction
  const handleSubmitNewAuction = (newItem: AuctionItem) => {
    setItems((prev) => [newItem, ...prev]);
    setUser((prev) => ({
      ...prev,
      sellingCount: prev.sellingCount + 1,
    }));

    const newNotif: AuctionNotification = {
      id: `notif-${Date.now()}`,
      type: 'shipping',
      title: '신규 옥션 등록 완료',
      message: `'${newItem.title}' 경매가 정상적으로 개시되었습니다.`,
      auctionId: newItem.id,
      itemTitle: newItem.title,
      itemImage: newItem.images[0],
      timestamp: Date.now(),
      timeGroup: 'today',
      timeText: '방금 전',
      isRead: false,
      tag: 'SHIPPING',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    setSelectedItemId(newItem.id);
    setCurrentTab('home');
    showToast('새로운 경매가 성공적으로 등록되었습니다! ✨');
  };

  // Select Item to open Detail
  const handleSelectItem = (item: AuctionItem) => {
    setSelectedItemId(item.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Mark all notifications as read
  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    playChimeSound('pop');
    showToast('모든 알림을 읽음 처리했습니다.');
  };

  // Select a notification
  const handleSelectNotification = (notif: AuctionNotification) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
    );
    if (notif.auctionId) {
      const match = items.find((i) => i.id === notif.auctionId);
      if (match) {
        setSelectedItemId(match.id);
      }
    }
  };

  // Active counts for badges
  const unreadNotificationCount = notifications.filter((n) => !n.isRead).length;
  const activeBidsCount = items.filter(
    (item) => item.status === 'active' && item.myBidStatus === 'winning'
  ).length;

  // Update user profile
  const handleUpdateUser = (updated: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...updated }));
    showToast('프로필 정보가 변경되었습니다.');
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex justify-center selection:bg-black selection:text-white">
      {/* Mobile-Centric App Container */}
      <div className="w-full max-w-md min-h-screen bg-[#FFFFFF] shadow-2xl relative flex flex-col border-x border-gray-100">
        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-black/90 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-200 text-center max-w-xs">
            {toastMessage}
          </div>
        )}

        {/* View Routing */}
        {selectedItem ? (
          /* Product Detail Page */
          <ProductDetail
            item={selectedItem}
            onBack={() => setSelectedItemId(null)}
            onToggleLike={handleToggleLike}
            onPlaceBid={handlePlaceBid}
            onBuyNow={handleBuyNow}
            onAutoBid={handleAutoBid}
            nowMs={nowMs}
            userName={user.name}
          />
        ) : (
          /* Main Tab Views */
          <div className="flex-1">
            {currentTab === 'home' && (
              <HomeFeed
                items={items}
                onSelectItem={handleSelectItem}
                onToggleLike={handleToggleLike}
                nowMs={nowMs}
              />
            )}

            {currentTab === 'active_bids' && (
              <ActiveBids
                items={items}
                onSelectItem={handleSelectItem}
                onToggleLike={handleToggleLike}
                nowMs={nowMs}
                onRefresh={() => {
                  showToast('최신 호가 데이터를 불러왔습니다 🔄');
                }}
              />
            )}

            {currentTab === 'wishlist' && (
              <WishList
                items={items}
                onSelectItem={handleSelectItem}
                onToggleLike={handleToggleLike}
                nowMs={nowMs}
              />
            )}

            {currentTab === 'post' && (
              <PostAuction
                onClose={() => setCurrentTab('home')}
                onSubmitNewAuction={handleSubmitNewAuction}
                userName={user.name}
                userAvatar={user.avatar}
              />
            )}

            {currentTab === 'notification' && (
              <NotificationCenter
                notifications={notifications}
                onMarkAllAsRead={handleMarkAllNotificationsRead}
                onSelectNotification={handleSelectNotification}
              />
            )}

            {currentTab === 'mypage' && (
              <MyPage
                user={user}
                onUpdateUser={handleUpdateUser}
                recentBids={items.filter((i) => i.myBidStatus !== null)}
                onSelectItem={handleSelectItem}
                onToggleLike={handleToggleLike}
                nowMs={nowMs}
                onNavigateToTab={(tab) => setCurrentTab(tab)}
                onShowToast={showToast}
              />
            )}
          </div>
        )}

        {/* Always Fixed Bottom Navigation Bar (hidden only during new auction posting to focus form) */}
        {(!selectedItem || currentTab !== 'post') && (
          <BottomNav
            currentTab={currentTab}
            onSelectTab={(tab) => {
              setSelectedItemId(null);
              setCurrentTab(tab);
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
            unreadNotificationCount={unreadNotificationCount}
            activeBidsCount={activeBidsCount}
          />
        )}
      </div>
    </div>
  );
}
