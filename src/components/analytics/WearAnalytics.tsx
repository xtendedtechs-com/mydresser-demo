import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Clock, AlertCircle } from 'lucide-react';
import { useOutfitHistory } from '@/hooks/useOutfitHistory';
import { useWardrobe } from '@/hooks/useWardrobe';
import { useTranslation } from 'react-i18next';

export const WearAnalytics = () => {
  const { t } = useTranslation();
  const { history, wearFrequency, getMostWornItems, getLeastWornItems, getUnwornItems } = useOutfitHistory();
  const { items } = useWardrobe();

  const totalItems = items.length;
  const wornItems = wearFrequency.length;
  const unwornItems = getUnwornItems(items.map(i => i.id));
  const utilizationRate = totalItems > 0 ? (wornItems / totalItems) * 100 : 0;

  const mostWorn = getMostWornItems(5);
  const leastWorn = getLeastWornItems(5).filter(item => item.wear_count > 0);

  const getItemDetails = (itemId: string) => {
    return items.find(item => item.id === itemId);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Overall Statistics */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>{t('analytics.wardrobeUtilization', 'Wardrobe Utilization')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Items</p>
              <p className="text-2xl font-bold">{totalItems}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Items Worn</p>
              <p className="text-2xl font-bold">{wornItems}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Never Worn</p>
              <p className="text-2xl font-bold text-orange-500">{unwornItems.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Utilization Rate</p>
              <p className="text-2xl font-bold">{utilizationRate.toFixed(0)}%</p>
            </div>
          </div>
          <Progress value={utilizationRate} className="mt-4" />
        </CardContent>
      </Card>

      {/* Most Worn Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            {t('analytics.mostWorn', 'Most Worn')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {mostWorn.length > 0 ? (
            mostWorn.map((freq, index) => {
              const item = getItemDetails(freq.item_id);
              return (
                <div key={freq.item_id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{index + 1}</Badge>
                    <div>
                      <p className="font-medium text-sm">
                        {item?.name || 'Unknown Item'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {freq.days_since_worn} days ago
                      </p>
                    </div>
                  </div>
                  <Badge>{freq.wear_count}x</Badge>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No wear data yet
            </p>
          )}
        </CardContent>
      </Card>

      {/* Least Worn Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-orange-500" />
            {t('analytics.leastWorn', 'Least Worn')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {leastWorn.length > 0 ? (
            leastWorn.map((freq) => {
              const item = getItemDetails(freq.item_id);
              return (
                <div key={freq.item_id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">
                        {item?.name || 'Unknown Item'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {freq.days_since_worn} days ago
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">{freq.wear_count}x</Badge>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No wear data yet
            </p>
          )}
        </CardContent>
      </Card>

      {/* Unworn Items Alert */}
      {unwornItems.length > 0 && (
        <Card className="md:col-span-2 border-orange-500/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              {t('analytics.unwornItems', 'Unworn Items')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              You have {unwornItems.length} item{unwornItems.length !== 1 ? 's' : ''} that haven't been worn yet. 
              Consider styling them or moving them to your 2ndDresser.
            </p>
            <div className="flex flex-wrap gap-2">
              {unwornItems.slice(0, 10).map(itemId => {
                const item = getItemDetails(itemId);
                return (
                  <Badge key={itemId} variant="outline">
                    {item?.name || 'Unknown'}
                  </Badge>
                );
              })}
              {unwornItems.length > 10 && (
                <Badge variant="outline">+{unwornItems.length - 10} more</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
