import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useMerchantItems } from '@/hooks/useMerchantItems';
import MerchantItemCard from '@/components/MerchantItemCard';
import { 
  Heart, Share2, MapPin, Clock, Phone, Mail, 
  Instagram, Facebook, Twitter, Globe, 
  Grid, List, Star, Users, ArrowLeft
} from 'lucide-react';

interface MerchantPageData {
  id: string;
  merchant_id: string;
  business_name: string;
  brand_story: string;
  theme_color: string;
  logo: string;
  hero_image: string;
  gallery_images: string[];
  profile_photo: string;
  cover_video: string;
  specialties: string[];
  featured_collections: string[];
  social_links: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    website?: string;
  };
  contact_info: {
    phone?: string;
    email?: string;
    address?: string;
  };
  business_hours: {
    [key: string]: string;
  };
  active_sections: {
    hero: boolean;
    about: boolean;
    featured: boolean;
    collections: boolean;
    gallery: boolean;
    contact: boolean;
  };
  section_order: string[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export const MerchantPage: React.FC = () => {
  const { merchantId: paramMerchantId } = useParams<{ merchantId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { items, loading: itemsLoading } = useMerchantItems();

  const [merchantData, setMerchantData] = useState<MerchantPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high' | 'popular'>('newest');
  const [followerCount, setFollowerCount] = useState(0);
  const [averageRating, setAverageRating] = useState(0);

  // Get current merchant ID from auth if not in params (terminal context)
  const [merchantId, setMerchantId] = useState<string | undefined>(paramMerchantId);

  useEffect(() => {
    const getCurrentMerchant = async () => {
      if (!paramMerchantId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) setMerchantId(user.id);
      }
    };
    getCurrentMerchant();
  }, [paramMerchantId]);

  useEffect(() => {
    if (merchantId) {
      fetchMerchantData();
      checkFollowStatus();
      fetchFollowerCount();
      fetchAverageRating();
    }
  }, [merchantId]);

  const fetchMerchantData = async () => {
    if (!merchantId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('merchant_pages')
        .select('*')
        .eq('merchant_id', merchantId)
        .eq('is_published', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching merchant data:', error);
        return;
      }

      if (data) {
        setMerchantData({
          ...data,
          social_links: (data.social_links as any) || {},
          contact_info: (data.contact_info as any) || {},
          business_hours: (data.business_hours as any) || {},
          gallery_images: (data.gallery_images as string[]) || [],
          profile_photo: data.profile_photo || '',
          cover_video: data.cover_video || '',
          active_sections: (data.active_sections as any) || {
            hero: true,
            about: true,
            featured: true,
            collections: true,
            gallery: true,
            contact: true
          },
          section_order: (data.section_order as string[]) || ['hero', 'about', 'featured', 'collections', 'gallery', 'contact']
        });
      } else {
        // Fallback to merchant profile if no page exists
        const { data: profileData, error: profileError } = await supabase
          .from('merchant_profiles')
          .select('business_name, business_type, user_id')
          .eq('user_id', merchantId)
          .single();

        if (profileData) {
          setMerchantData({
            id: '',
            merchant_id: profileData.user_id,
            business_name: profileData.business_name,
            brand_story: '',
            theme_color: '#000000',
            logo: '',
            hero_image: '',
            gallery_images: [],
            profile_photo: '',
            cover_video: '',
            specialties: [profileData.business_type || ''].filter(Boolean),
            featured_collections: [],
            social_links: {},
            contact_info: {},
            business_hours: {},
            active_sections: {
              hero: true,
              about: true,
              featured: true,
              collections: true,
              gallery: true,
              contact: true
            },
            section_order: ['hero', 'about', 'featured', 'collections', 'gallery', 'contact'],
            is_published: true,
            created_at: '',
            updated_at: ''
          });
        }
      }
    } catch (error) {
      console.error('Error in fetchMerchantData:', error);
      toast({
        title: "Error",
        description: "Failed to load merchant page",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const checkFollowStatus = async () => {
    if (!merchantId) return;

    try {
      const { data, error } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', (await supabase.auth.getUser()).data.user?.id)
        .eq('following_id', merchantId)
        .single();

      setIsFollowing(!!data);
    } catch (error) {
      // User not logged in or no follow relationship
    }
  };

  const handleFollow = async () => {
    if (!merchantId) return;

    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to follow merchants",
          variant: "destructive"
        });
        return;
      }

      if (isFollowing) {
        await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', merchantId);
        setIsFollowing(false);
        toast({
          title: "Unfollowed",
          description: `You've unfollowed ${merchantData?.business_name}`
        });
      } else {
        await supabase
          .from('user_follows')
          .insert({
            follower_id: user.id,
            following_id: merchantId
          });
        setIsFollowing(true);
        toast({
          title: "Following",
          description: `You're now following ${merchantData?.business_name}`
        });
      }
    } catch (error) {
      console.error('Error updating follow status:', error);
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive"
      });
    }
  };

  const fetchFollowerCount = async () => {
    if (!merchantId) return;
    
    const { count } = await supabase
      .from('user_follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', merchantId);
    
    setFollowerCount(count || 0);
  };

  const fetchAverageRating = async () => {
    if (!merchantId) return;
    
    const { data } = await supabase
      .from('marketplace_reviews')
      .select('rating')
      .eq('reviewee_id', merchantId);
    
    if (data && data.length > 0) {
      const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
      setAverageRating(Math.round(avg * 10) / 10);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: merchantData?.business_name,
        text: merchantData?.brand_story,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Page link copied to clipboard"
      });
    }
  };

  const filteredItems = items.filter(item => {
    if (selectedCategory === 'all') return true;
    return item.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  const sortedItems = filteredItems.sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'popular':
        return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
      default: // newest
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const featuredItems = items.filter(item => item.is_featured && item.status === 'available').slice(0, 6);
  const categories = [...new Set(items.map(item => item.category))];

  // Helper to check if section is active
  const isSectionActive = (section: string) => {
    return merchantData?.active_sections?.[section as keyof typeof merchantData.active_sections] !== false;
  };

  // Get ordered sections
  const orderedSections = merchantData?.section_order || ['hero', 'about', 'featured', 'collections', 'gallery', 'contact'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading merchant page...</p>
        </div>
      </div>
    );
  }

  if (!merchantData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Merchant Not Found</h2>
          <p className="text-muted-foreground">This merchant page doesn't exist or is not published.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-3">
          <Button variant="outline" onClick={() => navigate(-1)} className="mb-4 lg:mb-0">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </div>

      {/* Render sections in order based on active_sections and section_order */}
      {orderedSections.map((section) => {
        if (!isSectionActive(section)) return null;

        switch (section) {
          case 'hero':
            return (
              <div key="hero">
                {/* Hero Section */}
                <div 
                  className="relative h-64 bg-cover bg-center"
                  style={{
                    backgroundColor: merchantData.theme_color,
                    backgroundImage: merchantData.hero_image ? `url(${merchantData.hero_image})` : undefined
                  }}
                >
                  {merchantData.cover_video && (
                    <video 
                      src={merchantData.cover_video} 
                      className="absolute inset-0 w-full h-full object-cover" 
                      autoPlay 
                      loop 
                      muted 
                      playsInline
                    />
                  )}
                  <div className="absolute inset-0 bg-black/30" />
                  <div className="relative h-full flex items-end">
                    <div className="container mx-auto px-4 pb-6">
                      <div className="flex items-end gap-4">
                        {merchantData.logo && (
                          <img
                            src={merchantData.logo}
                            alt={merchantData.business_name}
                            className="w-20 h-20 rounded-lg bg-white p-2 shadow-lg"
                          />
                        )}
                        <div className="text-white">
                          <h1 className="text-3xl font-bold">{merchantData.business_name}</h1>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {merchantData.specialties.map((specialty, index) => (
                              <Badge key={index} variant="secondary" className="bg-white/20 text-white">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="container mx-auto px-4 py-6">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex gap-2">
                      <Button onClick={handleFollow} variant={isFollowing ? "default" : "outline"}>
                        <Heart className={`h-4 w-4 mr-2 ${isFollowing ? 'fill-current' : ''}`} />
                        {isFollowing ? 'Following' : 'Follow'}
                      </Button>
                      <Button variant="outline" onClick={handleShare}>
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {followerCount} follower{followerCount !== 1 ? 's' : ''}
                      </span>
                      {averageRating > 0 && (
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-current text-yellow-500" />
                          {averageRating} rating
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );

          case 'about':
            return (
              <div key="about" className="container mx-auto px-4 py-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About Us</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {merchantData.brand_story || 'This merchant hasn\'t shared their story yet.'}
                    </p>
                  </CardContent>
                </Card>
              </div>
            );

          case 'featured':
            if (featuredItems.length === 0) return null;
            return (
              <div key="featured" className="container mx-auto px-4 py-6">
                <h2 className="text-2xl font-bold mb-4">Featured Products</h2>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {featuredItems.map(item => (
                    <MerchantItemCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            );

          case 'collections':
            return (
              <div key="collections" className="container mx-auto px-4 py-6">
                <Tabs defaultValue="products" className="w-full">
                  <TabsList>
                    <TabsTrigger value="products">All Products</TabsTrigger>
                  </TabsList>

                  <TabsContent value="products" className="space-y-4">
                    {/* Filters and Controls */}
                    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant={selectedCategory === 'all' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedCategory('all')}
                        >
                          All
                        </Button>
                        {categories.map(category => (
                          <Button
                            key={category}
                            variant={selectedCategory === category ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedCategory(category)}
                          >
                            {category}
                          </Button>
                        ))}
                      </div>
                      
                      <div className="flex gap-2">
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as any)}
                          className="px-3 py-2 border rounded-md text-sm bg-background"
                        >
                          <option value="newest">Newest</option>
                          <option value="price-low">Price: Low to High</option>
                          <option value="price-high">Price: High to Low</option>
                          <option value="popular">Most Popular</option>
                        </select>
                        
                        <div className="flex border rounded-md">
                          <Button
                            variant={viewMode === 'grid' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('grid')}
                          >
                            <Grid className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={viewMode === 'list' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('list')}
                          >
                            <List className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Products Grid */}
                    <div className={`grid gap-4 ${
                      viewMode === 'grid' 
                        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                        : 'grid-cols-1'
                    }`}>
                      {sortedItems.map(item => (
                        <MerchantItemCard key={item.id} item={item} />
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            );

          case 'gallery':
            if (!merchantData.gallery_images || merchantData.gallery_images.length === 0) return null;
            return (
              <div key="gallery" className="container mx-auto px-4 py-6">
                <h2 className="text-2xl font-bold mb-4">Gallery</h2>
                <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {merchantData.gallery_images.map((image, index) => (
                    <div key={index} className="aspect-square overflow-hidden rounded-lg">
                      <img
                        src={image}
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                  ))}
                </div>
              </div>
            );

          case 'contact':
            if (!merchantData.contact_info.phone && !merchantData.contact_info.email && !merchantData.contact_info.address && Object.keys(merchantData.social_links).length === 0) {
              return null;
            }
            return (
              <div key="contact" className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Contact Info */}
                  {(merchantData.contact_info.phone || merchantData.contact_info.email || merchantData.contact_info.address) && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Contact Info
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {merchantData.contact_info.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{merchantData.contact_info.phone}</span>
                          </div>
                        )}
                        {merchantData.contact_info.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{merchantData.contact_info.email}</span>
                          </div>
                        )}
                        {merchantData.contact_info.address && (
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <span className="text-sm">{merchantData.contact_info.address}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Social Links */}
                  {Object.keys(merchantData.social_links).length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Connect With Us</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-3">
                          {merchantData.social_links.instagram && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={`https://instagram.com/${merchantData.social_links.instagram}`} target="_blank" rel="noopener noreferrer">
                                <Instagram className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          {merchantData.social_links.facebook && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={merchantData.social_links.facebook} target="_blank" rel="noopener noreferrer">
                                <Facebook className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          {merchantData.social_links.website && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={merchantData.social_links.website} target="_blank" rel="noopener noreferrer">
                                <Globe className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
};

export default MerchantPage;