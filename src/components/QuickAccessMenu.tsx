import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import {
  Zap,
  History,
  Cloud,
  Sparkles,
  TrendingUp,
  Calendar,
  BarChart3,
  ShoppingBag,
  MessageSquare,
  Settings,
  Users,
  Package,
  Heart,
  Home,
  Shirt,
  Plus,
  Brain,
  User,
  Search,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface CommandItem {
  label: string;
  icon: any;
  path: string;
  category: string;
  keywords: string[];
}

export const QuickAccessMenu = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const commands: CommandItem[] = useMemo(() => [
    // Main Navigation
    { 
      label: t('nav.home', 'Home'), 
      icon: Home, 
      path: '/', 
      category: 'navigation',
      keywords: ['home', 'main', 'dashboard']
    },
    { 
      label: t('nav.wardrobe', 'Wardrobe'), 
      icon: Shirt, 
      path: '/wardrobe', 
      category: 'navigation',
      keywords: ['wardrobe', 'clothes', 'items', 'clothing']
    },
    { 
      label: t('common.add', 'Add Item'), 
      icon: Plus, 
      path: '/add', 
      category: 'navigation',
      keywords: ['add', 'new', 'create', 'upload']
    },
    { 
      label: 'AI Hub', 
      icon: Brain, 
      path: '/ai-hub', 
      category: 'navigation',
      keywords: ['ai', 'artificial intelligence', 'smart', 'assistant']
    },
    { 
      label: t('nav.market', 'Market'), 
      icon: ShoppingBag, 
      path: '/market', 
      category: 'navigation',
      keywords: ['market', 'shop', 'buy', 'purchase']
    },
    { 
      label: t('nav.account', 'Account'), 
      icon: User, 
      path: '/account', 
      category: 'navigation',
      keywords: ['account', 'profile', 'user', 'settings']
    },
    
    // Features
    { 
      label: t('nav.outfitHistory', 'Outfit History'), 
      icon: History, 
      path: '/outfit-history', 
      category: 'features',
      keywords: ['history', 'past', 'previous', 'outfits']
    },
    { 
      label: t('weather.title', 'Weather'), 
      icon: Cloud, 
      path: '/weather', 
      category: 'features',
      keywords: ['weather', 'forecast', 'temperature', 'climate']
    },
    { 
      label: t('nav.collections', 'Collections'), 
      icon: Heart, 
      path: '/collections', 
      category: 'features',
      keywords: ['collections', 'favorites', 'saved', 'organize']
    },
    
    // AI Tools
    { 
      label: t('nav.advancedAI', 'Advanced AI'), 
      icon: TrendingUp, 
      path: '/advanced-ai', 
      category: 'ai',
      keywords: ['ai', 'advanced', 'machine learning', 'smart']
    },
    { 
      label: t('nav.outfitGenerator', 'Outfit Generator'), 
      icon: Calendar, 
      path: '/outfit-generator', 
      category: 'ai',
      keywords: ['generator', 'outfit', 'create', 'ai', 'suggest']
    },
    { 
      label: 'Dresser', 
      icon: Sparkles, 
      path: '/dresser', 
      category: 'ai',
      keywords: ['dresser', 'daily', 'outfit', 'suggestions', 'ai', 'smart', 'wardrobe']
    },
    
    // Insights
    { 
      label: t('nav.analytics', 'Analytics'), 
      icon: BarChart3, 
      path: '/analytics', 
      category: 'insights',
      keywords: ['analytics', 'stats', 'data', 'insights']
    },
    { 
      label: t('nav.wardrobeInsights', 'Wardrobe Insights'), 
      icon: Package, 
      path: '/wardrobe-insights', 
      category: 'insights',
      keywords: ['insights', 'wardrobe', 'analysis', 'statistics']
    },
    
    // Marketplace
    { 
      label: t('nav.2nddresser', '2ndDresser'), 
      icon: ShoppingBag, 
      path: '/2nddresser', 
      category: 'marketplace',
      keywords: ['marketplace', '2nddresser', 'second', 'buy', 'sell', 'trade']
    },
    
    // Social
    { 
      label: t('nav.messages', 'Messages'), 
      icon: MessageSquare, 
      path: '/messages', 
      category: 'social',
      keywords: ['messages', 'chat', 'conversation', 'talk']
    },
    { 
      label: t('nav.social', 'Social'), 
      icon: Users, 
      path: '/social', 
      category: 'social',
      keywords: ['social', 'friends', 'community', 'people']
    },
    
    // Settings
    { 
      label: t('nav.settings', 'Settings'), 
      icon: Settings, 
      path: '/settings', 
      category: 'settings',
      keywords: ['settings', 'preferences', 'configuration', 'options']
    },
  ], [t]);

  const categories = {
    navigation: t('menu.navigation', 'Navigation'),
    features: t('menu.features', 'Features'),
    ai: t('menu.ai', 'AI Tools'),
    insights: t('menu.insights', 'Insights'),
    marketplace: t('menu.marketplace', 'Marketplace'),
    social: t('menu.social', 'Social'),
    settings: t('menu.settings', 'Settings'),
  };

  const filteredCommands = useMemo(() => {
    if (!search) return commands;
    
    const searchLower = search.toLowerCase();
    return commands.filter(cmd => 
      cmd.label.toLowerCase().includes(searchLower) ||
      cmd.keywords.some(kw => kw.toLowerCase().includes(searchLower))
    );
  }, [commands, search]);

  const groupedCommands = useMemo(() => {
    return filteredCommands.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, CommandItem[]>);
  }, [filteredCommands]);

  const handleSelect = (path: string) => {
    setOpen(false);
    setSearch('');
    navigate(path);
  };

  return (
    <>
      <Button
        size="icon"
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full shadow-lg animate-pulse hover:animate-none"
        aria-label="Quick access search"
      >
        <Zap className="h-6 w-6" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 gap-0 max-w-2xl">
          <Command className="rounded-lg border-none shadow-md">
            <div className="flex items-center gap-2 px-3 py-3 border-b">
              <Search className="h-5 w-5 text-muted-foreground" />
              <CommandInput 
                placeholder={t('search.placeholder', 'Search for pages, features, settings...')}
                value={search}
                onValueChange={setSearch}
                className="border-none focus:ring-0"
              />
            </div>
            
            <CommandList className="max-h-[400px]">
              <CommandEmpty>
                {t('search.noResults', 'No results found.')}
              </CommandEmpty>
              
              {Object.entries(groupedCommands).map(([category, items]) => (
                <CommandGroup 
                  key={category} 
                  heading={categories[category as keyof typeof categories]}
                >
                  {items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <CommandItem
                        key={item.path}
                        value={item.label}
                        onSelect={() => handleSelect(item.path)}
                        className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                      >
                        <Icon className="h-5 w-5 text-muted-foreground" />
                        <span className="flex-1">{item.label}</span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
};
