interface CalendarEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  description?: string;
  type: 'work' | 'social' | 'formal' | 'casual' | 'sport' | 'date' | 'meeting' | 'other';
  dressCode?: 'casual' | 'business-casual' | 'business-formal' | 'formal' | 'black-tie' | 'cocktail';
}

interface OutfitRecommendation {
  occasion: string;
  formalityLevel: number; // 1-10 scale
  suggestedStyles: string[];
  requiredItems: string[];
  colorsToAvoid?: string[];
  colorsToPrefer?: string[];
  notes?: string;
}

class CalendarService {
  async getTodaysEvents(): Promise<CalendarEvent[]> {
    try {
      // Mock calendar events for now
      const today = new Date();
      const mockEvents: CalendarEvent[] = [
        {
          id: '1',
          title: 'Team Meeting',
          startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0),
          endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 30),
          type: 'work',
          dressCode: 'business-casual',
          description: 'Weekly team sync'
        },
        {
          id: '2',
          title: 'Lunch with Sarah',
          startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 30),
          endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0),
          type: 'social',
          dressCode: 'casual',
          location: 'Downtown Restaurant'
        }
      ];

      // Randomly show events or empty day
      return Math.random() > 0.3 ? mockEvents : [];

      // Real implementation would integrate with:
      // - Google Calendar API
      // - Outlook API
      // - Apple Calendar
      // - Manual user input
      
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      return [];
    }
  }

  async getUpcomingEvents(days: number = 7): Promise<CalendarEvent[]> {
    try {
      const events: CalendarEvent[] = [];
      const today = new Date();
      
      for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        // Mock some upcoming events
        if (Math.random() > 0.6) {
          events.push({
            id: `upcoming-${i}`,
            title: ['Client Meeting', 'Dinner Party', 'Conference', 'Wedding', 'Job Interview'][Math.floor(Math.random() * 5)],
            startTime: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 9 + Math.floor(Math.random() * 10), 0),
            endTime: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 11 + Math.floor(Math.random() * 8), 0),
            type: ['work', 'social', 'formal'][Math.floor(Math.random() * 3)] as CalendarEvent['type'],
            dressCode: ['casual', 'business-casual', 'formal'][Math.floor(Math.random() * 3)] as CalendarEvent['dressCode']
          });
        }
      }
      
      return events;
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      return [];
    }
  }

  getOutfitRecommendationsForEvents(events: CalendarEvent[]): OutfitRecommendation[] {
    return events.map(event => this.getOutfitRecommendationForEvent(event));
  }

  getOutfitRecommendationForEvent(event: CalendarEvent): OutfitRecommendation {
    const recommendations: { [key: string]: OutfitRecommendation } = {
      work: {
        occasion: 'Work/Professional',
        formalityLevel: 7,
        suggestedStyles: ['business casual', 'professional', 'smart casual'],
        requiredItems: ['blazer', 'dress shirt', 'dress pants', 'professional shoes'],
        colorsToPrefer: ['navy', 'charcoal', 'white', 'light blue'],
        colorsToAvoid: ['neon colors', 'overly bright patterns'],
        notes: 'Professional appearance for workplace'
      },
      social: {
        occasion: 'Social Event',
        formalityLevel: 4,
        suggestedStyles: ['casual chic', 'smart casual', 'trendy'],
        requiredItems: ['comfortable yet stylish pieces'],
        colorsToPrefer: ['versatile colors', 'personal favorites'],
        notes: 'Comfortable and stylish for social interaction'
      },
      formal: {
        occasion: 'Formal Event',
        formalityLevel: 9,
        suggestedStyles: ['formal', 'elegant', 'sophisticated'],
        requiredItems: ['formal dress', 'suit', 'dress shoes', 'formal accessories'],
        colorsToPrefer: ['black', 'navy', 'burgundy', 'emerald'],
        colorsToAvoid: ['casual colors', 'overly bright'],
        notes: 'Elegant and sophisticated for formal occasions'
      },
      casual: {
        occasion: 'Casual',
        formalityLevel: 2,
        suggestedStyles: ['casual', 'comfortable', 'relaxed'],
        requiredItems: ['comfortable clothing', 'casual shoes'],
        colorsToPrefer: ['any preferred colors'],
        notes: 'Comfortable and relaxed'
      },
      sport: {
        occasion: 'Athletic/Sport',
        formalityLevel: 1,
        suggestedStyles: ['athletic', 'sporty', 'active'],
        requiredItems: ['athletic wear', 'sports shoes', 'moisture-wicking fabrics'],
        colorsToPrefer: ['bright colors', 'performance colors'],
        notes: 'Performance-focused athletic wear'
      },
      date: {
        occasion: 'Date/Romantic',
        formalityLevel: 6,
        suggestedStyles: ['romantic', 'attractive', 'confident'],
        requiredItems: ['flattering pieces', 'nice shoes', 'subtle accessories'],
        colorsToPrefer: ['flattering colors', 'romantic tones'],
        notes: 'Attractive and confident for romantic occasions'
      },
      meeting: {
        occasion: 'Meeting',
        formalityLevel: 8,
        suggestedStyles: ['professional', 'authoritative', 'polished'],
        requiredItems: ['suit', 'professional attire', 'polished shoes'],
        colorsToPrefer: ['professional colors', 'navy', 'charcoal'],
        notes: 'Polished and professional for important meetings'
      }
    };

    const baseRecommendation = recommendations[event.type] || recommendations.casual;

    // Adjust based on dress code if specified
    if (event.dressCode) {
      switch (event.dressCode) {
        case 'black-tie':
          return {
            ...baseRecommendation,
            formalityLevel: 10,
            requiredItems: ['tuxedo', 'evening gown', 'formal accessories'],
            colorsToPrefer: ['black', 'white'],
            notes: 'Black-tie formal attire required'
          };
        case 'cocktail':
          return {
            ...baseRecommendation,
            formalityLevel: 8,
            requiredItems: ['cocktail dress', 'suit', 'elegant accessories'],
            colorsToPrefer: ['elegant colors', 'jewel tones'],
            notes: 'Cocktail attire - elegant but not black-tie'
          };
        case 'business-formal':
          return {
            ...baseRecommendation,
            formalityLevel: 9,
            requiredItems: ['business suit', 'formal shirt', 'dress shoes'],
            colorsToPrefer: ['navy', 'charcoal', 'black'],
            notes: 'Formal business attire'
          };
      }
    }

    return baseRecommendation;
  }

  getDayScheduleSummary(events: CalendarEvent[]): string {
    if (events.length === 0) {
      return "You have a free day! Perfect for casual, comfortable outfits.";
    }

    const maxFormality = Math.max(...events.map(e => this.getOutfitRecommendationForEvent(e).formalityLevel));
    const eventTypes = [...new Set(events.map(e => e.type))];
    
    if (maxFormality >= 8) {
      return `You have formal events today (${eventTypes.join(', ')}). Consider professional/formal attire.`;
    } else if (maxFormality >= 5) {
      return `You have semi-formal activities (${eventTypes.join(', ')}). Smart casual would work well.`;
    } else {
      return `Your day includes casual activities (${eventTypes.join(', ')}). Comfortable, casual outfits are perfect.`;
    }
  }

  getTransitionRecommendation(events: CalendarEvent[]): string | null {
    if (events.length < 2) return null;

    const formalityLevels = events.map(e => this.getOutfitRecommendationForEvent(e).formalityLevel);
    const maxDiff = Math.max(...formalityLevels) - Math.min(...formalityLevels);

    if (maxDiff > 4) {
      return "You have events with very different dress codes today. Consider layered pieces that can be adjusted, or plan an outfit change.";
    } else if (maxDiff > 2) {
      return "Your events have moderately different formality levels. Versatile pieces that can dress up or down would be ideal.";
    }

    return null;
  }
}

export const calendarService = new CalendarService();
export type { CalendarEvent, OutfitRecommendation };