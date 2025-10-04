import { useState } from "react";
import { Grid3X3, List, Search, Filter, Home, Settings, Zap, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import WardrobeVector from "@/components/WardrobeVector";
import EnhancedWardrobeManager from "@/components/EnhancedWardrobeManager";
import AddItemWithMatching from "@/components/AddItemWithMatching";
import EnhancedSearch from "@/components/EnhancedSearch";
import SmartOutfitMatcher from "@/components/SmartOutfitMatcher";
import LaundryTracker from "@/components/LaundryTracker";
import SettingsDialog from "@/components/SettingsDialog";
import { toast } from "sonner";
import { useTranslation } from 'react-i18next';

const Wardrobe = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<"grid" | "wardrobe" | "vector" | "search" | "outfits" | "laundry">("grid");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-4">
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
        <div className="container max-w-7xl mx-auto px-4 py-4 lg:px-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold fashion-text-gradient mb-3 sm:mb-4">{t('wardrobe.title')}</h1>
          
          <div className="flex justify-between items-center gap-2">
            <div className="flex gap-1 flex-wrap">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="px-2 sm:px-3"
              >
                <Grid3X3 size={16} />
                <span className="sr-only sm:not-sr-only sm:ml-1 text-xs">{t('common.view')}</span>
              </Button>
              <Button
                variant={viewMode === "vector" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("vector")}
                className="px-2 sm:px-3"
              >
                <Home size={16} />
                <span className="sr-only sm:not-sr-only sm:ml-1 text-xs">Vector</span>
              </Button>
              <Button
                variant={viewMode === "search" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("search")}
                className="px-2 sm:px-3"
              >
                <Search size={16} />
                <span className="sr-only sm:not-sr-only sm:ml-1 text-xs">{t('common.search')}</span>
              </Button>
              <Button
                variant={viewMode === "outfits" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("outfits")}
                className="px-2 sm:px-3"
              >
                <Zap size={16} />
                <span className="sr-only lg:not-sr-only lg:ml-1 text-xs">{t('nav.outfits')}</span>
              </Button>
              <Button
                variant={viewMode === "laundry" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("laundry")}
                className="px-2 sm:px-3"
              >
                <List size={16} />
                <span className="sr-only lg:not-sr-only lg:ml-1 text-xs">Laundry</span>
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/wardrobe-analytics")}
                className="flex items-center gap-1"
              >
                <BarChart3 size={16} />
                <span className="hidden sm:inline">{t('nav.analytics')}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(true)}
              >
                <Settings size={16} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-4 lg:px-6 py-4 sm:py-6">
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