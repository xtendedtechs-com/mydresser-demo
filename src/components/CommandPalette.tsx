import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Home, ShoppingBag, Heart, User, TrendingUp, Calendar, Settings,
  Sparkles, MessageSquare, Users, Bell, Camera, Target, BarChart3,
  Search, PlusCircle, List, Zap, Brain, Gift, Compass, Shield
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: any;
  action: () => void;
  keywords?: string[];
  category: string;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const commands: CommandItem[] = [
    // Navigation
    {
      id: "nav-home",
      label: "Home",
      description: "Go to home page",
      icon: Home,
      action: () => navigate("/"),
      keywords: ["home", "dashboard", "main"],
      category: "Navigation"
    },
    {
      id: "nav-wardrobe",
      label: "Wardrobe",
      description: "View your wardrobe",
      icon: Heart,
      action: () => navigate("/wardrobe"),
      keywords: ["wardrobe", "clothes", "items"],
      category: "Navigation"
    },
    {
      id: "nav-market",
      label: "Market",
      description: "Browse marketplace",
      icon: ShoppingBag,
      action: () => navigate("/market"),
      keywords: ["market", "shop", "buy", "marketplace"],
      category: "Navigation"
    },
    {
      id: "nav-social",
      label: "Social",
      description: "View social feed",
      icon: Users,
      action: () => navigate("/social"),
      keywords: ["social", "feed", "friends", "community"],
      category: "Navigation"
    },
    {
      id: "nav-account",
      label: "Account",
      description: "Manage your account",
      icon: User,
      action: () => navigate("/account"),
      keywords: ["account", "profile", "settings"],
      category: "Navigation"
    },

    // AI Features
    {
      id: "ai-insights",
      label: "AI Insights Hub",
      description: "Access all AI-powered features",
      icon: Sparkles,
      action: () => navigate("/ai-insights"),
      keywords: ["ai", "insights", "trends", "analysis", "purchase", "smart"],
      category: "AI Features"
    },
    {
      id: "ai-outfit",
      label: "Generate Daily Outfit",
      description: "Get AI outfit suggestions",
      icon: Sparkles,
      action: () => navigate("/outfit-generator"),
      keywords: ["ai", "outfit", "daily", "generate", "suggestions"],
      category: "AI Features"
    },
    {
      id: "ai-shopping",
      label: "AI Shopping Assistant",
      description: "Get smart shopping advice",
      icon: ShoppingBag,
      action: () => navigate("/personal-shopping"),
      keywords: ["ai", "shopping", "assistant", "advice", "recommendations"],
      category: "AI Features"
    },
    {
      id: "ai-wardrobe",
      label: "Wardrobe Insights",
      description: "AI-powered wardrobe analysis",
      icon: Sparkles,
      action: () => navigate("/wardrobe-insights"),
      keywords: ["ai", "wardrobe", "insights", "analysis", "stats"],
      category: "AI Features"
    },
    {
      id: "ai-style-assistant",
      label: "AI Style Assistant",
      description: "Chat with AI fashion consultant",
      icon: MessageSquare,
      action: () => navigate("/ai-style-assistant"),
      keywords: ["ai", "chat", "assistant", "consultant", "style", "fashion", "advice"],
      category: "AI Features"
    },
    {
      id: "verification",
      label: "Verification Center",
      description: "Verify merchant or professional status",
      icon: Shield,
      action: () => navigate("/verification"),
      keywords: ["verify", "merchant", "professional", "badge", "trust", "certification"],
      category: "Account"
    },
    {
      id: "wardrobe-analytics",
      label: "Wardrobe Analytics",
      description: "Advanced wardrobe insights and optimization",
      icon: BarChart3,
      action: () => navigate("/wardrobe-analytics"),
      keywords: ["analytics", "wardrobe", "stats", "insights", "analysis", "frequency", "value"],
      category: "AI Features"
    },

    // Social & Collaboration
    {
      id: "social-feed",
      label: "Social Feed",
      description: "View social feed",
      icon: Users,
      action: () => navigate("/social"),
      keywords: ["social", "feed", "community"],
      category: "Social"
    },
    {
      id: "collaborate",
      label: "Collaborate",
      description: "Style together with friends",
      icon: Users,
      action: () => navigate("/collaborate"),
      keywords: ["collaborate", "together", "friends", "challenges", "team"],
      category: "Social"
    },

    // Quick Actions
    {
      id: "ai-style-hub",
      label: "AI Style Hub",
      description: "AI style consultant and analysis",
      icon: Brain,
      action: () => navigate("/ai-style-hub"),
      keywords: ["ai", "style", "consultant", "chat", "transform"],
      category: "AI Features"
    },
    {
      id: "ai-advanced",
      label: "Advanced AI",
      description: "Predictions, trends, and evolution",
      icon: TrendingUp,
      action: () => navigate("/advanced-ai"),
      keywords: ["ai", "predictions", "trends", "forecast", "ml"],
      category: "AI Features"
    },
    {
      id: "ai-shopping",
      label: "AI Shopping Assistant",
      description: "Get personalized shopping advice",
      icon: MessageSquare,
      action: () => navigate("/personal-shopping"),
      keywords: ["shopping", "ai", "assistant", "advice", "recommendations"],
      category: "AI Features"
    },

    // Quick Actions
    {
      id: "action-add-item",
      label: "Add Item",
      description: "Add new item to wardrobe",
      icon: PlusCircle,
      action: () => navigate("/add"),
      keywords: ["add", "new", "item", "upload"],
      category: "Quick Actions"
    },
    {
      id: "action-scan",
      label: "Scan Item",
      description: "Scan with camera",
      icon: Camera,
      action: () => {
        navigate("/add");
        toast({ title: "Opening camera scanner", description: "Click the scan button to use AI camera" });
      },
      keywords: ["scan", "camera", "ai", "photo"],
      category: "Quick Actions"
    },
    {
      id: "action-create-outfit",
      label: "Create Outfit",
      description: "Build a new outfit",
      icon: Target,
      action: () => navigate("/outfit-generator"),
      keywords: ["create", "outfit", "build", "new"],
      category: "Quick Actions"
    },

    // Analytics & Insights
    {
      id: "analytics-wardrobe",
      label: "Wardrobe Analytics",
      description: "View wardrobe insights",
      icon: BarChart3,
      action: () => navigate("/wardrobe-insights"),
      keywords: ["analytics", "insights", "stats", "data"],
      category: "Analytics"
    },
    {
      id: "analytics-user",
      label: "User Analytics",
      description: "Your activity analytics",
      icon: BarChart3,
      action: () => navigate("/analytics"),
      keywords: ["analytics", "user", "activity"],
      category: "Analytics"
    },

    // Tools
    {
      id: "tool-virtual-fitting",
      label: "Virtual Fitting Room",
      description: "Try on clothes virtually",
      icon: Compass,
      action: () => navigate("/virtual-fitting"),
      keywords: ["virtual", "try on", "ar", "fitting"],
      category: "Tools"
    },
    {
      id: "tool-2nddresser",
      label: "2ndDresser Market",
      description: "Buy and sell used items",
      icon: Gift,
      action: () => navigate("/2nddresser"),
      keywords: ["2nddresser", "secondhand", "used", "sell"],
      category: "Tools"
    },
    {
      id: "tool-sustainability",
      label: "Sustainability",
      description: "Track your fashion impact",
      icon: Target,
      action: () => navigate("/sustainability"),
      keywords: ["sustainability", "eco", "carbon", "impact"],
      category: "Tools"
    },
    {
      id: "tool-challenges",
      label: "Style Challenges",
      description: "Join fashion challenges",
      icon: Zap,
      action: () => navigate("/challenges"),
      keywords: ["challenges", "gamification", "achievements"],
      category: "Tools"
    },

    // Settings
    {
      id: "settings-main",
      label: "Settings",
      description: "Manage app settings",
      icon: Settings,
      action: () => navigate("/settings"),
      keywords: ["settings", "preferences", "configuration"],
      category: "Settings"
    },
    {
      id: "settings-notifications",
      label: "Notifications",
      description: "Manage notifications",
      icon: Bell,
      action: () => navigate("/notifications"),
      keywords: ["notifications", "alerts", "activity"],
      category: "Settings"
    },
    {
      id: "settings-security",
      label: "Security",
      description: "Security settings",
      icon: Shield,
      action: () => navigate("/security"),
      keywords: ["security", "privacy", "mfa", "authentication"],
      category: "Settings"
    },
  ];

  const handleSelect = useCallback((command: CommandItem) => {
    setOpen(false);
    command.action();
  }, []);

  const groupedCommands = commands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) {
      acc[cmd.category] = [];
    }
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, CommandItem[]>);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        {Object.entries(groupedCommands).map(([category, items], index) => (
          <div key={category}>
            <CommandGroup heading={category}>
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <CommandItem
                    key={item.id}
                    onSelect={() => handleSelect(item)}
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    <div className="flex flex-col">
                      <span>{item.label}</span>
                      {item.description && (
                        <span className="text-xs text-muted-foreground">{item.description}</span>
                      )}
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {index < Object.entries(groupedCommands).length - 1 && <CommandSeparator />}
          </div>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
