import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
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
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          size="icon"
          className="fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full shadow-lg animate-pulse hover:animate-none"
          aria-label="Quick access menu"
        >
          <Zap className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 sm:w-96">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            {t('menu.quickAccess', 'Quick Access')}
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)] mt-6">
          <div className="space-y-6 pr-4">
            {Object.entries(groupedItems).map(([category, items]) => (
              <div key={category} className="space-y-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
                  {categories[category as keyof typeof categories]}
                </h3>
                <div className="space-y-1">
                  {items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link 
                        key={item.path} 
                        to={item.path} 
                        onClick={() => setOpen(false)}
                        className="block"
                      >
                        <Button
                          variant="ghost"
                          className="w-full justify-start h-auto py-3 px-4 hover:bg-accent transition-colors"
                        >
                          <Icon className="h-5 w-5 mr-3 text-muted-foreground" />
                          <span className="text-sm font-medium">{item.label}</span>
                        </Button>
                      </Link>
                    );
                  })}
                </div>
                {category !== 'system' && <Separator className="my-2" />}
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
