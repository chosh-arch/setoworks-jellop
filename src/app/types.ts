export type Language = 'ko' | 'en' | 'ja' | 'zh';

export type Platform = 'Wadiz' | 'Kickstarter' | 'Indiegogo';
export type CampaignStatus = 'success' | 'failed' | 'ongoing';
export type SocialPlatform = 'YouTube' | 'Instagram' | 'TikTok' | 'Facebook' | 'Threads' | 'Dcard';
export type Category = 'tech' | 'lifestyle' | 'beauty' | 'food' | 'game' | 'fashion' | 'camping';

export interface Product {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  platform: Platform;
  fundingGoal: number;
  currentAmount: number;
  percentage: number;
  backerCount: number;
  daysLeft: number;
  tags: string[];
  fullDescription: string;
}

export interface FundingDay {
  day: number;
  amount: number;
}

export interface ChannelAttribution {
  channel: string;
  amount: number;
  percentage: number;
}

export interface CampaignInfluencer {
  influencerId: string;
  name: string;
  profilePhoto: string;
  platform: SocialPlatform;
  tier: 'nano' | 'micro' | 'mid' | 'macro' | 'mega';
  contribution: string;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  startDate: string;
  endDate: string;
  status: CampaignStatus;
  finalAmount: number;
  achievementRate: number;
  backerCount: number;
  tags: string[];
  fullDescription: string;
  fundingTimeline: FundingDay[];
  channelAttribution: ChannelAttribution[];
  organicAmount: number;
  setoworksAmount: number;
  influencers?: CampaignInfluencer[];
}

export interface ContentItem {
  id: string;
  type: 'video' | 'image';
  thumbnailUrl: string;
  viewCount: number;
  likeCount: number;
  datePosted: string;
  url: string;
}

export interface AdMetrics {
  reach: number;
  clicks: number;
  conversions: number;
  attributedRevenue: number;
  roi: number;
  costPerAcquisition: number;
}

export interface Influencer {
  id: string;
  name: string;
  profilePhoto: string;
  platform: SocialPlatform;
  followerCount: number;
  engagementRate: number;
  category: Category;
  averageViews: number;
  content: ContentItem[];
  adMetrics?: AdMetrics;
  tier: 'nano' | 'micro' | 'mid' | 'macro' | 'mega';
  costPerPost: number;
  campaigns?: { campaignId: string; name: string; imageUrl: string; role: string }[];
  source?: 'real' | 'mock';
}

export interface Translations {
  searchPlaceholder: string;
  section1Title: string;
  section2Title: string;
  section3Title: string;
  ctaButton: string;
  filterAll: string;
  emptyState: string;
  bookmark: string;
  seeMore: string;
  channelLink: string;
  totalCount: string;
  achievement: string;
  supporters: string;
  daysLeft: string;
  fundingGoal: string;
  currentAmount: string;
  campaignPeriod: string;
  finalAmount: string;
  engagementRate: string;
  averageViews: string;
  allTab: string;
  videoTab: string;
  imageTab: string;
  welcomeTitle: string;
  welcomeDesc: string;
  sampleSearch: string;
  noResults: string;
  tryAgain: string;
  recentSearches: string;
  viewCount: string;
  likeCount: string;
}
