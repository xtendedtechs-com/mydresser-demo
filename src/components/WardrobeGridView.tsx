import { WardrobeItem } from "@/hooks/useWardrobe";
import WardrobeItemCard from "./WardrobeItemCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List, SlidersHorizontal } from "lucide-react";

interface WardrobeGridViewProps {
  items: WardrobeItem[];
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
  onMarkAsWorn: (id: string) => void;
  onEdit: (item: WardrobeItem) => void;
  onDelete: (id: string) => void;
  onView: (item: WardrobeItem) => void;
}

export const WardrobeGridView = ({
  items,
  onToggleFavorite,
  onMarkAsWorn,
  onEdit,
  onDelete,
  onView,
}: WardrobeGridViewProps) => {
  return (
    <div className="space-y-6">
      {/* View Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Items</SelectItem>
              <SelectItem value="tops">Tops</SelectItem>
              <SelectItem value="bottoms">Bottoms</SelectItem>
              <SelectItem value="dresses">Dresses</SelectItem>
              <SelectItem value="outerwear">Outerwear</SelectItem>
              <SelectItem value="shoes">Shoes</SelectItem>
              <SelectItem value="accessories">Accessories</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="recent">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="brand">Brand</SelectItem>
              <SelectItem value="worn">Most Worn</SelectItem>
              <SelectItem value="favorites">Favorites</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {items.map((item) => (
          <WardrobeItemCard
            key={item.id}
            item={item}
            onToggleFavorite={onToggleFavorite}
            onMarkAsWorn={onMarkAsWorn}
            onEdit={onEdit}
            onDelete={onDelete}
            onView={onView}
          />
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">👔</div>
          <h3 className="text-lg font-medium mb-2">No items yet</h3>
          <p className="text-text-muted">Start building your wardrobe by adding your first item</p>
        </div>
      )}
    </div>
  );
};
