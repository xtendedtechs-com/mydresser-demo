import { Home, ShoppingBag, Shirt, Plus, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const tabs = [
    { id: "home", icon: Home, label: "Home" },
    { id: "marketplace", icon: ShoppingBag, label: "Market" },
    { id: "wardrobe", icon: Shirt, label: "Wardrobe" },
    { id: "add", icon: Plus, label: "Add" },
    { id: "account", icon: User, label: "Account" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-2 z-50">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {tabs.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={cn(
              "flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-all duration-200",
              activeTab === id
                ? "text-fashion-orange"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon size={20} />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;