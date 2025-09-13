import { useState } from "react";
import { Grid3X3, List, Search, Filter, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import WardrobeVector from "@/components/WardrobeVector";
import WardrobeManager from "@/components/WardrobeManager";
import AddItemWithMatching from "@/components/AddItemWithMatching";
import { toast } from "sonner";

const Wardrobe = () => {
  const [viewMode, setViewMode] = useState<"grid" | "wardrobe" | "vector">("grid");
  const [showAddDialog, setShowAddDialog] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold fashion-text-gradient mb-4">My Wardrobe</h1>
          
          <div className="flex justify-end items-center">
            <div className="flex gap-1">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 size={16} />
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
        ) : (
          <WardrobeManager />
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