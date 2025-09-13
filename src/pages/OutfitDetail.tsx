import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, Crown, Sparkles, Plus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

// Mock outfit data - replace with real data source
interface OutfitItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  category: string;
}

interface Outfit {
  id: string;
  name: string;
  description: string;
  tags: string[];
  items: OutfitItem[];
  occasion: string;
  season: string;
  style: string;
  totalPrice: number;
  likes: number;
  views: number;
  created_at: string;
}

const OutfitDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [outfit, setOutfit] = useState<Outfit | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);

  // Mock outfit data
  const mockOutfit: Outfit = {
    id: "1",
    name: "Casual Weekend Look",
    description: "Perfect for a relaxed weekend outing with friends. Comfortable yet stylish, this outfit combines classic denim with a cozy sweater for an effortlessly chic appearance.",
    tags: ["casual", "weekend", "comfortable", "versatile"],
    occasion: "Casual",
    season: "Fall/Winter",
    style: "Casual Chic",
    totalPrice: 189,
    likes: 24,
    views: 156,
    created_at: "2024-01-15",
    items: [
      {
        id: "1",
        name: "Cozy Grey Sweater",
        brand: "Comfy Co.",
        price: 59,
        image: "/src/assets/gray-sweater.jpg",
        category: "Tops"
      },
      {
        id: "2", 
        name: "Classic Blue Jeans",
        brand: "Denim Plus",
        price: 85,
        image: "/src/assets/blue-jeans.jpg",
        category: "Bottoms"
      },
      {
        id: "3",
        name: "White Sneakers",
        brand: "ComfortWalk",
        price: 45,
        image: "/src/assets/white-sneakers.jpg",
        category: "Shoes"
      }
    ]
  };

  useEffect(() => {
    if (id) {
      // Simulate loading
      setTimeout(() => {
        setOutfit(mockOutfit);
        setLoading(false);
      }, 500);
    }
  }, [id]);

  const handleLike = () => {
    setIsLiked(!isLiked);
    toast({
      title: isLiked ? "Removed from favorites" : "Added to favorites",
      description: isLiked ? "Outfit removed from your favorites" : "Outfit saved to your favorites",
    });
  };

  const handleTryOutfit = () => {
    toast({
      title: "Try Outfit",
      description: "Virtual try-on feature coming soon!",
    });
  };

  const handleSaveOutfit = () => {
    toast({
      title: "Outfit Saved",
      description: "This outfit has been saved to your wardrobe",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading outfit...</p>
        </div>
      </div>
    );
  }

  if (!outfit) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Outfit not found</h1>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container flex h-16 items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold truncate mx-4">{outfit.name}</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLike}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current text-red-500' : ''}`} />
            </Button>
            <Button variant="ghost" size="icon">
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-6">
        {/* Outfit Overview */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Outfit Visualization */}
          <div className="space-y-4">
            <div className="aspect-[3/4] bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-lg p-8 flex flex-col items-center justify-center border-2 border-dashed border-primary/20">
              <div className="text-center space-y-4">
                <Sparkles className="w-16 h-16 text-primary mx-auto" />
                <h3 className="text-2xl font-bold">Complete Outfit</h3>
                <p className="text-muted-foreground">Virtual try-on coming soon</p>
                <Button onClick={handleTryOutfit}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Try Outfit
                </Button>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{outfit.likes}</div>
                  <div className="text-sm text-muted-foreground">Likes</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{outfit.views}</div>
                  <div className="text-sm text-muted-foreground">Views</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{outfit.items.length}</div>
                  <div className="text-sm text-muted-foreground">Items</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Outfit Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{outfit.name}</h1>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {outfit.description}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {outfit.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>

            {/* Outfit Attributes */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Occasion</h3>
                <Badge variant="outline">{outfit.occasion}</Badge>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Season</h3>
                <Badge variant="outline">{outfit.season}</Badge>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Style</h3>
                <Badge variant="outline">{outfit.style}</Badge>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Total Price</h3>
                <span className="text-2xl font-bold text-primary">${outfit.totalPrice}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button size="lg" className="w-full" onClick={handleSaveOutfit}>
                <Plus className="w-5 h-5 mr-2" />
                Save to My Outfits
              </Button>
              <Button size="lg" variant="outline" className="w-full" onClick={handleTryOutfit}>
                <Sparkles className="w-5 h-5 mr-2" />
                Virtual Try-On
              </Button>
            </div>
          </div>
        </div>

        {/* Outfit Items */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Items in this outfit</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {outfit.items.map((item) => (
              <Card key={item.id} className="group hover:shadow-lg transition-all duration-300">
                <CardContent className="p-0">
                  <div className="aspect-square bg-muted relative overflow-hidden rounded-t-lg">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute top-2 right-2 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="p-4">
                    <Badge variant="outline" className="mb-2">{item.category}</Badge>
                    <h3 className="font-semibold mb-1">{item.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{item.brand}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">${item.price}</span>
                      <Button size="sm">
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        Buy
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Similar Outfits */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Similar outfits</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="group cursor-pointer hover:shadow-lg transition-all duration-300">
                <CardContent className="p-0">
                  <div className="aspect-[3/4] bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-t-lg flex items-center justify-center">
                    <div className="text-center">
                      <Sparkles className="w-12 h-12 text-primary mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Outfit #{i}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-1">Sample Outfit {i}</h3>
                    <p className="text-sm text-muted-foreground mb-2">3 items</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">$210</span>
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        <span className="text-sm">15</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default OutfitDetail;