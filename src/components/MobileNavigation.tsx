import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  ShoppingBag, 
  Sparkles, 
  User,
  Store
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProfile } from '@/hooks/useProfile';

export const MobileNavigation = () => {
  const location = useLocation();
  const { profile } = useProfile();
  const isMerchant = profile?.role === 'merchant';

  const navItems = isMerchant ? [
    { icon: Home, label: 'Dashboard', path: '/terminal' },
    { icon: Store, label: 'POS', path: '/terminal/pos' },
    { icon: ShoppingBag, label: 'Orders', path: '/terminal/analytics' },
    { icon: User, label: 'Account', path: '/account' }
  ] : [
    { icon: Home, label: 'Home', path: '/' },
    { icon: ShoppingBag, label: 'Wardrobe', path: '/wardrobe' },
    { icon: Sparkles, label: 'AI Hub', path: '/ai-hub' },
    { icon: Store, label: 'Market', path: '/market' },
    { icon: User, label: 'Profile', path: '/account' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden px-4 pb-4 pointer-events-none">
      <div className="bg-card/95 backdrop-blur-[var(--backdrop-blur)] border border-border/50 rounded-[20px] shadow-[var(--shadow-lg)] pointer-events-auto">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-smooth rounded-[12px] active:scale-95",
                  isActive 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
