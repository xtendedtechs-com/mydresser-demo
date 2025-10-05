import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
import { Badge } from '@/components/ui/badge';
import {
  Menu,
  Home,
  Shirt,
  ShoppingBag,
  Users,
  MessageSquare,
  Heart,
  Package,
  Calendar,
  BarChart3,
  Settings,
  Brain,
  Sparkles,
  TrendingUp,
  History,
  Cloud,
  Store,
  ChevronRight,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useProfile } from '@/hooks/useProfile';
import { cn } from '@/lib/utils';

export const MainSideMenu = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { profile } = useProfile();

  const menuSections = [
    {
      title: t('menu.main', 'Main'),
      items: [
        { label: t('nav.home', 'Home'), icon: Home, path: '/' },
        { label: t('nav.wardrobe', 'Wardrobe'), icon: Shirt, path: '/wardrobe' },
        { label: t('nav.market', 'Market'), icon: ShoppingBag, path: '/market' },
      ],
    },
    {
      title: t('menu.ai', 'AI Tools'),
      items: [
        { label: 'AI Hub', icon: Brain, path: '/ai-hub' },
        { label: t('nav.aiChat', 'AI Chat'), icon: Sparkles, path: '/ai-chat' },
        { label: t('nav.advancedAI', 'Advanced AI'), icon: TrendingUp, path: '/advanced-ai' },
        { label: t('nav.outfitGenerator', 'Outfit Generator'), icon: Calendar, path: '/outfit-generator' },
      ],
    },
    {
      title: t('menu.social', 'Social'),
      items: [
        { label: t('nav.social', 'Social Hub'), icon: Users, path: '/social' },
        { label: t('nav.messages', 'Messages'), icon: MessageSquare, path: '/messages' },
        { label: t('nav.community', 'Community'), icon: Users, path: '/community' },
      ],
    },
    {
      title: t('menu.insights', 'Insights & Analytics'),
      items: [
        { label: t('nav.analytics', 'Analytics'), icon: BarChart3, path: '/analytics' },
        { label: t('nav.wardrobeInsights', 'Wardrobe Insights'), icon: Package, path: '/wardrobe-insights' },
        { label: t('nav.outfitHistory', 'Outfit History'), icon: History, path: '/outfit-history' },
        { label: t('weather.title', 'Weather'), icon: Cloud, path: '/weather' },
      ],
    },
    {
      title: t('menu.organization', 'Organization'),
      items: [
        { label: t('nav.collections', 'Collections'), icon: Heart, path: '/collections' },
        { label: t('nav.2nddresser', '2ndDresser'), icon: Store, path: '/2nddresser' },
      ],
    },
    {
      title: t('menu.system', 'System'),
      items: [
        { label: t('nav.settings', 'Settings'), icon: Settings, path: '/settings' },
      ],
    },
  ];

  // Add merchant section if user is a merchant
  if (profile?.role === 'merchant') {
    menuSections.splice(1, 0, {
      title: 'Merchant',
      items: [
        { label: 'POS Terminal', icon: Store, path: '/terminal' },
      ],
    });
  }

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 right-4 z-40"
          aria-label="Main menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 sm:w-96 p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <Menu className="h-6 w-6" />
            MyDresser
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-5rem)]">
          <div className="p-6 space-y-6">
            {menuSections.map((section, index) => (
              <div key={section.title} className="space-y-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setOpen(false)}
                        className="block"
                      >
                        <Button
                          variant={active ? "secondary" : "ghost"}
                          className={cn(
                            "w-full justify-start h-auto py-3 px-4 group transition-all",
                            active && "bg-accent font-semibold"
                          )}
                        >
                          <Icon
                            className={cn(
                              "h-5 w-5 mr-3 transition-colors",
                              active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                            )}
                          />
                          <span className="flex-1 text-left text-sm">{item.label}</span>
                          {active && <ChevronRight className="h-4 w-4 text-primary" />}
                        </Button>
                      </Link>
                    );
                  })}
                </div>
                {index < menuSections.length - 1 && <Separator className="my-3" />}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* User Profile Section */}
        {profile && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background">
            <Link to="/account" onClick={() => setOpen(false)}>
              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">
                    {profile.full_name?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{profile.full_name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{profile.role}</p>
                </div>
                {profile.role === 'merchant' && (
                  <Badge variant="secondary" className="text-xs">Pro</Badge>
                )}
              </div>
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
