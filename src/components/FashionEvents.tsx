import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar, MapPin, Users, Clock, 
  Video, Star, Ticket, ExternalLink,
  ChevronRight, Bell, Heart
} from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  type: 'virtual' | 'physical' | 'hybrid';
  date: string;
  time: string;
  location: string;
  host: string;
  hostAvatar: string;
  attendees: number;
  maxAttendees?: number;
  price: number;
  featured: boolean;
  category: 'workshop' | 'fashion-show' | 'meetup' | 'webinar';
  imageUrl: string;
}

export const FashionEvents = () => {
  const { toast } = useToast();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'virtual' | 'physical'>('all');

  const events: Event[] = [
    {
      id: '1',
      title: 'Sustainable Fashion Workshop',
      description: 'Learn how to build an eco-friendly wardrobe with expert stylist Sarah Chen',
      type: 'virtual',
      date: '2025-07-15',
      time: '18:00 - 20:00',
      location: 'Zoom',
      host: 'Sarah Chen',
      hostAvatar: '/placeholder.svg',
      attendees: 145,
      maxAttendees: 200,
      price: 0,
      featured: true,
      category: 'workshop',
      imageUrl: '/placeholder.svg'
    },
    {
      id: '2',
      title: 'Summer Fashion Week 2025',
      description: 'Exclusive runway show featuring emerging designers and latest trends',
      type: 'physical',
      date: '2025-08-20',
      time: '19:00 - 22:00',
      location: 'NYC Fashion District',
      host: 'Fashion Forward',
      hostAvatar: '/placeholder.svg',
      attendees: 580,
      maxAttendees: 1000,
      price: 75,
      featured: true,
      category: 'fashion-show',
      imageUrl: '/placeholder.svg'
    },
    {
      id: '3',
      title: 'Style Influencer Meetup',
      description: 'Network with fashion influencers and content creators in your area',
      type: 'physical',
      date: '2025-07-28',
      time: '14:00 - 17:00',
      location: 'Los Angeles, CA',
      host: 'StyleConnect',
      hostAvatar: '/placeholder.svg',
      attendees: 67,
      maxAttendees: 100,
      price: 25,
      featured: false,
      category: 'meetup',
      imageUrl: '/placeholder.svg'
    },
    {
      id: '4',
      title: 'Personal Styling Masterclass',
      description: 'Discover your personal style and learn professional styling techniques',
      type: 'virtual',
      date: '2025-07-22',
      time: '16:00 - 18:30',
      location: 'Google Meet',
      host: 'Emma Martinez',
      hostAvatar: '/placeholder.svg',
      attendees: 89,
      maxAttendees: 150,
      price: 49,
      featured: false,
      category: 'webinar',
      imageUrl: '/placeholder.svg'
    }
  ];

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    if (filter === 'virtual') return event.type === 'virtual';
    if (filter === 'physical') return event.type === 'physical';
    return true;
  });

  const handleRegister = (eventId: string) => {
    toast({
      title: 'Registration Successful!',
      description: 'Check your email for event details and confirmation.'
    });
  };

  const getTypeIcon = (type: Event['type']) => {
    if (type === 'virtual') return <Video className="h-4 w-4" />;
    if (type === 'physical') return <MapPin className="h-4 w-4" />;
    return <Calendar className="h-4 w-4" />;
  };

  const getTypeColor = (type: Event['type']) => {
    const colors = {
      virtual: 'bg-blue-500',
      physical: 'bg-green-500',
      hybrid: 'bg-purple-500'
    };
    return colors[type];
  };

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
            {events.filter(e => e.featured).map((event) => (
              <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-muted relative">
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="object-cover w-full h-full"
                  />
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
                      <AvatarImage src={event.hostAvatar} />
                      <AvatarFallback>{event.host[0]}</AvatarFallback>
                    </Avatar>
                    <div className="text-sm">
                      <p className="font-medium">{event.host}</p>
                      <p className="text-muted-foreground">Host</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(event.type)}
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{event.attendees} attending</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <p className="text-2xl font-bold">
                        {event.price === 0 ? 'Free' : `$${event.price}`}
                      </p>
                      {event.maxAttendees && (
                        <p className="text-xs text-muted-foreground">
                          {event.maxAttendees - event.attendees} spots left
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
                      {new Date(event.date).getDate()}
                    </span>
                    <span className="text-sm">
                      {new Date(event.date).toLocaleString('default', { month: 'short' })}
                    </span>
                  </div>

                  {/* Event Details */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-lg font-semibold">{event.title}</h4>
                          <Badge variant="outline" className="gap-1">
                            {getTypeIcon(event.type)}
                            {event.type}
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
                        {event.time}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {event.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {event.attendees} attending
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
