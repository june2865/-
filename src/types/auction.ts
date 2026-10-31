export type AuctionCategory =
  | '시계'
  | '스니커즈'
  | '쥬얼리'
  | '미술작품'
  | '패션'
  | '가구'
  | '주류'
  | '기타';

export type ProductCondition =
  | '새제품'
  | '중고(최상)'
  | '중고(보통)'
  | '파손/수리 필요';

export interface BidRecord {
  id: string;
  bidderName: string;
  bidderAvatar?: string;
  amount: number;
  timestamp: number;
  isMe?: boolean;
}

export interface SellerInfo {
  name: string;
  avatar: string;
  rating: number;
  verified: boolean;
  salesCount: number;
}

export interface AuctionItem {
  id: string;
  title: string;
  category: AuctionCategory;
  images: string[];
  startPrice: number;
  currentPrice: number;
  buyNowPrice?: number | null; // 즉시구매 희망가
  minIncrement: number;
  endTime: number; // Unix timestamp in ms
  seller: SellerInfo;
  condition: ProductCondition;
  description: string;
  tags?: string[]; // 판매자가 직접 입력한 해시태그 목록
  isHot: boolean;
  isLiked: boolean;
  bidCount: number;
  views: number;
  autoRebidAllowed: boolean;
  bids: BidRecord[];
  status: 'active' | 'ended';
  winnerName?: string;
  isBuyNowWon?: boolean; // 즉시구매로 낙찰되었는지 여부
  myBidStatus?: 'winning' | 'outbid' | 'won' | 'lost' | null;
  myAutoBidLimit?: number | null; // 내 자동 입찰 설정 최대 한도
  createdAt: number;
}

export type NotificationType = 'outbid' | 'win' | 'shipping';

export interface AuctionNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  auctionId?: string;
  itemTitle: string;
  itemImage: string;
  timestamp: number;
  timeGroup: 'today' | 'yesterday';
  timeText: string;
  isRead: boolean;
  tag: string; // 'OUTBID' | 'WIN' | 'SHIPPING'
}

export type SocialLoginProvider = 'naver' | 'kakao' | 'facebook' | 'google' | 'apple';

export interface UserProfile {
  name: string;
  avatar: string;
  mannerScore: number;
  verified: boolean;
  wonCount: number;
  sellingCount: number;
  wishlistCount: number;
  isLoggedIn?: boolean;
  loginProvider?: SocialLoginProvider | null;
  linkedProviders?: SocialLoginProvider[];
  email?: string;
  naverEmail?: string;
  kakaoEmail?: string;
  facebookEmail?: string;
  googleEmail?: string;
  appleEmail?: string;
}

export type NavTab =
  | 'home'
  | 'active_bids'
  | 'wishlist'
  | 'post'
  | 'notification'
  | 'mypage';
