import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, RefreshCw, Cloud, Thermometer, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { outfitSuggestionService } from '@/services/outfitSuggestionService';

interface DailyOutfitCardProps {
  suggestion: any;
  onAccept?: () => void;
  onReject?: () => void;
  onRefresh?: () => void;
}

export const DailyOutfitCard = ({
  suggestion,
  onAccept,
  onReject,
  onRefresh
}: DailyOutfitCardProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    setLoading(true);
    try {
      await outfitSuggestionService.acceptSuggestion(suggestion.id);
      toast({
        title: 'Outfit Accepted',
        description: "Great choice! This outfit has been added to your history."
      });
      onAccept?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to accept outfit',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      await outfitSuggestionService.rejectSuggestion(suggestion.id);
      toast({
        title: 'Outfit Rejected',
        description: "We'll find you a better match!"
      });
      onReject?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject outfit',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const outfit = suggestion.outfit;
  const weatherData = suggestion.weather_data;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">
              {outfit?.name || 'Daily Outfit Suggestion'}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="capitalize">{suggestion.time_slot}</span>
              <span>•</span>
              <span className="capitalize">{suggestion.occasion}</span>
            </div>
          </div>
          <Badge variant="secondary" className="ml-2">
            {suggestion.confidence_score}% Match
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Outfit Image */}
        {outfit?.photos?.main && (
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-muted">
            <img
              src={outfit.photos.main}
              alt={outfit.name}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {/* Weather Info */}
        {weatherData && (
          <div className="flex items-center gap-4 rounded-lg bg-muted/50 p-3">
            <div className="flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {weatherData.temperature}°C
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Cloud className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm capitalize">
                {weatherData.condition}
              </span>
            </div>
          </div>
        )}

        {/* Description */}
        {outfit?.description && (
          <p className="text-sm text-muted-foreground">
            {outfit.description}
          </p>
        )}

        {/* Style Tags */}
        {outfit?.style_tags && outfit.style_tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {outfit.style_tags.map((tag: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        {!suggestion.is_accepted && !suggestion.is_rejected && (
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleAccept}
              disabled={loading}
              className="flex-1"
              size="sm"
            >
              <Check className="mr-2 h-4 w-4" />
              Wear This
            </Button>
            <Button
              onClick={handleReject}
              disabled={loading}
              variant="outline"
              className="flex-1"
              size="sm"
            >
              <X className="mr-2 h-4 w-4" />
              Skip
            </Button>
            <Button
              onClick={onRefresh}
              disabled={loading}
              variant="ghost"
              size="sm"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Status Badge */}
        {suggestion.is_accepted && (
          <Badge className="w-full justify-center" variant="default">
            <Check className="mr-2 h-4 w-4" />
            Wearing Today
          </Badge>
        )}
        {suggestion.is_rejected && (
          <Badge className="w-full justify-center" variant="secondary">
            <X className="mr-2 h-4 w-4" />
            Skipped
          </Badge>
        )}
      </CardContent>
    </Card>
  );
};
