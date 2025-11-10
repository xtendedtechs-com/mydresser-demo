import { useState, useEffect } from 'react';
import { addDays, format, startOfWeek, endOfWeek, isSameDay } from 'date-fns';

export interface ScheduledOutfit {
  id: string;
  date: Date;
  outfitId: string;
  outfitName: string;
  items: any[];
  occasion: string;
  weather?: {
    temp: number;
    condition: string;
  };
  notes?: string;
  reminded: boolean;
}

export const useOutfitCalendar = () => {
  const [scheduledOutfits, setScheduledOutfits] = useState<ScheduledOutfit[]>(() => {
    const stored = localStorage.getItem('scheduled_outfits');
    return stored ? JSON.parse(stored).map((o: any) => ({
      ...o,
      date: new Date(o.date)
    })) : [];
  });

  useEffect(() => {
    // Save to localStorage whenever scheduledOutfits changes
    localStorage.setItem('scheduled_outfits', JSON.stringify(scheduledOutfits));
  }, [scheduledOutfits]);

  const scheduleOutfit = (
    date: Date,
    outfitId: string,
    outfitName: string,
    items: any[],
    occasion: string,
    notes?: string
  ) => {
    const newSchedule: ScheduledOutfit = {
      id: `schedule-${Date.now()}`,
      date,
      outfitId,
      outfitName,
      items,
      occasion,
      notes,
      reminded: false
    };

    setScheduledOutfits(prev => [...prev, newSchedule]);
    return newSchedule;
  };

  const updateScheduledOutfit = (id: string, updates: Partial<ScheduledOutfit>) => {
    setScheduledOutfits(prev =>
      prev.map(outfit =>
        outfit.id === id ? { ...outfit, ...updates } : outfit
      )
    );
  };

  const deleteScheduledOutfit = (id: string) => {
    setScheduledOutfits(prev => prev.filter(outfit => outfit.id !== id));
  };

  const getOutfitsForDate = (date: Date) => {
    return scheduledOutfits.filter(outfit =>
      isSameDay(new Date(outfit.date), date)
    );
  };

  const getOutfitsForWeek = (date: Date) => {
    const start = startOfWeek(date);
    const end = endOfWeek(date);
    
    return scheduledOutfits.filter(outfit => {
      const outfitDate = new Date(outfit.date);
      return outfitDate >= start && outfitDate <= end;
    });
  };

  const getUpcomingOutfits = (days: number = 7) => {
    const today = new Date();
    const futureDate = addDays(today, days);
    
    return scheduledOutfits
      .filter(outfit => {
        const outfitDate = new Date(outfit.date);
        return outfitDate >= today && outfitDate <= futureDate;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getTodaysOutfit = () => {
    return getOutfitsForDate(new Date())[0] || null;
  };

  return {
    scheduledOutfits,
    scheduleOutfit,
    updateScheduledOutfit,
    deleteScheduledOutfit,
    getOutfitsForDate,
    getOutfitsForWeek,
    getUpcomingOutfits,
    getTodaysOutfit
  };
};
