import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Heart, MessageCircle, UserPlus, ShoppingBag, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

interface Activity {
  id: string;
  type: string;
  user: {
    full_name: string;
    avatar_url: string;
  };
  created_at: string;
  details: any;
}

export const ActivityFeed = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get activities from user_activity table
      const { data } = await supabase
        .from("user_activity")
        .select(`
          id,
          activity_type,
          activity_data,
          created_at,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `)
        .order("created_at", { ascending: false })
        .limit(20);

      if (data) {
        setActivities(
          data.map((a: any) => ({
            id: a.id,
            type: a.activity_type,
            user: a.profiles,
            created_at: a.created_at,
            details: a.activity_data,
          }))
        );
      }
    } catch (error) {
      console.error("Error loading activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "post_like":
        return <Heart className="h-4 w-4 text-red-500" />;
      case "post_comment":
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case "new_follower":
        return <UserPlus className="h-4 w-4 text-green-500" />;
      case "purchase":
        return <ShoppingBag className="h-4 w-4 text-purple-500" />;
      case "ai_suggestion":
        return <Sparkles className="h-4 w-4 text-yellow-500" />;
      default:
        return <Sparkles className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityMessage = (activity: Activity) => {
    switch (activity.type) {
      case "post_like":
        return "liked your post";
      case "post_comment":
        return "commented on your post";
      case "new_follower":
        return "started following you";
      case "purchase":
        return "purchased an item";
      case "ai_suggestion":
        return "received AI outfit suggestion";
      case "outfit_created":
        return "created a new outfit";
      case "wardrobe_item_added":
        return "added a new item to wardrobe";
      default:
        return "performed an action";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading activities...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No recent activities
            </p>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={activity.user?.avatar_url} />
                      <AvatarFallback>
                        {activity.user?.full_name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1 border-2 border-background">
                      {getActivityIcon(activity.type)}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm">
                        <span className="font-semibold">
                          {activity.user?.full_name || "User"}
                        </span>{" "}
                        <span className="text-muted-foreground">
                          {getActivityMessage(activity)}
                        </span>
                      </p>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {formatDistanceToNow(new Date(activity.created_at), {
                          addSuffix: true,
                        })}
                      </Badge>
                    </div>

                    {activity.details?.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {activity.details.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
