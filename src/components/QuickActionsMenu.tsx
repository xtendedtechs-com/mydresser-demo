import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Zap, PlusCircle, Camera, Sparkles, ShoppingBag, Target,
  BarChart3, Search, MessageSquare, Calendar, Shirt, Users,
  Heart, TrendingUp, Palette, Shield, Settings, Globe,
  Leaf, Trophy, Zap as Lightning, Tag, Store, Megaphone,
  Home, User
} from "lucide-react";

export function QuickActionsMenu() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const quickActions = [
    // Core Actions
    {
      icon: Home,
      label: "Home",
      description: "Dashboard",
      action: () => navigate("/"),
      shortcut: "⌘H",
      category: "core"
    },
    {
      icon: PlusCircle,
      label: "Add Item",
      description: "Upload to wardrobe",
      action: () => navigate("/add"),
      shortcut: "⌘N",
      category: "core"
    },
    {
      icon: Camera,
      label: "Scan Item",
      description: "AI camera scan",
      action: () => navigate("/add"),
      shortcut: "⌘S",
      category: "core"
    },
    {
      icon: Shirt,
      label: "My Wardrobe",
      description: "View all items",
      action: () => navigate("/wardrobe"),
      shortcut: "⌘W",
      category: "core"
    },
    
    // AI & Outfit Generation
    {
      icon: Sparkles,
      label: "Daily Outfit",
      description: "Generate outfit",
      action: () => navigate("/outfit-generator"),
      shortcut: "⌘O",
      category: "ai"
    },
    {
      icon: Lightning,
      label: "AI Style Hub",
      description: "AI assistant",
      action: () => navigate("/ai-style-hub"),
      shortcut: "⌘L",
      category: "ai"
    },
    {
      icon: MessageSquare,
      label: "AI Shopping",
      description: "Get advice",
      action: () => navigate("/personal-shopping"),
      shortcut: "⌘A",
      category: "ai"
    },
    {
      icon: Target,
      label: "Style Recommendations",
      description: "Personalized tips",
      action: () => navigate("/ai-style-hub"),
      shortcut: "⌘R",
      category: "ai"
    },
    
    // Social & Community
    {
      icon: Users,
      label: "Social Feed",
      description: "Connect & share",
      action: () => navigate("/social"),
      shortcut: "⌘F",
      category: "social"
    },
    {
      icon: Trophy,
      label: "Challenges",
      description: "Join competitions",
      action: () => navigate("/style-challenges"),
      shortcut: "⌘C",
      category: "social"
    },
    {
      icon: Megaphone,
      label: "Community",
      description: "Events & programs",
      action: () => navigate("/community"),
      shortcut: "⌘U",
      category: "social"
    },
    
    // Marketplace
    {
      icon: ShoppingBag,
      label: "Browse Market",
      description: "Discover items",
      action: () => navigate("/market"),
      shortcut: "⌘M",
      category: "market"
    },
    {
      icon: Tag,
      label: "2ndDresser",
      description: "Sell your items",
      action: () => navigate("/seconddresser"),
      shortcut: "⌘2",
      category: "market"
    },
    {
      icon: Store,
      label: "MyMirror",
      description: "Virtual try-on",
      action: () => navigate("/mymirror"),
      shortcut: "⌘V",
      category: "market"
    },
    
    // Insights & Analytics
    {
      icon: BarChart3,
      label: "View Analytics",
      description: "Your insights",
      action: () => navigate("/analytics"),
      shortcut: "⌘I",
      category: "insights"
    },
    {
      icon: TrendingUp,
      label: "Wardrobe Insights",
      description: "AI analysis",
      action: () => navigate("/wardrobe-insights"),
      shortcut: "⌘B",
      category: "insights"
    },
    {
      icon: Leaf,
      label: "Sustainability",
      description: "Impact tracking",
      action: () => navigate("/sustainability"),
      shortcut: "⌘E",
      category: "insights"
    },
    
    // Settings & Profile
    {
      icon: User,
      label: "My Account",
      description: "Profile & settings",
      action: () => navigate("/account"),
      shortcut: "⌘P",
      category: "settings"
    },
    {
      icon: Palette,
      label: "My Style",
      description: "Style preferences",
      action: () => navigate("/mystyle"),
      shortcut: "⌘Y",
      category: "settings"
    },
  ];

  // Group actions by category
  const coreActions = quickActions.filter(a => a.category === "core");
  const aiActions = quickActions.filter(a => a.category === "ai");
  const socialActions = quickActions.filter(a => a.category === "social");
  const marketActions = quickActions.filter(a => a.category === "market");
  const insightsActions = quickActions.filter(a => a.category === "insights");
  const settingsActions = quickActions.filter(a => a.category === "settings");

  const handleAction = (action: () => void) => {
    setOpen(false);
    action();
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="default"
          size="icon"
          className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg z-40 md:bottom-4"
        >
          <Zap className="h-6 w-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 max-h-[80vh] overflow-y-auto">
        <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Core Actions */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-muted-foreground">Core</DropdownMenuLabel>
          {coreActions.map((action) => {
            const Icon = action.icon;
            return (
              <DropdownMenuItem
                key={action.label}
                onClick={() => handleAction(action.action)}
                className="flex items-start gap-3 py-2"
              >
                <div className="mt-0.5 h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{action.label}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* AI & Outfit Actions */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-muted-foreground">AI & Outfits</DropdownMenuLabel>
          {aiActions.map((action) => {
            const Icon = action.icon;
            return (
              <DropdownMenuItem
                key={action.label}
                onClick={() => handleAction(action.action)}
                className="flex items-start gap-3 py-2"
              >
                <div className="mt-0.5 h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{action.label}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Social & Community Actions */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-muted-foreground">Social</DropdownMenuLabel>
          {socialActions.map((action) => {
            const Icon = action.icon;
            return (
              <DropdownMenuItem
                key={action.label}
                onClick={() => handleAction(action.action)}
                className="flex items-start gap-3 py-2"
              >
                <div className="mt-0.5 h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{action.label}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Marketplace Actions */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-muted-foreground">Marketplace</DropdownMenuLabel>
          {marketActions.map((action) => {
            const Icon = action.icon;
            return (
              <DropdownMenuItem
                key={action.label}
                onClick={() => handleAction(action.action)}
                className="flex items-start gap-3 py-2"
              >
                <div className="mt-0.5 h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{action.label}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Insights Actions */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-muted-foreground">Insights</DropdownMenuLabel>
          {insightsActions.map((action) => {
            const Icon = action.icon;
            return (
              <DropdownMenuItem
                key={action.label}
                onClick={() => handleAction(action.action)}
                className="flex items-start gap-3 py-2"
              >
                <div className="mt-0.5 h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{action.label}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Settings Actions */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-muted-foreground">Profile & Settings</DropdownMenuLabel>
          {settingsActions.map((action) => {
            const Icon = action.icon;
            return (
              <DropdownMenuItem
                key={action.label}
                onClick={() => handleAction(action.action)}
                className="flex items-start gap-3 py-2"
              >
                <div className="mt-0.5 h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{action.label}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => {
            setOpen(false);
            // Trigger command palette
            const event = new KeyboardEvent('keydown', {
              key: 'k',
              metaKey: true,
              bubbles: true
            });
            document.dispatchEvent(event);
          }}
          className="flex items-center gap-2"
        >
          <Search className="h-4 w-4" />
          Search Everything
          <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
