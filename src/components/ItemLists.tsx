import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Star, Calendar, TrendingUp, Clock, Shirt, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWardrobe, WardrobeItem } from '@/hooks/useWardrobe';

interface ItemListsProps {
  showAll?: boolean;
  limit?: number;
  excludeCurrentItem?: string;
}

const ItemLists = ({ showAll = false, limit = 4, excludeCurrentItem }: ItemListsProps) => {
  const navigate = useNavigate();
  const { items, getPhotoUrls } = useWardrobe();
  
  // Filter out current item if specified
  const filteredItems = excludeCurrentItem 
    ? items.filter(item => item.id !== excludeCurrentItem)
    : items;

  // Get different lists
  const favoriteItems = filteredItems.filter(item => item.is_favorite).slice(0, showAll ? undefined : limit);
  const starredItems = filteredItems.filter(item => item.tags?.includes('starred')).slice(0, showAll ? undefined : limit);
  const recentlyAdded = filteredItems.slice(0, showAll ? undefined : limit);
  const mostWorn = filteredItems
    .filter(item => item.wear_count > 0)
    .sort((a, b) => b.wear_count - a.wear_count)
    .slice(0, showAll ? undefined : limit);
  const leastWorn = filteredItems
    .filter(item => item.wear_count === 0)
    .slice(0, showAll ? undefined : limit);
  const recentlyWorn = filteredItems
    .filter(item => item.last_worn)
    .sort((a, b) => new Date(b.last_worn!).getTime() - new Date(a.last_worn!).getTime())
    .slice(0, showAll ? undefined : limit);

  const ItemCard = ({ item }: { item: WardrobeItem }) => {
    const photos = getPhotoUrls(item);
    
    return (
      <Card 
        className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
        onClick={() => navigate(`/wardrobe-item/${item.id}`)}
      >
        <div className="aspect-square bg-muted overflow-hidden relative">
          {photos.length > 0 ? (
            <img
              src={photos[0]}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <Shirt className="h-8 w-8" />
            </div>
          )}
          
          {/* Item badges */}
          <div className="absolute top-2 right-2 flex gap-1">
            {item.is_favorite && (
              <div className="bg-red-500 rounded-full p-1">
                <Heart className="h-3 w-3 text-white" fill="white" />
              </div>
            )}
            {item.tags?.includes('starred') && (
              <div className="bg-yellow-500 rounded-full p-1">
                <Star className="h-3 w-3 text-white" fill="white" />
              </div>
            )}
          </div>
          
          {/* Wear count badge */}
          {item.wear_count > 0 && (
            <div className="absolute bottom-2 left-2">
              <Badge variant="secondary" className="text-xs">
                {item.wear_count}x worn
              </Badge>
            </div>
          )}
        </div>
        
        <div className="p-3">
          <h3 className="font-medium truncate">{item.name}</h3>
          <p className="text-sm text-muted-foreground truncate">{item.brand}</p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground">
              {new Date(item.created_at).toLocaleDateString()}
            </p>
            {item.last_worn && (
              <p className="text-xs text-muted-foreground">
                Worn {Math.floor((new Date().getTime() - new Date(item.last_worn).getTime()) / (1000 * 3600 * 24))}d ago
              </p>
            )}
          </div>
        </div>
      </Card>
    );
  };

  const ListSection = ({ 
    title, 
    icon: Icon, 
    items, 
    emptyMessage,
    viewAllPath 
  }: { 
    title: string; 
    icon: any; 
    items: WardrobeItem[]; 
    emptyMessage: string;
    viewAllPath?: string;
  }) => {
    if (items.length === 0 && !showAll) return null;

    return (
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {title}
          </h2>
          {!showAll && items.length >= limit && viewAllPath && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(viewAllPath)}
              className="flex items-center gap-1"
            >
              View All
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {items.length === 0 ? (
          <Card className="p-8 text-center">
            <Icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">{emptyMessage}</p>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    );
  };

  return (
    <div className="space-y-8">
      <ListSection
        title="My Favorites"
        icon={Heart}
        items={favoriteItems}
        emptyMessage="No favorite items yet. Heart items to add them here!"
        viewAllPath="/wardrobe?filter=favorites"
      />

      <ListSection
        title="Starred Items"
        icon={Star}
        items={starredItems}
        emptyMessage="No starred items yet. Star items for quick access!"
        viewAllPath="/wardrobe?filter=starred"
      />

      <ListSection
        title="Recently Added"
        icon={Clock}
        items={recentlyAdded}
        emptyMessage="No items in your wardrobe yet."
        viewAllPath="/wardrobe?sort=newest"
      />

      <ListSection
        title="Most Worn"
        icon={TrendingUp}
        items={mostWorn}
        emptyMessage="No wear data yet. Start marking items as worn!"
        viewAllPath="/wardrobe?sort=most-worn"
      />

      <ListSection
        title="Recently Worn"
        icon={Calendar}
        items={recentlyWorn}
        emptyMessage="No recently worn items."
        viewAllPath="/wardrobe?sort=recently-worn"
      />

      {!showAll && leastWorn.length > 0 && (
        <ListSection
          title="Needs Some Love"
          icon={Shirt}
          items={leastWorn}
          emptyMessage="All items have been worn!"
          viewAllPath="/wardrobe?sort=least-worn"
        />
      )}
    </div>
  );
};

export default ItemLists;