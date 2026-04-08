import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Influencer } from '../../types';

interface InfluencerCardProps {
  influencer: Influencer;
  onClick: () => void;
}

const tierConfig = {
  tier1: { label: 'Tier 1 시딩', className: 'bg-green-100 text-green-700' },
  tier2: { label: 'Tier 2 유료', className: 'bg-amber-100 text-amber-700' },
  tier3: { label: 'Tier 3 메가', className: 'bg-red-100 text-red-700' },
};

const platformColors: Record<string, string> = {
  YouTube: 'bg-red-50 text-red-600',
  Instagram: 'bg-pink-50 text-pink-600',
  TikTok: 'bg-gray-100 text-gray-800',
};

function formatFollowers(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

function formatCost(cost: number): string {
  if (cost === 0) return '제품만 제공';
  if (cost >= 10000000) return `${(cost / 10000000).toFixed(0)}천만원`;
  if (cost >= 10000) return `${(cost / 10000).toFixed(0)}만원`;
  return `${cost.toLocaleString()}원`;
}

export function InfluencerCard({ influencer, onClick }: InfluencerCardProps) {
  const tier = tierConfig[influencer.tier];
  const platformColor = platformColors[influencer.platform] || 'bg-gray-100 text-gray-700';

  return (
    <Card
      className="bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <img
            src={influencer.profilePhoto}
            alt={influencer.name}
            className="w-14 h-14 rounded-full object-cover shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-gray-900 truncate">{influencer.name}</h3>
              <Badge className={`${tier.className} border-0 text-[10px]`}>{tier.label}</Badge>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={`${platformColor} border-0 text-[10px]`}>{influencer.platform}</Badge>
              <span className="text-xs text-gray-400">{influencer.category}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <p className="text-xs text-gray-400">팔로워</p>
            <p className="text-sm font-bold">{formatFollowers(influencer.followerCount)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400">참여율</p>
            <p className="text-sm font-bold">{influencer.engagementRate}%</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400">비용</p>
            <p className="text-sm font-bold">{formatCost(influencer.costPerPost)}</p>
          </div>
        </div>

        {influencer.seedingStatus && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              시딩 상태: <span className="text-[#ff003b] font-medium">{influencer.seedingStatus}</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
