import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  Menu,
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
  PlusCircle,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const QuickAccessMenu = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const menuItems = [
    {
      label: t('nav.outfitHistory', 'Outfit History'),
      icon: History,
      path: '/outfit-history',
      category: 'features',
    },
    {
      label: t('weather.title', 'Weather'),
      icon: Cloud,
      path: '/weather',
      category: 'features',
    },
    {
      label: t('nav.aiHub', 'AI Hub'),
      icon: Sparkles,
      path: '/ai-hub',
      category: 'ai',
    },
    {
      label: t('nav.advancedAI', 'Advanced AI'),
      icon: TrendingUp,
      path: '/advanced-ai',
      category: 'ai',
    },
    {
      label: t('nav.outfitGenerator', 'Outfit Generator'),
      icon: Calendar,
      path: '/outfit-generator',
      category: 'ai',
    },
    {
      label: t('nav.analytics', 'Analytics'),
      icon: BarChart3,
      path: '/analytics',
      category: 'insights',
    },
    {
      label: t('nav.wardrobeInsights', 'Wardrobe Insights'),
      icon: Package,
      path: '/wardrobe-insights',
      category: 'insights',
    },
    {
      label: t('nav.2nddresser', '2ndDresser'),
      icon: ShoppingBag,
      path: '/2nddresser',
      category: 'marketplace',
    },
    {
      label: t('nav.messages', 'Messages'),
      icon: MessageSquare,
      path: '/messages',
      category: 'social',
    },
    {
      label: t('nav.social', 'Social'),
      icon: Users,
      path: '/social',
      category: 'social',
    },
    {
      label: t('nav.collections', 'Collections'),
      icon: Heart,
      path: '/collections',
      category: 'organization',
    },
    {
      label: t('nav.settings', 'Settings'),
      icon: Settings,
      path: '/settings',
      category: 'system',
    },
  ];

  const categories = {
    features: t('menu.features', 'Features'),
    ai: t('menu.ai', 'AI Tools'),
    insights: t('menu.insights', 'Insights'),
    marketplace: t('menu.marketplace', 'Marketplace'),
    social: t('menu.social', 'Social'),
    organization: t('menu.organization', 'Organization'),
    system: t('menu.system', 'System'),
  };

  const groupedItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof menuItems>);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 right-4 z-40 md:hidden"
          aria-label="Quick access menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-56 bg-background border shadow-lg z-50"
        sideOffset={8}
      >
        <DropdownMenuLabel className="font-semibold">
          {t('menu.quickAccess', 'Quick Access')}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category}>
            <DropdownMenuLabel className="text-xs text-muted-foreground uppercase px-2 py-1">
              {categories[category as keyof typeof categories]}
            </DropdownMenuLabel>
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.path} to={item.path} onClick={() => setOpen(false)}>
                  <DropdownMenuItem className="cursor-pointer">
                    <Icon className="h-4 w-4 mr-2" />
                    <span>{item.label}</span>
                  </DropdownMenuItem>
                </Link>
              );
            })}
            <DropdownMenuSeparator />
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
