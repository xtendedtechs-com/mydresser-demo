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
      {/* Top Header with Menu and Notifications */}
      <div className="fixed top-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-b border-border z-50 safe-area-inset-top">
        <div className="flex justify-between items-center px-4 py-3">
          <MainSideMenu />
          <EnhancedNotificationBell />
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-area-inset">
        <div className="flex justify-around items-center max-w-md mx-auto px-2 py-2">
          {navItems.map(({ name, href, icon: Icon, id }) => {
            const isActive = location.pathname === href || 
                            (href !== "/" && location.pathname.startsWith(href));
            
            return (
              <Link
                key={id}
                to={href}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-lg transition-all duration-200 flex-1 min-w-0",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon size={18} className="flex-shrink-0" />
                <span className="text-xs font-medium truncate w-full text-center">{name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default Navigation;
