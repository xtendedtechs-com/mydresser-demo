import { useState } from "react";
import { Grid3X3, List, Search, Filter, Home, Settings, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import WardrobeVector from "@/components/WardrobeVector";
import EnhancedWardrobeManager from "@/components/EnhancedWardrobeManager";
import AddItemWithMatching from "@/components/AddItemWithMatching";
import EnhancedSearch from "@/components/EnhancedSearch";
import SmartOutfitMatcher from "@/components/SmartOutfitMatcher";
import LaundryTracker from "@/components/LaundryTracker";
import SettingsDialog from "@/components/SettingsDialog";
import { toast } from "sonner";

const Wardrobe = () => {
  const [viewMode, setViewMode] = useState<"grid" | "wardrobe" | "vector" | "search" | "outfits" | "laundry">("grid");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold fashion-text-gradient mb-4">My Wardrobe</h1>
          
          <div className="flex justify-between items-center">
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
              <Button
                variant={viewMode === "search" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("search")}
              >
                <Search size={16} />
              </Button>
              <Button
                variant={viewMode === "outfits" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("outfits")}
              >
                <Zap size={16} />
              </Button>
              <Button
                variant={viewMode === "laundry" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("laundry")}
              >
                <List size={16} />
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(true)}
            >
              <Settings size={16} />
            </Button>
          </div>
        </div>
      </header>

      <main className="px-4 py-6">
        {viewMode === "vector" && (
          <WardrobeVector onAddItem={() => setShowAddDialog(true)} />
        )}
        {viewMode === "grid" && (
          <EnhancedWardrobeManager />
        )}
        {viewMode === "search" && (
          <EnhancedSearch searchScope="wardrobe" />
        )}
        {viewMode === "outfits" && (
          <SmartOutfitMatcher />
        )}
        {viewMode === "laundry" && (
          <LaundryTracker />
        )}
      </main>

      <AddItemWithMatching 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog}
      />
      
      <SettingsDialog 
        open={showSettings} 
        onOpenChange={setShowSettings}
      />
    </div>
  );
};

export default Wardrobe;