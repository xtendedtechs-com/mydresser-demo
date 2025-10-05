import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Plus } from 'lucide-react';
import { useOutfitHistory } from '@/hooks/useOutfitHistory';
import { useTranslation } from 'react-i18next';

interface LogOutfitDialogProps {
  itemIds: string[];
  trigger?: React.ReactNode;
}

export const LogOutfitDialog = ({ itemIds, trigger }: LogOutfitDialogProps) => {
  const { t } = useTranslation();
  const { logOutfit } = useOutfitHistory();
  const [open, setOpen] = useState(false);
  const [occasion, setOccasion] = useState('');
  const [weather, setWeather] = useState('');
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      await logOutfit(
        itemIds,
        occasion || undefined,
        weather || undefined,
        rating || undefined,
        notes || undefined
      );
      setOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error logging outfit:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setOccasion('');
    setWeather('');
    setRating(0);
    setNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            {t('outfit.logOutfit', 'Log Outfit')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('outfit.logToday', 'Log Today\'s Outfit')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="occasion">{t('outfit.occasion', 'Occasion')}</Label>
            <Select value={occasion} onValueChange={setOccasion}>
              <SelectTrigger id="occasion">
                <SelectValue placeholder="Select occasion" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="work">Work</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="sport">Sport</SelectItem>
                <SelectItem value="party">Party</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="travel">Travel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="weather">{t('outfit.weather', 'Weather')}</Label>
            <Select value={weather} onValueChange={setWeather}>
              <SelectTrigger id="weather">
                <SelectValue placeholder="Select weather" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sunny">Sunny</SelectItem>
                <SelectItem value="cloudy">Cloudy</SelectItem>
                <SelectItem value="rainy">Rainy</SelectItem>
                <SelectItem value="cold">Cold</SelectItem>
                <SelectItem value="hot">Hot</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('outfit.rating', 'Rating')}</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= rating
                        ? 'fill-yellow-500 text-yellow-500'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t('common.notes', 'Notes')}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did you feel? Any compliments?"
              rows={3}
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isLoading || itemIds.length === 0}
            className="w-full"
          >
            {isLoading ? t('common.saving', 'Saving...') : t('common.save', 'Save')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
