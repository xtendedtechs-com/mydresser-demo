import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, UserMinus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  full_name: string;
  avatar_url: string;
  bio?: string;
  isFollowing?: boolean;
}

export const UserConnectionsCard = () => {
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [suggested, setSuggested] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get followers
      const { data: followersData } = await supabase
        .from("social_follows" as any)
        .select(`
          follower_id,
          profiles:follower_id (
            id,
            user_id,
            full_name,
            avatar_url,
            bio
          )
        `)
        .eq("following_id", user.id);

      // Get following
      const { data: followingData } = await supabase
        .from("social_follows" as any)
        .select(`
          following_id,
          profiles:following_id (
            id,
            user_id,
            full_name,
            avatar_url,
            bio
          )
        `)
        .eq("follower_id", user.id);

      // Get suggested users (public profiles not already followed)
      const { data: suggestedData } = await supabase
        .from("profiles")
        .select("id, user_id, full_name, avatar_url, bio")
        .eq("is_profile_public", true)
        .neq("user_id", user.id)
        .limit(5);

      if (followersData) {
        setFollowers(
          followersData.map((f: any) => ({
            id: f.profiles.user_id,
            full_name: f.profiles.full_name,
            avatar_url: f.profiles.avatar_url,
            bio: f.profiles.bio,
          }))
        );
      }

      if (followingData) {
        setFollowing(
          followingData.map((f: any) => ({
            id: f.profiles.user_id,
            full_name: f.profiles.full_name,
            avatar_url: f.profiles.avatar_url,
            bio: f.profiles.bio,
          }))
        );
      }

      if (suggestedData) {
        const followingIds = followingData?.map((f: any) => f.following_id) || [];
        setSuggested(
          suggestedData
            .filter((u: any) => !followingIds.includes(u.user_id))
            .map((u: any) => ({
              id: u.user_id,
              full_name: u.full_name,
              avatar_url: u.avatar_url,
              bio: u.bio,
              isFollowing: false,
            }))
        );
      }
    } catch (error) {
      console.error("Error loading connections:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("social_follows" as any).insert({
        follower_id: user.id,
        following_id: userId,
      });

      if (error) throw error;

      toast({
        title: "Following",
        description: "You are now following this user",
      });

      setSuggested((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isFollowing: true } : u))
      );
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to follow user",
        variant: "destructive",
      });
    }
  };

  const handleUnfollow = async (userId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("social_follows" as any)
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", userId);

      if (error) throw error;

      toast({
        title: "Unfollowed",
        description: "You have unfollowed this user",
      });

      setFollowing((prev) => prev.filter((u) => u.id !== userId));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unfollow user",
        variant: "destructive",
      });
    }
  };

  const UserCard = ({
    user,
    showFollowButton,
    showUnfollowButton,
  }: {
    user: User;
    showFollowButton?: boolean;
    showUnfollowButton?: boolean;
  }) => (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Avatar>
          <AvatarImage src={user.avatar_url} />
          <AvatarFallback>{user.full_name?.charAt(0) || "U"}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{user.full_name}</p>
          {user.bio && (
            <p className="text-xs text-muted-foreground truncate">{user.bio}</p>
          )}
        </div>
      </div>

      {showFollowButton && !user.isFollowing && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleFollow(user.id)}
        >
          <UserPlus className="h-4 w-4 mr-1" />
          Follow
        </Button>
      )}

      {showUnfollowButton && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleUnfollow(user.id)}
        >
          <UserMinus className="h-4 w-4 mr-1" />
          Unfollow
        </Button>
      )}
    </div>
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Connections</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Connections</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="followers" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="followers">
              Followers ({followers.length})
            </TabsTrigger>
            <TabsTrigger value="following">
              Following ({following.length})
            </TabsTrigger>
            <TabsTrigger value="suggested">Suggested</TabsTrigger>
          </TabsList>

          <TabsContent value="followers" className="space-y-2 mt-4">
            {followers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No followers yet
              </p>
            ) : (
              followers.map((user) => (
                <UserCard key={user.id} user={user} />
              ))
            )}
          </TabsContent>

          <TabsContent value="following" className="space-y-2 mt-4">
            {following.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Not following anyone yet
              </p>
            ) : (
              following.map((user) => (
                <UserCard key={user.id} user={user} showUnfollowButton />
              ))
            )}
          </TabsContent>

          <TabsContent value="suggested" className="space-y-2 mt-4">
            {suggested.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No suggestions available
              </p>
            ) : (
              suggested.map((user) => (
                <UserCard key={user.id} user={user} showFollowButton />
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
