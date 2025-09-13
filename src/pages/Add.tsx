import AddItemWithMatching from "@/components/AddItemWithMatching";
import ImportFromLink from "@/components/ImportFromLink";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Camera, 
  Link, 
  Smartphone, 
  QrCode, 
  Ruler, 
  Package, 
  Scan, 
  Shirt, 
  Home,
  Search,
  Upload,
  Zap,
  Tag
} from "lucide-react";
import AddSection from "@/components/AddSection";
import AddOption from "@/components/AddOption";
import { useToast } from "@/hooks/use-toast";

const Add = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const { toast } = useToast();

  const handleAddOption = (optionName: string) => {
    if (optionName === "Manual Item Entry") {
      setShowAddDialog(true);
    } else if (optionName === "Link Import") {
      setShowImportDialog(true);
    } else {
      toast({
        title: `${optionName} - Coming Soon!`,
        description: `The ${optionName} feature will be available in a future update.`,
      });
    }
  };

  const itemOptions = [
    {
      title: "Insert Item Manually",
      description: "Add items by entering details and taking photos. AI will identify and enhance the item information.",
      icon: <Plus className="w-6 h-6" />,
      onClick: () => handleAddOption("Manual Item Entry"),
      isNew: false
    },
    {
      title: "Import from Link",
      description: "Paste links from ASOS, Shein, Zara, H&M and other retailers to auto-import item details.",
      icon: <Link className="w-6 h-6" />,
      onClick: () => handleAddOption("Link Import"),
      isNew: false
    },
    {
      title: "Import from Apps",
      description: "Direct integration with fashion apps for seamless item importing.",
      icon: <Smartphone className="w-6 h-6" />,
      onClick: () => handleAddOption("App Import"),
      isComingSoon: true
    },
    {
      title: "Scan Item",
      description: "Use your camera to scan items, read smart tags (RFID/NFC), and identify materials automatically.",
      icon: <Scan className="w-6 h-6" />,
      onClick: () => handleAddOption("Item Scanning"),
      isPremium: true
    },
    {
      title: "Smart Tag Reader",
      description: "Read RFID/NFC smart tags attached to your clothing for instant item recognition.",
      icon: <Tag className="w-6 h-6" />,
      onClick: () => handleAddOption("Smart Tag Reading"),
      isPremium: true,
      isComingSoon: true
    }
  ];

  const wardrobeOptions = [
    {
      title: "Manual Wardrobe Setup",
      description: "Enter precise measurements of your wardrobe including hanging space, shelves, and drawers.",
      icon: <Ruler className="w-6 h-6" />,
      onClick: () => handleAddOption("Manual Wardrobe Setup"),
      isNew: false
    },
    {
      title: "Import Pre-made Designs",
      description: "Browse and import wardrobe designs from IKEA and other merchants or community workshops.",
      icon: <Package className="w-6 h-6" />,
      onClick: () => handleAddOption("Pre-made Wardrobe Import"),
      isNew: true
    },
    {
      title: "Scan QR Code",
      description: "Scan QR codes from wardrobe manuals to automatically configure your wardrobe layout.",
      icon: <QrCode className="w-6 h-6" />,
      onClick: () => handleAddOption("QR Code Scanning"),
      isComingSoon: true
    },
    {
      title: "3D Wardrobe Scan",
      description: "Use your phone camera to create a 3D model of your physical wardrobe space.",
      icon: <Camera className="w-6 h-6" />,
      onClick: () => handleAddOption("3D Wardrobe Scanning"),
      isPremium: true,
      isComingSoon: true
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="px-4 py-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold fashion-text-gradient flex items-center justify-center gap-2">
            <Plus className="w-6 h-6" />
            ADD TO MYDRESSER
          </h1>
          <p className="text-muted-foreground">Expand your digital wardrobe and optimize your space</p>
        </div>

        {/* Quick Search */}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search for items, brands, or features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={() => handleAddOption("AI Search")}>
              <Zap className="w-4 h-4 mr-2" />
              AI Search
            </Button>
          </div>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="items" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="items" className="flex items-center gap-2">
              <Shirt className="w-4 h-4" />
              Add Items
            </TabsTrigger>
            <TabsTrigger value="wardrobe" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Setup Wardrobe
            </TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="space-y-4 mt-6">
            <AddSection
              title="Add Clothing Items"
              description="Expand your digital wardrobe with new clothing items using various input methods"
              icon="👕"
            >
              <div className="space-y-3">
                {itemOptions.map((option, index) => (
                  <AddOption
                    key={index}
                    title={option.title}
                    description={option.description}
                    icon={option.icon}
                    onClick={option.onClick}
                    isNew={option.isNew}
                    isComingSoon={option.isComingSoon}
                    isPremium={option.isPremium}
                  />
                ))}
              </div>
            </AddSection>

            {/* Quick Actions for Items */}
            <Card className="p-4 bg-accent/20">
              <h3 className="font-semibold mb-3 text-foreground">Quick Actions</h3>
              <div className="flex gap-2 flex-wrap">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleAddOption("Bulk Upload")}
                  className="text-xs"
                >
                  <Upload className="w-3 h-3 mr-1" />
                  Bulk Upload
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleAddOption("Wishlist Import")}
                  className="text-xs"
                >
                  <Package className="w-3 h-3 mr-1" />
                  Import Wishlist
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleAddOption("Recent Purchases")}
                  className="text-xs"
                >
                  <Shirt className="w-3 h-3 mr-1" />
                  Recent Purchases
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="wardrobe" className="space-y-4 mt-6">
            <AddSection
              title="Configure Your Wardrobe"
              description="Set up your physical wardrobe space for optimal digital organization"
              icon="🏠"
            >
              <div className="space-y-3">
                {wardrobeOptions.map((option, index) => (
                  <AddOption
                    key={index}
                    title={option.title}
                    description={option.description}
                    icon={option.icon}
                    onClick={option.onClick}
                    isNew={option.isNew}
                    isComingSoon={option.isComingSoon}
                    isPremium={option.isPremium}
                  />
                ))}
              </div>
            </AddSection>

            {/* Wardrobe Tips */}
            <Card className="p-4 bg-primary/5 border-primary/20">
              <h3 className="font-semibold mb-2 text-foreground">💡 Wardrobe Setup Tips</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Measure your wardrobe space accurately for best results</li>
                <li>• Consider seasonal clothing rotation in your setup</li>
                <li>• Premium features include AI space optimization</li>
                <li>• Connect smart hangers and sensors for automatic tracking</li>
              </ul>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Recently Added */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3 text-foreground flex items-center gap-2">
            <span>🕒</span>
            Recently Added
          </h3>
          <div className="text-center py-6">
            <p className="text-muted-foreground text-sm">No recent additions</p>
            <p className="text-muted-foreground text-xs mt-1">Items you add will appear here for quick access</p>
          </div>
        </Card>

        <AddItemWithMatching 
          open={showAddDialog} 
          onOpenChange={setShowAddDialog}
        />
        
        <ImportFromLink 
          open={showImportDialog} 
          onOpenChange={setShowImportDialog}
        />
      </div>
    </div>
  );
};

export default Add;