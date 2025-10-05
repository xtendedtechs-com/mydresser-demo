import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CalendarDays, Star } from 'lucide-react';
import { useOutfitHistory } from '@/hooks/useOutfitHistory';
import { format, isSameDay, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';

export const OutfitHistoryCalendar = () => {
  const { t } = useTranslation();
  const { history } = useOutfitHistory();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedOutfit, setSelectedOutfit] = useState<any>(null);

  const getOutfitsForDate = (date: Date) => {
    return history.filter(entry => 
      isSameDay(parseISO(entry.worn_date), date)
    );
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
    const outfits = getOutfitsForDate(date);
    if (outfits.length > 0) {
      setSelectedOutfit(outfits[0]);
    }
  };

  const getModifiers = () => {
    const datesWithOutfits = history.map(entry => parseISO(entry.worn_date));
    return {
      hasOutfit: datesWithOutfits,
    };
  };

  const getModifiersStyles = () => ({
    hasOutfit: {
      backgroundColor: 'hsl(var(--primary) / 0.2)',
      fontWeight: 'bold',
      color: 'hsl(var(--primary))',
    },
  });

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            {t('outfit.historyCalendar', 'Outfit Calendar')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            modifiers={getModifiers()}
            modifiersStyles={getModifiersStyles()}
            className="rounded-md border"
          />
          
          {selectedDate && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">
                {format(selectedDate, 'MMMM d, yyyy')}
              </h3>
              {getOutfitsForDate(selectedDate).length > 0 ? (
                <div className="space-y-2">
                  {getOutfitsForDate(selectedDate).map(outfit => (
                    <Card key={outfit.id} className="p-3 cursor-pointer hover:bg-accent/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {outfit.occasion && (
                              <Badge variant="secondary">{outfit.occasion}</Badge>
                            )}
                            {outfit.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                                <span className="text-sm">{outfit.rating}</span>
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {outfit.outfit_items.length} items
                          </p>
                          {outfit.notes && (
                            <p className="text-sm mt-1">{outfit.notes}</p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t('outfit.noOutfitsThisDay', 'No outfits logged for this day')}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedOutfit} onOpenChange={() => setSelectedOutfit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t('outfit.outfitDetails', 'Outfit Details')}
            </DialogTitle>
          </DialogHeader>
          {selectedOutfit && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  {format(parseISO(selectedOutfit.worn_date), 'PPPP')}
                </p>
              </div>
              {selectedOutfit.occasion && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Occasion</h4>
                  <Badge>{selectedOutfit.occasion}</Badge>
                </div>
              )}
              {selectedOutfit.weather && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Weather</h4>
                  <p className="text-sm">{selectedOutfit.weather}</p>
                </div>
              )}
              {selectedOutfit.rating && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Rating</h4>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < selectedOutfit.rating
                            ? 'fill-yellow-500 text-yellow-500'
                            : 'text-muted-foreground'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
              {selectedOutfit.notes && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Notes</h4>
                  <p className="text-sm text-muted-foreground">{selectedOutfit.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
