import { useState } from "react";
import DailyOutfit from "@/components/DailyOutfit";
import ClothingItem from "@/components/ClothingItem";
import { toast } from "sonner";

// Import fashion images
import orangeJacket from "@/assets/orange-jacket.jpg";
import blueJeans from "@/assets/blue-jeans.jpg";
import whiteSneakers from "@/assets/white-sneakers.jpg";
import blackJacket from "@/assets/black-jacket.jpg";
import graySweater from "@/assets/gray-sweater.jpg";

const Home = () => {
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [starredItems, setStarredItems] = useState<Set<string>>(new Set());

  const favoritesItems = [
    { id: "1", name: "Orange Bomber Jacket", brand: "Nike", image: orangeJacket, category: "Jacket" },
    { id: "2", name: "Dark Denim Jeans", brand: "Levi's", image: blueJeans, category: "Jeans" },
    { id: "3", name: "White Sneakers", brand: "Adidas", image: whiteSneakers, category: "Shoes" },
  ];

  const featuredItems = [
    { id: "4", name: "Black Leather Jacket", brand: "Zara", image: blackJacket, category: "Jacket", price: "$89" },
    { id: "5", name: "Gray Wool Sweater", brand: "H&M", image: graySweater, category: "Sweater", price: "$45" },
    { id: "6", name: "Classic White Tee", brand: "Uniqlo", image: whiteSneakers, category: "T-Shirt", price: "$19" },
  ];

  const handleLike = (id: string) => {
    const newLiked = new Set(likedItems);
    if (newLiked.has(id)) {
      newLiked.delete(id);
      toast("Item removed from favorites");
    } else {
      newLiked.add(id);
      toast("Item added to favorites");
    }
    setLikedItems(newLiked);
  };

  const handleStar = (id: string) => {
    const newStarred = new Set(starredItems);
    if (newStarred.has(id)) {
      newStarred.delete(id);
    } else {
      newStarred.add(id);
    }
    setStarredItems(newStarred);
  };

  const handleOutfitAction = (action: string) => {
    toast(`Outfit ${action}d!`);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold fashion-text-gradient">MyDresser</h1>
        </div>
      </header>

      <main className="px-4 py-6 space-y-8">
        <DailyOutfit 
          onRegenerate={() => handleOutfitAction("regenerate")}
          onLike={() => handleOutfitAction("like")}
          onDislike={() => handleOutfitAction("dislike")}
        />

        <section>
          <h2 className="text-lg font-semibold mb-4">My Favorites</h2>
          <div className="fashion-grid">
            {favoritesItems.map((item) => (
              <ClothingItem
                key={item.id}
                {...item}
                isLiked={likedItems.has(item.id)}
                isStarred={starredItems.has(item.id)}
                onLike={handleLike}
                onStar={handleStar}
                onClick={() => toast(`Viewing ${item.name}`)}
              />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">Featured Items</h2>
          <div className="fashion-grid">
            {featuredItems.map((item) => (
              <ClothingItem
                key={item.id}
                {...item}
                isLiked={likedItems.has(item.id)}
                isStarred={starredItems.has(item.id)}
                onLike={handleLike}
                onStar={handleStar}
                onClick={() => toast(`Viewing ${item.name}`)}
              />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">My Collections</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="fashion-card p-4 text-center">
              <div className="w-full h-24 bg-gradient-to-br from-fashion-orange to-fashion-orange-light rounded-lg mb-3"></div>
              <h3 className="font-medium text-sm">Work Outfits</h3>
              <p className="text-xs text-muted-foreground">12 items</p>
            </div>
            <div className="fashion-card p-4 text-center">
              <div className="w-full h-24 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg mb-3"></div>
              <h3 className="font-medium text-sm">Casual Wear</h3>
              <p className="text-xs text-muted-foreground">8 items</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;