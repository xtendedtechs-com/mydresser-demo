import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from "date-fns";
import { useOutfitCalendar } from "@/hooks/useOutfitCalendar";
import { useToast } from "@/hooks/use-toast";

const OutfitCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { scheduledOutfits, getOutfitsForDate } = useOutfitCalendar();
  const { toast } = useToast();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const previousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const outfits = getOutfitsForDate(date);
    if (outfits.length > 0) {
      toast({
        title: `${outfits.length} outfit(s) scheduled`,
        description: `for ${format(date, 'MMMM d, yyyy')}`
      });
    }
  };

  const getDayOutfits = (date: Date) => {
    return scheduledOutfits.filter(outfit =>
      isSameDay(new Date(outfit.date), date)
    );
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Outfit Calendar
          </h2>
          <div className="flex items-center gap-2">
            <Button onClick={previousMonth} variant="outline" size="icon">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium min-w-[140px] text-center">
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <Button onClick={nextMonth} variant="outline" size="icon">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground p-2">
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {daysInMonth.map(date => {
            const dayOutfits = getDayOutfits(date);
            const hasOutfits = dayOutfits.length > 0;
            const isSelected = selectedDate && isSameDay(date, selectedDate);
            const isCurrentDay = isToday(date);

            return (
              <button
                key={date.toString()}
                onClick={() => handleDateClick(date)}
                className={`
                  relative aspect-square p-1 rounded-lg border transition-all
                  ${!isSameMonth(date, currentDate) ? 'opacity-30' : ''}
                  ${isSelected ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}
                  ${isCurrentDay ? 'bg-accent' : ''}
                `}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <span className={`text-sm ${isCurrentDay ? 'font-bold' : ''}`}>
                    {format(date, 'd')}
                  </span>
                  {hasOutfits && (
                    <div className="mt-1 flex gap-1">
                      {dayOutfits.slice(0, 3).map((_, i) => (
                        <div key={i} className="w-1 h-1 rounded-full bg-primary" />
                      ))}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Selected Date Details */}
      {selectedDate && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </h3>
            <Button size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Schedule Outfit
            </Button>
          </div>

          {getDayOutfits(selectedDate).length > 0 ? (
            <div className="space-y-3">
              {getDayOutfits(selectedDate).map(outfit => (
                <div key={outfit.id} className="p-3 rounded-lg border bg-muted/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{outfit.outfitName}</span>
                    <Badge variant="secondary">{outfit.occasion}</Badge>
                  </div>
                  <div className="flex gap-2">
                    {outfit.items.slice(0, 3).map((item, i) => (
                      <div key={i} className="w-12 h-12 rounded bg-background border" />
                    ))}
                  </div>
                  {outfit.notes && (
                    <p className="text-xs text-muted-foreground mt-2">{outfit.notes}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No outfits scheduled for this day
            </p>
          )}
        </Card>
      )}
    </div>
  );
};

export default OutfitCalendar;
