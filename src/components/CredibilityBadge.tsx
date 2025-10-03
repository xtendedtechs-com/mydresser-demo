import { Shield, Star, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useCredibility } from '@/hooks/useCredibility';

interface CredibilityBadgeProps {
  userId: string;
  showDetails?: boolean;
}

export const CredibilityBadge = ({ userId, showDetails = false }: CredibilityBadgeProps) => {
  const { credibility, getCredibilityBadge } = useCredibility(userId);

  if (!credibility) return null;

  const badge = getCredibilityBadge(credibility.credibility_score);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`${badge.color} text-white`}>
              <Shield className="w-3 h-3 mr-1" />
              {badge.label}
            </Badge>
            {credibility.verified_seller && (
              <CheckCircle2 className="w-4 h-4 text-blue-500" />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent className="w-64">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Credibility Score</span>
              <span className="text-lg font-bold">{credibility.credibility_score}/100</span>
            </div>
            
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span>Total Sales:</span>
                <span className="font-medium">{credibility.total_sales}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Successful Transactions:</span>
                <span className="font-medium">{credibility.successful_transactions}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Average Rating:</span>
                <span className="font-medium flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                  {credibility.average_rating.toFixed(1)}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t space-y-1">
              <div className="flex items-center gap-2 text-xs">
                {credibility.id_verified ? (
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                ) : (
                  <AlertCircle className="w-3 h-3 text-gray-400" />
                )}
                <span>ID Verified</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                {credibility.phone_verified ? (
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                ) : (
                  <AlertCircle className="w-3 h-3 text-gray-400" />
                )}
                <span>Phone Verified</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                {credibility.email_verified ? (
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                ) : (
                  <AlertCircle className="w-3 h-3 text-gray-400" />
                )}
                <span>Email Verified</span>
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
