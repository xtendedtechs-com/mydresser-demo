import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, Star, Edit, Plus, Calendar, MapPin, Tag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useWardrobe, WardrobeItem } from '@/hooks/useWardrobe';

const WardrobeItemDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { items, toggleFavorite, markAsWorn, updateItem, deleteItem, getPhotoUrls } = useWardrobe();
  
  const [item, setItem] = useState<WardrobeItem | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isStarred, setIsStarred] = useState(false);

  useEffect(() => {
    if (id && items.length > 0) {
      const foundItem = items.find(i => i.id === id);
      setItem(foundItem || null);
      setIsStarred(foundItem?.tags?.includes('starred') || false);
    }
  }, [id, items]);

  if (!item) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Item not found</h2>
          <Button onClick={() => navigate('/wardrobe')}>
            Back to Wardrobe
          </Button>
        </div>
      </div>
    );
  }

  const photos = getPhotoUrls(item);
  const daysSinceWorn = item.last_worn 
    ? Math.floor((new Date().getTime() - new Date(item.last_worn).getTime()) / (1000 * 3600 * 24))
    : null;

  const handleToggleFavorite = async () => {
    await toggleFavorite(item.id, !item.is_favorite);
    toast({
      title: item.is_favorite ? "Removed from favorites" : "Added to favorites",
      description: item.is_favorite 
        ? `${item.name} removed from your favorites.`
        : `${item.name} added to your favorites.`,
    });
  };

  const handleToggleStar = async () => {
    const newTags = item.tags ? [...item.tags] : [];
    if (isStarred) {
      const index = newTags.indexOf('starred');
      if (index > -1) newTags.splice(index, 1);
    } else {
      newTags.push('starred');
    }
    
    await updateItem(item.id, { tags: newTags });
    setIsStarred(!isStarred);
    
    toast({
      title: isStarred ? "Removed from starred" : "Added to starred",
      description: isStarred 
        ? `${item.name} removed from starred items.`
        : `${item.name} added to starred items.`,
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: item.name,
        text: `Check out my ${item.name} from ${item.brand || 'my wardrobe'}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Item link has been copied to your clipboard.",
      });
    }
  };

  const handleMarkAsWorn = async () => {
    await markAsWorn(item.id);
    toast({
      title: "Marked as worn",
      description: `${item.name} has been marked as worn today.`,
    });
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'bg-emerald-500 text-white';
      case 'good': return 'bg-blue-500 text-white';
      case 'fair': return 'bg-yellow-500 text-white';
      case 'poor': return 'bg-red-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleFavorite}
              className={item.is_favorite ? "text-red-500" : ""}
            >
              <Heart size={20} fill={item.is_favorite ? "currentColor" : "none"} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleStar}
              className={isStarred ? "text-yellow-500" : ""}
            >
              <Star size={20} fill={isStarred ? "currentColor" : "none"} />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate(`/add?edit=${item.id}`)}>
              <Edit size={20} />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share2 size={20} />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-xl overflow-hidden bg-muted relative">
              {photos.length > 0 ? (
                <img
                  src={photos[selectedImageIndex] || "/placeholder.svg"}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <div className="text-6xl mb-4">👔</div>
                    <p className="text-lg">No photo available</p>
                  </div>
                </div>
              )}
              
              {/* Close button overlay */}
              <Button
                variant="ghost" 
                size="sm"
                className="absolute top-2 left-2 bg-background/80 hover:bg-background"
                onClick={() => navigate(-1)}
              >
                <X size={16} />
              </Button>
            </div>

            {photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {photos.map((photo, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImageIndex === index 
                        ? "border-primary" 
                        : "border-border hover:border-muted-foreground"
                    }`}
                  >
                    <img
                      src={photo}
                      alt={`${item.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{item.name}</h1>
              {item.brand && (
                <p className="text-lg text-muted-foreground mb-4">By {item.brand}</p>
              )}
              
              <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                <span>Added on {new Date(item.created_at).toLocaleDateString()}</span>
                <span>•</span>
                <span>Size: {item.size || 'Unknown'}</span>
                <span>•</span>
                <span>Item ID: {item.id.slice(0, 8)}</span>
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4">
                <div className="text-sm text-muted-foreground mb-1">Condition:</div>
                <Badge className={getConditionColor(item.condition)}>
                  {item.condition}
                </Badge>
              </Card>
              
              <Card className="p-4">
                <div className="text-sm text-muted-foreground mb-1">Item stats:</div>
                <div className="text-sm">
                  Last worn {daysSinceWorn !== null ? (daysSinceWorn === 0 ? 'today' : `${daysSinceWorn}d ago`) : 'never'} • Worn {item.wear_count} times
                </div>
              </Card>
            </div>

            {item.purchase_price && (
              <Card className="p-4">
                <div className="text-sm text-muted-foreground mb-1">Purchase info:</div>
                <div className="text-sm">
                  Purchased from {item.brand || 'Unknown'} on {item.purchase_date ? new Date(item.purchase_date).toLocaleDateString() : 'Unknown date'} • Receipt
                </div>
              </Card>
            )}

            {/* Collections */}
            <Card className="p-4">
              <div className="text-sm text-muted-foreground mb-2">Collections:</div>
              <div className="flex flex-wrap gap-2">
                {item.season && (
                  <Badge variant="outline">{item.season} collection</Badge>
                )}
                {item.is_favorite && (
                  <Badge variant="outline">My Favorites</Badge>
                )}
                {item.tags?.map((tag, index) => (
                  <Badge key={index} variant="outline">{tag}</Badge>
                ))}
              </div>
            </Card>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              {item.category && (
                <div>
                  <span className="font-medium text-foreground">Category:</span>
                  <span className="text-muted-foreground ml-2 capitalize">{item.category}</span>
                </div>
              )}
              {item.color && (
                <div>
                  <span className="font-medium text-foreground">Color:</span>
                  <span className="text-muted-foreground ml-2">{item.color}</span>
                </div>
              )}
              {item.material && (
                <div>
                  <span className="font-medium text-foreground">Material:</span>
                  <span className="text-muted-foreground ml-2">{item.material}</span>
                </div>
              )}
              {item.occasion && (
                <div>
                  <span className="font-medium text-foreground">Occasion:</span>
                  <span className="text-muted-foreground ml-2">{item.occasion}</span>
                </div>
              )}
            </div>

            {item.notes && (
              <div>
                <h3 className="font-semibold text-foreground mb-2">Notes</h3>
                <p className="text-muted-foreground text-sm">{item.notes}</p>
              </div>
            )}

            <Separator />

            {/* Action Buttons */}
            <div className="grid grid-cols-5 gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="flex flex-col gap-1 h-auto py-3"
                onClick={() => {/* Add to collection logic */}}
              >
                <Plus size={16} />
                <span className="text-xs">Add</span>
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                className={`flex flex-col gap-1 h-auto py-3 ${item.is_favorite ? 'text-red-500' : ''}`}
                onClick={handleToggleFavorite}
              >
                <Heart size={16} fill={item.is_favorite ? "currentColor" : "none"} />
                <span className="text-xs">Like</span>
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                className={`flex flex-col gap-1 h-auto py-3 ${isStarred ? 'text-yellow-500' : ''}`}
                onClick={handleToggleStar}
              >
                <Star size={16} fill={isStarred ? "currentColor" : "none"} />
                <span className="text-xs">Star</span>
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                className="flex flex-col gap-1 h-auto py-3"
                onClick={() => navigate(`/add?edit=${item.id}`)}
              >
                <Edit size={16} />
                <span className="text-xs">Edit</span>
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                className="flex flex-col gap-1 h-auto py-3"
                onClick={handleShare}
              >
                <Share2 size={16} />
                <span className="text-xs">Share</span>
              </Button>
            </div>

            <Button 
              className="w-full"
              onClick={handleMarkAsWorn}
            >
              <Calendar className="mr-2" size={20} />
              Mark as Worn Today
            </Button>
          </div>
        </div>

        {/* Related Items Sections */}
        <div className="space-y-8">
          {/* My Favorites */}
          {items.filter(item => item.is_favorite).length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4">My favorites</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {items.filter(item => item.is_favorite).slice(0, 4).map((favoriteItem) => (
                  <Card 
                    key={favoriteItem.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/wardrobe-item/${favoriteItem.id}`)}
                  >
                    <div className="aspect-square bg-muted overflow-hidden">
                      {favoriteItem.photos && typeof favoriteItem.photos === 'object' && favoriteItem.photos.main ? (
                        <img
                          src={favoriteItem.photos.main}
                          alt={favoriteItem.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <div className="text-xs">No photo</div>
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <h3 className="text-sm font-medium truncate">{favoriteItem.name}</h3>
                      <p className="text-xs text-muted-foreground truncate">{favoriteItem.brand}</p>
                      <p className="text-xs text-muted-foreground">{new Date(favoriteItem.created_at).toLocaleDateString()}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Featured Items (recently added) */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Featured items</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {items.slice(0, 4).map((featuredItem) => (
                <Card 
                  key={featuredItem.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/wardrobe-item/${featuredItem.id}`)}
                >
                  <div className="aspect-square bg-muted overflow-hidden">
                    {featuredItem.photos && typeof featuredItem.photos === 'object' && featuredItem.photos.main ? (
                      <img
                        src={featuredItem.photos.main}
                        alt={featuredItem.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <div className="text-xs">No photo</div>
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <h3 className="text-sm font-medium truncate">{featuredItem.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">{featuredItem.brand}</p>
                    <p className="text-xs text-muted-foreground">{new Date(featuredItem.created_at).toLocaleDateString()}</p>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* Collections */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Collections</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4 bg-gradient-to-br from-zinc-900 to-zinc-800 text-white">
                <div className="space-y-2">
                  <h3 className="font-semibold">Street Map</h3>
                  <p className="text-sm opacity-80">By New Ace</p>
                  <p className="text-xs opacity-60">Updated 04/07/25</p>
                </div>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
                <div className="space-y-2">
                  <h3 className="font-semibold">Jeans World</h3>
                  <p className="text-sm opacity-80">By Matches</p>
                  <p className="text-xs opacity-60">Based 14/07/25</p>
                </div>
              </Card>
            </div>
          </section>

          {/* Recently Added */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Recently added</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {items.slice(0, 4).map((recentItem) => (
                <Card 
                  key={recentItem.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/wardrobe-item/${recentItem.id}`)}
                >
                  <div className="aspect-square bg-muted overflow-hidden">
                    {recentItem.photos && typeof recentItem.photos === 'object' && recentItem.photos.main ? (
                      <img
                        src={recentItem.photos.main}
                        alt={recentItem.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <div className="text-xs">No photo</div>
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <h3 className="text-sm font-medium truncate">{recentItem.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">{recentItem.brand}</p>
                    <p className="text-xs text-muted-foreground">{new Date(recentItem.created_at).toLocaleDateString()}</p>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* Most Worn */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Most worn</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {items.sort((a, b) => b.wear_count - a.wear_count).slice(0, 4).map((wornItem) => (
                <Card 
                  key={wornItem.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/wardrobe-item/${wornItem.id}`)}
                >
                  <div className="aspect-square bg-muted overflow-hidden">
                    {wornItem.photos && typeof wornItem.photos === 'object' && wornItem.photos.main ? (
                      <img
                        src={wornItem.photos.main}
                        alt={wornItem.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <div className="text-xs">No photo</div>
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <h3 className="text-sm font-medium truncate">{wornItem.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">{wornItem.brand}</p>
                    <p className="text-xs text-muted-foreground">{new Date(wornItem.created_at).toLocaleDateString()}</p>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* Least Worn */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Least worn</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {items.sort((a, b) => a.wear_count - b.wear_count).slice(0, 4).map((leastWornItem) => (
                <Card 
                  key={leastWornItem.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/wardrobe-item/${leastWornItem.id}`)}
                >
                  <div className="aspect-square bg-muted overflow-hidden">
                    {leastWornItem.photos && typeof leastWornItem.photos === 'object' && leastWornItem.photos.main ? (
                      <img
                        src={leastWornItem.photos.main}
                        alt={leastWornItem.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <div className="text-xs">No photo</div>
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <h3 className="text-sm font-medium truncate">{leastWornItem.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">{leastWornItem.brand}</p>
                    <p className="text-xs text-muted-foreground">{new Date(leastWornItem.created_at).toLocaleDateString()}</p>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default WardrobeItemDetail;