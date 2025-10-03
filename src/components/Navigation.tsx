import { Home, ShoppingBag, Shirt, Plus, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useProfile } from "@/hooks/useProfile";
import { EnhancedNotificationBell } from './EnhancedNotificationBell';

interface NavigationProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const location = useLocation();
  const { profile } = useProfile();
  
  const baseNavItems = [
    { 
      name: "Home", 
      href: "/", 
      icon: Home,
      id: "home"
    },
    { 
      name: "Wardrobe", 
      href: "/wardrobe", 
      icon: Shirt,
      id: "wardrobe"
    },
    { 
      name: "Add", 
      href: "/add", 
      icon: Plus,
      id: "add"
    },
    { 
      name: "Market", 
      href: "/market", 
      icon: ShoppingBag,
      id: "market"
    },
    { 
      name: "Account", 
      href: "/account", 
      icon: User,
      id: "account"
    }
  ];

  // Only 5 tabs as requested
  const navItems = baseNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex justify-between items-center max-w-md mx-auto px-4 py-2">
        {/* Notification Bell - Always visible on left */}
        <div className="flex-shrink-0">
          <EnhancedNotificationBell />
        </div>

        {/* Navigation Items */}
        <div className="flex justify-around flex-1">
          {navItems.map(({ name, href, icon: Icon, id }) => {
            const isActive = location.pathname === href || 
                            (href !== "/" && location.pathname.startsWith(href));
            
            return (
              <Link
                key={id}
                to={href}
                className={cn(
                  "flex flex-col items-center gap-1 py-2 px-2 rounded-lg transition-all duration-200",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon size={18} />
                <span className="text-xs font-medium">{name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;