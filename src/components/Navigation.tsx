import { Home, ShoppingBag, Shirt, Plus, User, Brain } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useProfile } from "@/hooks/useProfile";
import { EnhancedNotificationBell } from './EnhancedNotificationBell';
import { MainSideMenu } from './MainSideMenu';
import { useTranslation } from 'react-i18next';

interface NavigationProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const location = useLocation();
  const { profile } = useProfile();
  const { t } = useTranslation();
  
  const baseNavItems = [
    { 
      name: t('nav.home'), 
      href: "/", 
      icon: Home,
      id: "home"
    },
    { 
      name: t('nav.wardrobe'), 
      href: "/wardrobe", 
      icon: Shirt,
      id: "wardrobe"
    },
    { 
      name: t('common.add'), 
      href: "/add", 
      icon: Plus,
      id: "add"
    },
    { 
      name: t('nav.market'), 
      href: "/market", 
      icon: ShoppingBag,
      id: "market"
    },
    { 
      name: t('nav.account'), 
      href: "/account", 
      icon: User,
      id: "account"
    }
  ];

  // Show 5 tabs: Home, Wardrobe, Add, Market, Account
  const navItems = baseNavItems;

  return (
    <>
      {/* Top Header with Menu and Notifications - iOS Glass Effect */}
      <div className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-[var(--backdrop-blur)] border-b border-border/50 z-50 safe-area-inset-top shadow-[var(--shadow-sm)]">
        <div className="flex justify-between items-center px-4 py-3 animate-fade-in">
          <MainSideMenu />
          <EnhancedNotificationBell />
        </div>
      </div>

      {/* Bottom Navigation - iOS Floating Style */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-inset px-4 pb-4 pointer-events-none">
        <div className="bg-card/95 backdrop-blur-[var(--backdrop-blur)] border border-border/50 rounded-[20px] shadow-[var(--shadow-lg)] max-w-md mx-auto pointer-events-auto">
          <div className="flex justify-around items-center px-2 py-3">
            {navItems.map(({ name, href, icon: Icon, id }) => {
              const isActive = location.pathname === href || 
                              (href !== "/" && location.pathname.startsWith(href));
              
              return (
                <Link
                  key={id}
                  to={href}
                  className={cn(
                    "flex flex-col items-center gap-1 py-2 px-3 rounded-[12px] transition-smooth flex-1 min-w-0 active:scale-95",
                    isActive
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  )}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  <span className="text-xs font-semibold truncate w-full text-center">{name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navigation;
