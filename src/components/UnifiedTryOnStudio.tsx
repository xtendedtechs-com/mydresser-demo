import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Scan, ShoppingBag } from "lucide-react";
import { useWardrobe } from "@/hooks/useWardrobe";
import { useMarketItems } from "@/hooks/useMarketItems";
import { getPrimaryPhotoUrl } from "@/utils/photoHelpers";
import { VTOStudio } from "@/components/VTOStudio";

interface SelectedItem {
  id: string;
  itemType: "wardrobe" | "market" | "merchant";
  name: string;
  image: string;
}

export const UnifiedTryOnStudio = () => {
  const navigate = useNavigate();
  const { items: wardrobeItems, loading: wardrobeLoading, getPhotoUrls } = useWardrobe();
  const { items: marketItems, loading: marketLoading } = useMarketItems();
  const [selected, setSelected] = useState<SelectedItem | null>(null);

  const renderItemCard = (item: any, type: SelectedItem["itemType"]) => {
    const image = getPrimaryPhotoUrl(item.photos, item.category);
    const name = item.name || item.title || "Item";
    const category = (item.category || "").toString();
    const color = item.color || "";
    const size = item.size || "";

    return (
      <div
        key={item.id}
        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
          selected?.id === item.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
        }`}
        onClick={() => setSelected({ id: item.id, itemType: type, name, image })}
      >
        <div className="flex gap-3">
          <img src={image} alt={name} className="w-16 h-16 object-cover rounded" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{name}</p>
            <p className="text-xs text-muted-foreground truncate">{category}</p>
            <div className="flex gap-2 mt-1">
              {color && (
                <Badge variant="secondary" className="text-xs">
                  {color}
                </Badge>
              )}
              {size && (
                <Badge variant="outline" className="text-xs">
                  {size}
                </Badge>
              )}
            </div>
          </div>
        </div>
        {selected?.id === item.id && (
          <Button size="sm" className="w-full mt-2">
            <Scan className="mr-2 h-4 w-4" />
            Try On
          </Button>
        )}
      </div>
    );
  };

  if (selected) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Try-On: {selected.name}</h2>
          <Button variant="outline" onClick={() => setSelected(null)}>
            Choose another item
          </Button>
        </div>
        <VTOStudio
          itemId={selected.id}
          itemType={selected.itemType}
          itemName={selected.name}
          itemImage={selected.image}
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Selection Panel */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Select an Item</CardTitle>
          <CardDescription>Pick something from your wardrobe or the market</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="wardrobe">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="wardrobe">Wardrobe</TabsTrigger>
              <TabsTrigger value="market">Market</TabsTrigger>
            </TabsList>

            <TabsContent value="wardrobe" className="space-y-3">
              {wardrobeLoading && <p className="text-sm text-muted-foreground">Loading wardrobe...</p>}
              {!wardrobeLoading && wardrobeItems.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">No wardrobe items yet</p>
                  <Button size="sm" className="mt-3" onClick={() => navigate('/add')}>Add Items</Button>
                </div>
              )}
              {!wardrobeLoading && wardrobeItems.map((item) => renderItemCard(item, "wardrobe"))}
            </TabsContent>

            <TabsContent value="market" className="space-y-3">
              {marketLoading && <p className="text-sm text-muted-foreground">Loading market...</p>}
              {!marketLoading && marketItems.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">No market items available</p>
                  <Button size="sm" className="mt-4">
                    <ShoppingBag className="w-4 h-4 mr-2" /> Browse Market
                  </Button>
                </div>
              )}
              {!marketLoading && marketItems.map((item) => renderItemCard(item, "market"))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Guidance Panel */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Virtual Try-On Studio</CardTitle>
          <CardDescription>Choose an item on the left to start your AI try-on</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="aspect-[3/4] w-full rounded-lg bg-muted flex items-center justify-center">
            <div className="text-center">
              <Scan className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">Select an item to begin your virtual try-on</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedTryOnStudio;
