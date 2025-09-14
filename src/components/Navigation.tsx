import { Home, ShoppingBag, Shirt, Plus, User, Store } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavigationProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const location = useLocation();
  
  const navItems = [
    { 
      name: "Home", 
      href: "/", 
      icon: Home,
      id: "home"
    },
    { 
      name: "Market", 
      href: "/marketplace", 
      icon: ShoppingBag,
      id: "market"
    },
    { 
      name: "Wardrobe", 
      href: "/wardrobe/enhanced", 
      icon: Shirt,
      id: "wardrobe"
    },
    { 
      name: "Terminal", 
      href: "/merchant-terminal", 
      icon: Store,
      id: "terminal"
    },
    { 
      name: "Account", 
      href: "/account", 
      icon: User,
      id: "account"
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-2 z-50">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map(({ name, href, icon: Icon, id }) => {
          const isActive = location.pathname === href || 
                          (href !== "/" && location.pathname.startsWith(href));
          
          return (
            <Link
              key={id}
              to={href}
              className={cn(
                "flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-all duration-200",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon size={20} />
              <span className="text-xs font-medium">{name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;