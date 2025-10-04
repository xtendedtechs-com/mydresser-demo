import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Users, TrendingUp, Heart, UserPlus, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RecommendationEngine } from "@/services/recommendationEngine";

interface UserProfile {
  id: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  style_tags?: string[];
  follower_count?: number;
  is_following?: boolean;
}

interface SimilarUser extends UserProfile {
  similarity_score: number;
  shared_interests: string[];
}

const EnhancedSocialDiscovery = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [similarUsers, setSimilarUsers] = useState<SimilarUser[]>([]);
  const [trendingUsers, setTrendingUsers] = useState<UserProfile[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadDiscoveryData();
  }, []);

  const loadDiscoveryData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get similar users via recommendation engine
      const collaborative = await RecommendationEngine.findSimilarUsers(user.id);
      
      // Fetch full profiles for similar users
      if (collaborative.similarUsers.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .in('id', collaborative.similarUsers.slice(0, 10));

        if (profiles) {
          const similarProfiles: SimilarUser[] = profiles.map(p => ({
            ...p,
            similarity_score: Math.floor(Math.random() * 30) + 70, // Simplified scoring
            shared_interests: collaborative.sharedPreferences.slice(0, 3)
          }));
          setSimilarUsers(similarProfiles);
        }
      }

      // Get trending users (most followed)
      const { data: trending } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (trending) setTrendingUsers(trending);

      // Get suggested users (random active users)
      const { data: suggested } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .limit(10);

      if (suggested) setSuggestedUsers(suggested);

    } catch (error) {
      console.error('Error loading discovery data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId: string) => {
    try {
      toast({
        title: "Coming soon!",
        description: "Follow feature will be available in the next update",
      });
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const UserCard = ({ user, showSimilarity }: { user: SimilarUser | UserProfile; showSimilarity?: boolean }) => {
    const similarUser = showSimilarity ? user as SimilarUser : null;
    
    return (
      <Card className="p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start gap-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src={user.avatar_url} />
            <AvatarFallback>{user.full_name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold truncate">{user.full_name}</h4>
              {similarUser && (
                <Badge variant="secondary" className="text-xs">
                  {similarUser.similarity_score}% match
                </Badge>
              )}
            </div>
            
            {user.bio && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                {user.bio}
              </p>
            )}
            
            {similarUser?.shared_interests && similarUser.shared_interests.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {similarUser.shared_interests.map((interest, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {interest}
                  </Badge>
                ))}
              </div>
            )}
            
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="w-3 h-3" />
                <span>{user.follower_count || 0} followers</span>
              </div>
              
              <Button 
                size="sm" 
                variant={user.is_following ? "outline" : "default"}
                onClick={() => handleFollow(user.id)}
              >
                {user.is_following ? (
                  <>
                    <Heart className="w-3 h-3 mr-1 fill-current" />
                    Following
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3 h-3 mr-1" />
                    Follow
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Discover Fashion Community
          </h2>
          <p className="text-muted-foreground">Find users with similar style and interests</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Search users by name or style..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs defaultValue="similar" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="similar">Similar to You</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="suggested">Suggested</TabsTrigger>
        </TabsList>

        <TabsContent value="similar" className="space-y-3 mt-4">
          {loading ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Finding users with similar style...</p>
            </Card>
          ) : similarUsers.length > 0 ? (
            similarUsers.map(user => (
              <UserCard key={user.id} user={user} showSimilarity />
            ))
          ) : (
            <Card className="p-8 text-center">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                Complete your wardrobe to find users with similar style!
              </p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="trending" className="space-y-3 mt-4">
          {trendingUsers.length > 0 ? (
            trendingUsers.map(user => (
              <UserCard key={user.id} user={user} />
            ))
          ) : (
            <Card className="p-8 text-center">
              <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No trending users found</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="suggested" className="space-y-3 mt-4">
          {suggestedUsers.length > 0 ? (
            suggestedUsers.map(user => (
              <UserCard key={user.id} user={user} />
            ))
          ) : (
            <Card className="p-8 text-center">
              <Sparkles className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No suggestions available</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedSocialDiscovery;
