import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Campaign } from '../../types';

interface CampaignCardProps {
  campaign: Campaign;
  onClick: () => void;
}

const statusConfig = {
  success: { label: '성공', className: 'bg-green-100 text-green-700' },
  ongoing: { label: '진행중', className: 'bg-blue-100 text-blue-700' },
  upcoming: { label: '예정', className: 'bg-gray-100 text-gray-600' },
};

function formatAmount(amount: number): string {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
  return `$${amount.toLocaleString()}`;
}

export function CampaignCard({ campaign, onClick }: CampaignCardProps) {
  const status = statusConfig[campaign.status];

  return (
    <Card
      className="bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
      onClick={onClick}
    >
      <div className="relative">
        <img
          src={campaign.imageUrl}
          alt={campaign.name}
          className="w-full h-44 object-cover"
        />
        <Badge className={`absolute top-3 right-3 ${status.className} border-0`}>
          {status.label}
        </Badge>
        <Badge className="absolute top-3 left-3 bg-white/90 text-gray-700 border-0 text-[10px]">
          {campaign.platform}
        </Badge>
      </div>
      <CardContent className="pt-4">
        <p className="text-xs text-gray-500">{campaign.maker}</p>
        <h3 className="font-semibold text-gray-900 mt-1">{campaign.name}</h3>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{campaign.description}</p>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-400">펀딩액</p>
            <p className="text-lg font-bold text-[#ff003b]">{formatAmount(campaign.fundingAmount)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">달성률</p>
            <p className="text-lg font-bold text-gray-900">{campaign.achievementRate}%</p>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
          <span>{campaign.backerCount.toLocaleString()} 백커</span>
          <span>{campaign.startDate} ~ {campaign.endDate}</span>
        </div>
        <div className="flex gap-1.5 mt-3 flex-wrap">
          {campaign.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-[#f7f9fc] text-gray-500 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
