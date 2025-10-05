import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Calendar, MapPin, Users, Clock, 
  Video, Star, Ticket,
  ChevronRight, Bell, Heart
} from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  event_type: 'virtual' | 'physical' | 'hybrid';
  category: 'workshop' | 'fashion-show' | 'meetup' | 'webinar';
  event_date: string;
  event_time: string;
  location: string;
  host_id: string;
  host_name: string;
  attendees_count: number;
  max_attendees: number | null;
  price: number;
  is_featured: boolean;
  image_url: string | null;
}

export const FashionEvents = () => {
  const { toast } = useToast();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'virtual' | 'physical'>('all');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      let query = supabase
        .from('fashion_events')
        .select('*')
        .gte('event_date', new Date().toISOString().split('T')[0])
        .order('event_date', { ascending: true });

      const { data, error } = await query;
      
      if (error) throw error;
      setEvents((data || []) as Event[]);
    } catch (error: any) {
      toast({
        title: "Error loading events",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    if (filter === 'virtual') return event.event_type === 'virtual';
    if (filter === 'physical') return event.event_type === 'physical';
    return true;
  });

  const handleRegister = async (eventId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to register for events",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('event_registrations')
        .insert({ 
          event_id: eventId, 
          user_id: user.id,
          registration_status: 'registered',
          payment_status: 'pending'
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Already Registered",
            description: "You're already registered for this event"
          });
          return;
        }
        throw error;
      }

      toast({
        title: 'Registration Successful!',
        description: 'Check your email for event details and confirmation.'
      });
      loadEvents();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getTypeIcon = (type: Event['event_type']) => {
    if (type === 'virtual') return <Video className="h-4 w-4" />;
    if (type === 'physical') return <MapPin className="h-4 w-4" />;
    return <Calendar className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Fashion Events</h2>
          <p className="text-muted-foreground">Discover and join fashion events near you</p>
        </div>
        <Button>
          <Calendar className="mr-2 h-4 w-4" />
          Create Event
        </Button>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          All Events
        </Button>
        <Button
          variant={filter === 'upcoming' ? 'default' : 'outline'}
          onClick={() => setFilter('upcoming')}
        >
          Upcoming
        </Button>
        <Button
          variant={filter === 'virtual' ? 'default' : 'outline'}
          onClick={() => setFilter('virtual')}
        >
          <Video className="mr-2 h-4 w-4" />
          Virtual
        </Button>
        <Button
          variant={filter === 'physical' ? 'default' : 'outline'}
          onClick={() => setFilter('physical')}
        >
          <MapPin className="mr-2 h-4 w-4" />
          In-Person
        </Button>
      </div>

      {/* Featured Events */}
      {filter === 'all' && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Featured Events</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {events.filter(e => e.is_featured).map((event) => (
              <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-muted relative">
                  {event.image_url && (
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="object-cover w-full h-full"
                    />
                  )}
                  <Badge className="absolute top-4 right-4" variant="secondary">
                    <Star className="mr-1 h-3 w-3" />
                    Featured
                  </Badge>
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="line-clamp-1">{event.title}</CardTitle>
                      <CardDescription className="line-clamp-2 mt-1">
                        {event.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{event.host_name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="text-sm">
                      <p className="font-medium">{event.host_name}</p>
                      <p className="text-muted-foreground">Host</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(event.event_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{event.event_time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(event.event_type)}
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{event.attendees_count} attending</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <p className="text-2xl font-bold">
                        {event.price === 0 ? 'Free' : `$${event.price}`}
                      </p>
                      {event.max_attendees && (
                        <p className="text-xs text-muted-foreground">
                          {event.max_attendees - event.attendees_count} spots left
                        </p>
                      )}
                    </div>
                    <Button onClick={() => handleRegister(event.id)}>
                      <Ticket className="mr-2 h-4 w-4" />
                      Register
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Events */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">All Events</h3>
        <div className="space-y-4">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex gap-6">
                  {/* Date Box */}
                  <div className="flex flex-col items-center justify-center bg-primary text-primary-foreground rounded-lg p-4 min-w-[80px]">
                    <span className="text-2xl font-bold">
                      {new Date(event.event_date).getDate()}
                    </span>
                    <span className="text-sm">
                      {new Date(event.event_date).toLocaleString('default', { month: 'short' })}
                    </span>
                  </div>

                  {/* Event Details */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-lg font-semibold">{event.title}</h4>
                          <Badge variant="outline" className="gap-1">
                            {getTypeIcon(event.event_type)}
                            {event.event_type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {event.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {event.event_time}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {event.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {event.attendees_count} attending
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <p className="text-lg font-bold">
                        {event.price === 0 ? 'Free Event' : `$${event.price}`}
                      </p>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Heart className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Bell className="h-4 w-4" />
                        </Button>
                        <Button size="sm" onClick={() => handleRegister(event.id)}>
                          View Details
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};