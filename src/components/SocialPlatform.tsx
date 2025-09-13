import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  Camera, 
  Users, 
  TrendingUp, 
  Star,
  UserPlus,
  Search,
  Filter,
  Send,
  MoreHorizontal,
  Award,
  Target,
  Calendar,
  MapPin,
  Palette,
  Shirt,
  Crown,
  Sparkles
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSocial } from "@/hooks/useSocial";
import { useProfile } from "@/hooks/useProfile";
import ReactionButton from "@/components/ReactionButton";

interface SocialPost {
  id: string;
  user_id: string;
  user: {
    id: string;
    display_name: string;
    avatar_url?: string;
    verified?: boolean;
    style_badge?: string;
  };
  content: string;
  images?: string[];
  outfit_id?: string;
  outfit?: {
    id: string;
    name: string;
    items: Array<{
      id: string;
      name: string;
      brand?: string;
      category: string;
    }>;
  };
  tags: string[];
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  location?: string;
  occasion?: string;
  weather_info?: {
    temperature: number;
    condition: string;
  };
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  start_date: string;
  end_date: string;
  participants_count: number;
  prize?: string;
  hashtag: string;
  type: 'style' | 'sustainability' | 'budget' | 'seasonal';
  difficulty: 'easy' | 'medium' | 'hard';
}

interface StyleInfluencer {
  id: string;
  display_name: string;
  avatar_url?: string;
  bio: string;
  followers_count: number;
  style_categories: string[];
  verified: boolean;
  engagement_rate: number;
  recent_posts: SocialPost[];
}

export const SocialPlatform = () => {
  const [activeTab, setActiveTab] = useState("feed");
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [influencers, setInfluencers] = useState<StyleInfluencer[]>([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  const { toast } = useToast();
  const { addReaction, removeReaction } = useSocial();
  const { profile } = useProfile();

  useEffect(() => {
    loadFeedData();
    loadChallenges();
    loadInfluencers();
  }, []);

  const loadFeedData = () => {
    // Mock data for social feed
    const mockPosts: SocialPost[] = [
      {
        id: "1",
        user_id: "user1",
        user: {
          id: "user1",
          display_name: "Emma Style",
          avatar_url: "/api/placeholder/40/40",
          verified: true,
          style_badge: "Minimalist Queen"
        },
        content: "Loving this cozy autumn look! Perfect for those chilly mornings ☕️ #AutumnVibes #LayeredLook",
        images: ["/api/placeholder/400/500"],
        outfit_id: "outfit1",
        outfit: {
          id: "outfit1",
          name: "Cozy Autumn Layers",
          items: [
            { id: "1", name: "Wool Sweater", brand: "COS", category: "tops" },
            { id: "2", name: "High-waist Jeans", brand: "Levi's", category: "bottoms" },
            { id: "3", name: "Ankle Boots", brand: "Dr. Martens", category: "shoes" }
          ]
        },
        tags: ["autumn", "cozy", "layered", "casual"],
        likes_count: 247,
        comments_count: 18,
        shares_count: 12,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        location: "New York, NY",
        occasion: "casual",
        weather_info: { temperature: 15, condition: "cloudy" }
      },
      {
        id: "2",
        user_id: "user2",
        user: {
          id: "user2",
          display_name: "Alex Fashion",
          avatar_url: "/api/placeholder/40/40",
          style_badge: "Streetwear Expert"
        },
        content: "Street style inspiration from today's shoot 📸 Sometimes the best outfits come together spontaneously!",
        images: ["/api/placeholder/400/600", "/api/placeholder/400/600"],
        tags: ["streetwear", "photoshoot", "urban", "creative"],
        likes_count: 189,
        comments_count: 24,
        shares_count: 8,
        created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        location: "Los Angeles, CA"
      }
    ];
    setPosts(mockPosts);
  };

  const loadChallenges = () => {
    const mockChallenges: Challenge[] = [
      {
        id: "challenge1",
        title: "30-Day Sustainability Challenge",
        description: "Style different outfits using only items you already own. No new purchases!",
        requirements: ["Use existing wardrobe items only", "Share daily outfit", "Tag with #SustainableStyle"],
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        participants_count: 1247,
        prize: "Sustainable fashion brand voucher $500",
        hashtag: "#SustainableStyle",
        type: "sustainability",
        difficulty: "medium"
      },
      {
        id: "challenge2",
        title: "Budget Remix Challenge",
        description: "Create 10 different looks using only 5 pieces from your wardrobe",
        requirements: ["Select 5 base pieces", "Create 10 unique outfits", "Document the process"],
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        participants_count: 892,
        hashtag: "#BudgetRemix",
        type: "budget",
        difficulty: "easy"
      },
      {
        id: "challenge3",
        title: "Color Week: Monochrome Mastery",
        description: "Master the art of monochrome dressing with different textures and tones",
        requirements: ["One color per day", "Mix textures and tones", "Show versatility"],
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        participants_count: 567,
        hashtag: "#MonochromeMastery",
        type: "style",
        difficulty: "hard"
      }
    ];
    setChallenges(mockChallenges);
  };

  const loadInfluencers = () => {
    const mockInfluencers: StyleInfluencer[] = [
      {
        id: "inf1",
        display_name: "Sophie Minimal",
        avatar_url: "/api/placeholder/60/60",
        bio: "Minimalist wardrobe advocate • Sustainable fashion • Less is more philosophy",
        followers_count: 45200,
        style_categories: ["minimalist", "sustainable", "capsule wardrobe"],
        verified: true,
        engagement_rate: 8.5,
        recent_posts: []
      },
      {
        id: "inf2",
        display_name: "Marcus Street",
        avatar_url: "/api/placeholder/60/60",
        bio: "Street style photographer • Urban fashion • Trend forecasting",
        followers_count: 67800,
        style_categories: ["streetwear", "urban", "photography"],
        verified: true,
        engagement_rate: 7.2,
        recent_posts: []
      }
    ];
    setInfluencers(mockInfluencers);
  };

  const handleLikePost = async (postId: string) => {
    try {
      await addReaction("post", postId, "like");
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, likes_count: post.likes_count + 1 }
          : post
      ));
      toast({ title: "Post liked!" });
    } catch (error) {
      toast({ title: "Failed to like post", variant: "destructive" });
    }
  };

  const handleSharePost = async (post: SocialPost) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Check out ${post.user.display_name}'s style post`,
          text: post.content,
          url: window.location.href
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      await navigator.clipboard.writeText(`Check out this style post: ${post.content}`);
      toast({ title: "Post link copied to clipboard!" });
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) {
      toast({ title: "Please add some content to your post", variant: "destructive" });
      return;
    }

    const newPost: SocialPost = {
      id: `post-${Date.now()}`,
      user_id: profile?.id || "current-user",
      user: {
        id: profile?.id || "current-user",
        display_name: profile?.full_name || "You",
        avatar_url: profile?.avatar_url,
        style_badge: "Style Explorer"
      },
      content: newPostContent,
      tags: selectedTags,
      likes_count: 0,
      comments_count: 0,
      shares_count: 0,
      created_at: new Date().toISOString()
    };

    setPosts([newPost, ...posts]);
    setNewPostContent("");
    setSelectedTags([]);
    
    toast({ title: "Post shared successfully!" });
  };

  const handleJoinChallenge = (challengeId: string) => {
    setChallenges(challenges.map(challenge =>
      challenge.id === challengeId
        ? { ...challenge, participants_count: challenge.participants_count + 1 }
        : challenge
    ));
    toast({ title: "Successfully joined challenge!" });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'style': return <Palette className="w-4 h-4" />;
      case 'sustainability': return <Target className="w-4 h-4" />;
      case 'budget': return <Award className="w-4 h-4" />;
      case 'seasonal': return <Calendar className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Style Community</h1>
          <p className="text-muted-foreground">Connect, share, and get inspired</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Camera className="w-4 h-4" />
              Share Style
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Share Your Style</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="What's your style story today?"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="flex flex-wrap gap-2">
                {["#OOTD", "#Minimalist", "#Streetwear", "#Sustainable", "#Vintage", "#Casual"].map(tag => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedTags(prev => 
                        prev.includes(tag) 
                          ? prev.filter(t => t !== tag)
                          : [...prev, tag]
                      );
                    }}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              <Button onClick={handleCreatePost} className="w-full gap-2">
                <Send className="w-4 h-4" />
                Share Post
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="feed">Feed</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="influencers">Discover</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* Feed Tab */}
        <TabsContent value="feed" className="space-y-6">
          {posts.map((post) => (
            <Card key={post.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={post.user.avatar_url} />
                      <AvatarFallback>{post.user.display_name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{post.user.display_name}</h4>
                        {post.user.verified && (
                          <Badge variant="secondary" className="text-xs gap-1">
                            <Crown className="w-3 h-3" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      {post.user.style_badge && (
                        <p className="text-xs text-muted-foreground">{post.user.style_badge}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(post.created_at).toLocaleString()}
                        {post.location && (
                          <span className="ml-2 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {post.location}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p>{post.content}</p>

                {post.images && (
                  <div className="grid grid-cols-1 gap-2">
                    {post.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Post image ${index + 1}`}
                        className="rounded-lg object-cover w-full h-64"
                      />
                    ))}
                  </div>
                )}

                {post.outfit && (
                  <Card className="bg-muted/50">
                    <CardContent className="pt-4">
                      <h5 className="font-semibold mb-2 flex items-center gap-2">
                        <Shirt className="w-4 h-4" />
                        {post.outfit.name}
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {post.outfit.items.map((item) => (
                          <Badge key={item.id} variant="outline" className="text-xs">
                            {item.brand ? `${item.brand} ${item.name}` : item.name}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLikePost(post.id)}
                      className="gap-2 text-muted-foreground hover:text-red-500"
                    >
                      <Heart className="w-4 h-4" />
                      {post.likes_count}
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                      <MessageCircle className="w-4 h-4" />
                      {post.comments_count}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleSharePost(post)}
                      className="gap-2 text-muted-foreground"
                    >
                      <Share2 className="w-4 h-4" />
                      {post.shares_count}
                    </Button>
                  </div>
                  <Button variant="ghost" size="icon" className="text-muted-foreground">
                    <Bookmark className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Challenges Tab */}
        <TabsContent value="challenges" className="space-y-6">
          <div className="grid gap-6">
            {challenges.map((challenge) => (
              <Card key={challenge.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(challenge.type)}
                        <Badge variant="outline">{challenge.type}</Badge>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${getDifficultyColor(challenge.difficulty)}`} />
                    </div>
                    <Badge variant="secondary" className="gap-1">
                      <Users className="w-3 h-3" />
                      {challenge.participants_count}
                    </Badge>
                  </div>
                  <div>
                    <CardTitle className="text-xl">{challenge.title}</CardTitle>
                    <p className="text-muted-foreground mt-2">{challenge.description}</p>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <h5 className="font-semibold mb-2">Requirements:</h5>
                    <ul className="space-y-1">
                      {challenge.requirements.map((req, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {challenge.prize && (
                    <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-yellow-600" />
                        <span className="font-semibold text-sm">Prize: {challenge.prize}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      <span className="font-semibold text-primary">{challenge.hashtag}</span>
                    </div>
                    <Button onClick={() => handleJoinChallenge(challenge.id)} className="gap-2">
                      <UserPlus className="w-4 h-4" />
                      Join Challenge
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Influencers/Discover Tab */}
        <TabsContent value="influencers" className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search style influencers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid gap-4">
              {influencers.map((influencer) => (
                <Card key={influencer.id} className="overflow-hidden">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={influencer.avatar_url} />
                        <AvatarFallback>{influencer.display_name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 space-y-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-lg">{influencer.display_name}</h4>
                            {influencer.verified && (
                              <Badge variant="secondary" className="gap-1">
                                <Crown className="w-3 h-3" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{influencer.bio}</p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {influencer.style_categories.map((category) => (
                            <Badge key={category} variant="outline" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {influencer.followers_count.toLocaleString()} followers
                            </span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-4 h-4" />
                              {influencer.engagement_rate}% engagement
                            </span>
                          </div>
                          
                          <Button size="sm" className="gap-2">
                            <UserPlus className="w-4 h-4" />
                            Follow
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Trending Hashtags
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {['#AutumnLayers', '#SustainableFashion', '#MinimalistStyle', '#VintageVibes', '#StreetStyle'].map((hashtag, index) => (
                  <div key={hashtag} className="flex items-center justify-between">
                    <span className="font-semibold text-primary">{hashtag}</span>
                    <Badge variant="secondary">{Math.floor(Math.random() * 10000) + 1000} posts</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Popular Colors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { color: 'Sage Green', posts: 3421 },
                  { color: 'Warm Beige', posts: 2890 },
                  { color: 'Deep Navy', posts: 2567 },
                  { color: 'Rust Orange', posts: 2340 },
                  { color: 'Soft Pink', posts: 2156 }
                ].map((item) => (
                  <div key={item.color} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-green-500" />
                      <span>{item.color}</span>
                    </div>
                    <Badge variant="secondary">{item.posts} posts</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SocialPlatform;