import { useState } from "react";
import { Grid3X3, List, Search, Filter, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ClothingItem from "@/components/ClothingItem";
import WardrobeVector from "@/components/WardrobeVector";
import AddItemWithMatching from "@/components/AddItemWithMatching";
import { toast } from "sonner";

// Import fashion images
import orangeJacket from "@/assets/orange-jacket.jpg";
import blueJeans from "@/assets/blue-jeans.jpg";
import whiteSneakers from "@/assets/white-sneakers.jpg";
import blackJacket from "@/assets/black-jacket.jpg";
import graySweater from "@/assets/gray-sweater.jpg";

const Wardrobe = () => {
  const [viewMode, setViewMode] = useState<"grid" | "wardrobe" | "vector">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  
  const wardrobeItems = [
    { id: "1", name: "Orange Bomber Jacket", brand: "Nike", image: orangeJacket, category: "Jackets", lastWorn: "2 days ago" },
    { id: "2", name: "Dark Denim Jeans", brand: "Levi's", image: blueJeans, category: "Jeans", lastWorn: "1 week ago" },
    { id: "3", name: "White Sneakers", brand: "Adidas", image: whiteSneakers, category: "Shoes", lastWorn: "Yesterday" },
    { id: "4", name: "Black Leather Jacket", brand: "Zara", image: blackJacket, category: "Jackets", lastWorn: "1 month ago" },
    { id: "5", name: "Gray Wool Sweater", brand: "H&M", image: graySweater, category: "Sweaters", lastWorn: "3 days ago" },
    { id: "6", name: "Classic White Tee", brand: "Uniqlo", image: whiteSneakers, category: "T-Shirts", lastWorn: "Yesterday" },
  ];

  const categories = ["All", "Jackets", "Jeans", "Shoes", "Sweaters", "T-Shirts"];
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredItems = wardrobeItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleItemClick = (id: string) => {
    const item = wardrobeItems.find(i => i.id === id);
    toast(`Opening ${item?.name}`);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold fashion-text-gradient mb-4">My Wardrobe</h1>
          
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search your wardrobe..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter size={18} />
            </Button>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex gap-1">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                    activeCategory === category
                      ? "bg-fashion-orange text-white"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            
            <div className="flex gap-1">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 size={16} />
              </Button>
              <Button
                variant={viewMode === "wardrobe" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("wardrobe")}
              >
                <List size={16} />
              </Button>
              <Button
                variant={viewMode === "vector" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("vector")}
              >
                <Home size={16} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 py-6">
        {viewMode === "vector" ? (
          <WardrobeVector onAddItem={() => setShowAddDialog(true)} />
        ) : viewMode === "grid" ? (
          <div className="fashion-grid">
            {filteredItems.map((item) => (
              <ClothingItem
                key={item.id}
                {...item}
                onClick={handleItemClick}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <section>
              <h2 className="text-lg font-semibold mb-3">Hanging Section</h2>
              <div className="bg-fashion-neutral rounded-xl p-4 grid grid-cols-6 gap-2 min-h-[120px]">
                {filteredItems.filter(item => item.category === "Jackets").map((item, index) => (
                  <div key={item.id} className="bg-card rounded-lg p-2 text-center cursor-pointer hover:bg-card/80 transition-colors"
                       onClick={() => handleItemClick(item.id)}>
                    <div className="w-full h-12 bg-gradient-to-b from-gray-300 to-gray-400 rounded mb-1"></div>
                    <p className="text-xs font-medium truncate">{item.name}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">Folded Items</h2>
              <div className="bg-fashion-neutral rounded-xl p-4 grid grid-cols-4 gap-3 min-h-[100px]">
                {filteredItems.filter(item => ["Sweaters", "T-Shirts"].includes(item.category)).map((item) => (
                  <div key={item.id} className="bg-card rounded-lg p-3 text-center cursor-pointer hover:bg-card/80 transition-colors"
                       onClick={() => handleItemClick(item.id)}>
                    <div className="w-full h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded mb-2"></div>
                    <p className="text-xs font-medium truncate">{item.name}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">Shoes & Accessories</h2>
              <div className="bg-fashion-neutral rounded-xl p-4 grid grid-cols-5 gap-2 min-h-[80px]">
                {filteredItems.filter(item => item.category === "Shoes").map((item) => (
                  <div key={item.id} className="bg-card rounded-lg p-2 text-center cursor-pointer hover:bg-card/80 transition-colors"
                       onClick={() => handleItemClick(item.id)}>
                    <div className="w-full h-8 bg-gradient-to-r from-gray-100 to-gray-200 rounded mb-1"></div>
                    <p className="text-xs font-medium truncate">{item.name}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {filteredItems.length === 0 && viewMode !== "vector" && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No items found matching your search.</p>
          </div>
        )}
      </main>

      <AddItemWithMatching 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog}
      />
    </div>
  );
};

export default Wardrobe;