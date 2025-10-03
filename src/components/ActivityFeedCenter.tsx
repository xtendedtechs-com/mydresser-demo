import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Clock, Heart, MessageSquare, ShoppingBag, Users, TrendingUp, 
  Calendar, CheckCircle2, Star, Gift, Zap
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Activity {
  id: string;
  type: 'social' | 'shopping' | 'wardrobe' | 'achievement' | 'trend';
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
  actionUrl?: string;
  metadata?: any;
}

const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'social',
    title: 'New Follower',
    description: 'Sarah Johnson started following you',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    read: false,
    priority: 'medium',
    actionUrl: '/social'
  },
  {
    id: '2',
    type: 'shopping',
    title: 'Price Drop Alert',
    description: 'Navy Blazer you saved is now 30% off ($140)',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    read: false,
    priority: 'high',
    actionUrl: '/market'
  },
  {
    id: '3',
    type: 'wardrobe',
    title: 'Daily Outfit Ready',
    description: 'Your AI-generated outfit for today is available',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    read: true,
    priority: 'medium',
    actionUrl: '/outfit-generator'
  },
  {
    id: '4',
    type: 'achievement',
    title: 'Achievement Unlocked!',
    description: 'Style Icon - Reached 100 style score',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    read: false,
    priority: 'high',
    actionUrl: '/challenges'
  },
  {
    id: '5',
    type: 'trend',
    title: 'New Trend Alert',
    description: 'Oversized Blazers are trending in your style category',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    read: true,
    priority: 'low',
    actionUrl: '/advanced-ai'
  },
  {
    id: '6',
    type: 'social',
    title: 'Post Reaction',
    description: 'Michael liked your outfit post',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    read: true,
    priority: 'low',
    actionUrl: '/social'
  },
];

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'social': return Users;
    case 'shopping': return ShoppingBag;
    case 'wardrobe': return Heart;
    case 'achievement': return Star;
    case 'trend': return TrendingUp;
    default: return Clock;
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case 'social': return 'bg-blue-500/10 text-blue-500';
    case 'shopping': return 'bg-green-500/10 text-green-500';
    case 'wardrobe': return 'bg-purple-500/10 text-purple-500';
    case 'achievement': return 'bg-amber-500/10 text-amber-500';
    case 'trend': return 'bg-pink-500/10 text-pink-500';
    default: return 'bg-muted text-muted-foreground';
  }
};

export function ActivityFeedCenter() {
  const [activities, setActivities] = useState<Activity[]>(mockActivities);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredActivities = filter === 'unread' 
    ? activities.filter(a => !a.read)
    : activities;

  const handleMarkAsRead = (id: string) => {
    setActivities(activities.map(a => 
      a.id === id ? { ...a, read: true } : a
    ));
  };

  const handleMarkAllRead = () => {
    setActivities(activities.map(a => ({ ...a, read: true })));
  };

  const unreadCount = activities.filter(a => !a.read).length;

  const groupedActivities = {
    today: filteredActivities.filter(a => 
      a.timestamp > new Date(Date.now() - 1000 * 60 * 60 * 24)
    ),
    yesterday: filteredActivities.filter(a => 
      a.timestamp > new Date(Date.now() - 1000 * 60 * 60 * 48) &&
      a.timestamp <= new Date(Date.now() - 1000 * 60 * 60 * 24)
    ),
    older: filteredActivities.filter(a => 
      a.timestamp <= new Date(Date.now() - 1000 * 60 * 60 * 48)
    ),
  };

  const ActivityItem = ({ activity }: { activity: Activity }) => {
    const Icon = getActivityIcon(activity.type);
    const colorClass = getActivityColor(activity.type);

    return (
      <div
        className={`flex gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors ${
          !activity.read ? 'bg-primary/5' : ''
        }`}
      >
        <div className={`mt-1 h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
          <Icon className="h-5 w-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className={`font-medium text-sm ${!activity.read ? 'font-semibold' : ''}`}>
                {activity.title}
              </h4>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {activity.description}
              </p>
            </div>
            {!activity.read && (
              <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
            )}
          </div>
          
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
            </span>
            {activity.priority === 'high' && (
              <Badge variant="destructive" className="text-xs">High Priority</Badge>
            )}
            {!activity.read && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleMarkAsRead(activity.id)}
                className="ml-auto text-xs h-6"
              >
                Mark as read
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Activity Feed
                {unreadCount > 0 && (
                  <Badge variant="default">{unreadCount} new</Badge>
                )}
              </CardTitle>
              <CardDescription>Stay updated with your latest activity</CardDescription>
            </div>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Mark all read
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all">All Activity</TabsTrigger>
              <TabsTrigger value="unread">
                Unread {unreadCount > 0 && `(${unreadCount})`}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6 space-y-6">
              {groupedActivities.today.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground px-3">Today</h3>
                  {groupedActivities.today.map(activity => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
                </div>
              )}

              {groupedActivities.yesterday.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground px-3">Yesterday</h3>
                  {groupedActivities.yesterday.map(activity => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
                </div>
              )}

              {groupedActivities.older.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground px-3">Older</h3>
                  {groupedActivities.older.map(activity => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
                </div>
              )}

              {filteredActivities.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No activity yet</p>
                  <p className="text-sm">Check back later for updates</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="unread" className="mt-6 space-y-2">
              {filteredActivities.map(activity => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}

              {filteredActivities.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>You're all caught up!</p>
                  <p className="text-sm">No unread notifications</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
          <CardDescription>Your activity summary</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-muted-foreground">Social</span>
              </div>
              <p className="text-2xl font-bold">
                {activities.filter(a => a.type === 'social').length}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-2 mb-1">
                <ShoppingBag className="h-4 w-4 text-green-500" />
                <span className="text-sm text-muted-foreground">Shopping</span>
              </div>
              <p className="text-2xl font-bold">
                {activities.filter(a => a.type === 'shopping').length}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <div className="flex items-center gap-2 mb-1">
                <Heart className="h-4 w-4 text-purple-500" />
                <span className="text-sm text-muted-foreground">Wardrobe</span>
              </div>
              <p className="text-2xl font-bold">
                {activities.filter(a => a.type === 'wardrobe').length}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2 mb-1">
                <Star className="h-4 w-4 text-amber-500" />
                <span className="text-sm text-muted-foreground">Achievements</span>
              </div>
              <p className="text-2xl font-bold">
                {activities.filter(a => a.type === 'achievement').length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
