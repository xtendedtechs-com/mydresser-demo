import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useMerchantItems } from '@/hooks/useMerchantItems';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, 
  Share2, 
  MapPin, 
  Calendar, 
  Star, 
  ShoppingBag, 
  Users, 
  Award,
  Edit3,
  Grid,
  List
} from 'lucide-react';
import MerchantItemCard from '@/components/MerchantItemCard';

interface MerchantPageData {
  id: string;
  business_name: string;
  business_type: string | null;
  verification_status: string;
  created_at: string;
  user_id: string;
  featured_collections?: string[];
  brand_story?: string;
  specialties?: string[];
  social_links?: {
    instagram?: string;
    website?: string;
    facebook?: string;
  };
  hero_image?: string;
  logo?: string;
}

const MerchantPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile: currentUserProfile } = useProfile();
  const { items, loading: itemsLoading } = useMerchantItems();
  
  const [merchantData, setMerchantData] = useState<MerchantPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeCategory, setActiveCategory] = useState('all');

  // Check if current user is the merchant (for edit access)
  const isOwner = currentUserProfile?.user_id === merchantData?.user_id;

  useEffect(() => {
    if (id) {
      fetchMerchantData(id);
      checkFollowStatus(id);
    }
  }, [id, currentUserProfile]);

  const fetchMerchantData = async (merchantId: string) => {
    try {
      setLoading(true);

      // Fetch merchant profile data
      const { data: profileData, error: profileError } = await supabase
        .from('merchant_profiles')
        .select(`
          id,
          business_name,
          business_type,
          verification_status,
          created_at,
          user_id
        `)
        .eq('user_id', merchantId)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') throw profileError;
      if (!profileData) throw new Error('Merchant not found');

      // Fetch merchant page customization data
      const { data: pageData, error: pageError } = await supabase
        .from('merchant_pages')
        .select('*')
        .eq('merchant_id', merchantId)
        .maybeSingle();

      if (pageError && pageError.code !== 'PGRST116') throw pageError;

      setMerchantData({
        ...profileData,
        featured_collections: pageData?.featured_collections || ['Featured Items'],
        brand_story: pageData?.brand_story || "Welcome to our store! We offer quality fashion items and exceptional service.",
        specialties: pageData?.specialties || ['Fashion', 'Quality', 'Service'],
        social_links: (pageData?.social_links as any) || {},
        hero_image: pageData?.hero_image,
        logo: pageData?.logo
      });
    } catch (error: any) {
      console.error('Error fetching merchant data:', error);
      toast({
        title: "Error",
        description: "Failed to load merchant page",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const checkFollowStatus = async (merchantId: string) => {
    try {
      if (!currentUserProfile?.user_id) return;

      const { data, error } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', currentUserProfile.user_id)
        .eq('following_id', merchantId)
        .single();

      setIsFollowing(!!data);
    } catch (error) {
      // Not following or error - default to false
      setIsFollowing(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUserProfile?.user_id || !merchantData?.user_id) return;

    try {
      if (isFollowing) {
        // Unfollow
        await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', currentUserProfile.user_id)
          .eq('following_id', merchantData.user_id);
        
        setIsFollowing(false);
        toast({
          title: "Unfollowed",
          description: `You are no longer following ${merchantData.business_name}`,
        });
      } else {
        // Follow
        await supabase
          .from('user_follows')
          .insert({
            follower_id: currentUserProfile.user_id,
            following_id: merchantData.user_id
          });
        
        setIsFollowing(true);
        toast({
          title: "Following",
          description: `You are now following ${merchantData.business_name}`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive"
      });
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: merchantData?.business_name,
          text: `Check out ${merchantData?.business_name} on MyDresser`,
          url: window.location.href
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link Copied",
          description: "Merchant page link copied to clipboard",
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Filter merchant items
  const merchantItems = items.filter(item => item.merchant_id === id);
  const categories = Array.from(new Set(merchantItems.map(item => item.category)));
  const filteredItems = activeCategory === 'all' 
    ? merchantItems 
    : merchantItems.filter(item => item.category === activeCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading merchant page...</p>
        </div>
      </div>
    );
  }

  if (!merchantData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Merchant Not Found</h2>
          <p className="text-muted-foreground">This merchant page doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/market')}>
            Browse Market
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary/10 to-secondary/10 border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Profile Avatar/Logo */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 rounded-xl bg-primary/20 flex items-center justify-center border-2 border-primary/30">
                <ShoppingBag className="h-16 w-16 text-primary" />
              </div>
            </div>

            {/* Merchant Info */}
            <div className="flex-1 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div>
                  <h1 className="text-3xl font-bold">{merchantData.business_name}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    {merchantData.verification_status === 'verified' && (
                      <Badge variant="default" className="gap-1">
                        <Award className="h-3 w-3" />
                        Verified Merchant
                      </Badge>
                    )}
                    <Badge variant="secondary">{merchantData.business_type || 'Fashion Retailer'}</Badge>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2 sm:ml-auto">
                  {isOwner && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate('/merchant-terminal')}
                      className="gap-2"
                    >
                      <Edit3 className="h-4 w-4" />
                      Edit Page
                    </Button>
                  )}
                  
                  {!isOwner && (
                    <Button 
                      variant={isFollowing ? "outline" : "default"}
                      size="sm"
                      onClick={handleFollow}
                      className="gap-2"
                    >
                      <Heart className={`h-4 w-4 ${isFollowing ? 'fill-current' : ''}`} />
                      {isFollowing ? 'Following' : 'Follow'}
                    </Button>
                  )}
                  
                  <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-6 text-sm">
                <div className="flex items-center gap-1">
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{merchantItems.length}</span>
                  <span className="text-muted-foreground">Items</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">1.2K</span>
                  <span className="text-muted-foreground">Followers</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">4.8</span>
                  <span className="text-muted-foreground">Rating</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Joined {new Date(merchantData.created_at).toLocaleDateString('en-US', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
              </div>

              {/* Brand Story */}
              {merchantData.brand_story && (
                <p className="text-muted-foreground max-w-2xl">
                  {merchantData.brand_story}
                </p>
              )}

              {/* Specialties */}
              {merchantData.specialties && (
                <div className="flex flex-wrap gap-2">
                  {merchantData.specialties.map((specialty, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="items" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="items">Items ({merchantItems.length})</TabsTrigger>
            <TabsTrigger value="collections">Collections</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          {/* Items Tab */}
          <TabsContent value="items" className="mt-6">
            <div className="space-y-6">
              {/* Controls */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={activeCategory === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveCategory('all')}
                  >
                    All Items
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={activeCategory === category ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveCategory(category)}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Items Grid */}
              {filteredItems.length > 0 ? (
                <div className={viewMode === 'grid' 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
                  : "space-y-4"
                }>
                  {filteredItems.map((item) => (
                    <MerchantItemCard 
                      key={item.id} 
                      item={item}
                      onAction={(action, itemId) => {
                        // Handle actions like add to cart, etc.
                        console.log(action, itemId);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No items found</h3>
                  <p className="text-muted-foreground">
                    {activeCategory === 'all' 
                      ? "This merchant hasn't added any items yet." 
                      : `No items found in ${activeCategory} category.`
                    }
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Collections Tab */}
          <TabsContent value="collections" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {merchantData.featured_collections?.map((collection, index) => (
                <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{collection}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-muted rounded-lg mb-4"></div>
                    <p className="text-sm text-muted-foreground">
                      Curated collection of {collection.toLowerCase()} pieces
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>About {merchantData.business_name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    {merchantData.brand_story}
                  </p>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium mb-2">Specialties</h4>
                    <div className="flex flex-wrap gap-2">
                      {merchantData.specialties?.map((specialty, index) => (
                        <Badge key={index} variant="secondary">{specialty}</Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">Business Type</h4>
                    <p className="text-muted-foreground">{merchantData.business_type || 'Fashion Retailer'}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contact & Social</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {merchantData.social_links?.website && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{merchantData.social_links.website}</span>
                      </div>
                    )}
                    {merchantData.social_links?.instagram && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Instagram:</span>
                        <span className="text-sm text-muted-foreground">{merchantData.social_links.instagram}</span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">Member Since</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(merchantData.created_at).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric', 
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No reviews yet</h3>
                  <p className="text-muted-foreground">
                    Be the first to leave a review for {merchantData.business_name}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MerchantPage;