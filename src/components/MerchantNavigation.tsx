import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  Store,
  Users,
  FileText,
  TrendingUp,
  MessageSquare,
  Menu,
  X,
  Wrench
} from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const merchantLinks = [
  {
    title: "Dashboard",
    href: "/terminal",
    icon: LayoutDashboard,
  },
  {
    title: "POS Register",
    href: "/terminal/register",
    icon: ShoppingCart,
  },
  {
    title: "Inventory",
    href: "/terminal/inventory",
    icon: Package,
  },
  {
    title: "Orders",
    href: "/terminal/orders",
    icon: FileText,
  },
  {
    title: "Customers",
    href: "/terminal/customers",
    icon: Users,
  },
  {
    title: "Financial",
    href: "/terminal/financial",
    icon: TrendingUp,
  },
  {
    title: "Partners",
    href: "/terminal/partnerships",
    icon: Store,
  },
  {
    title: "Marketing",
    href: "/terminal/marketing",
    icon: TrendingUp,
  },
  {
    title: "Page",
    href: "/terminal/page",
    icon: MessageSquare,
  },
  {
    title: "Tools",
    href: "/terminal/tools",
    icon: Wrench,
  },
  {
    title: "Analytics",
    href: "/terminal/analytics",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/terminal/settings",
    icon: Settings,
  },
  {
    title: "Support",
    href: "/terminal/support",
    icon: MessageSquare,
  },
];

export function MerchantNavigation() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const NavLinks = ({ mobile = false }) => (
    <nav className={cn("space-y-1", mobile && "flex flex-col")}>
      {merchantLinks.map((link) => {
        const Icon = link.icon;
        const isActive = location.pathname === link.href;
        
        return (
          <Link
            key={link.href}
            to={link.href}
            onClick={() => mobile && setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
              isActive && "bg-accent text-accent-foreground font-medium"
            )}
          >
            <Icon className="h-4 w-4" />
            {link.title}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50 border-r bg-background">
        <div className="flex h-16 items-center border-b px-6">
          <Store className="h-6 w-6 text-primary" />
          <span className="ml-2 text-lg font-bold">MyDresser POS</span>
        </div>
        <div className="flex-1 overflow-auto py-4 px-3">
          <NavLinks />
        </div>
        <div className="border-t p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span>Terminal Active</span>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 z-50 w-full border-b bg-background">
        <div className="flex h-16 items-center px-4">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex h-16 items-center border-b px-6">
                <Store className="h-6 w-6 text-primary" />
                <span className="ml-2 text-lg font-bold">MyDresser POS</span>
              </div>
              <div className="overflow-auto py-4 px-3">
                <NavLinks mobile />
              </div>
            </SheetContent>
          </Sheet>
          <div className="flex items-center ml-4">
            <Store className="h-6 w-6 text-primary" />
            <span className="ml-2 font-bold">MyDresser POS</span>
          </div>
        </div>
      </header>

      {/* Spacer for fixed navigation */}
      <div className="md:pl-64 pt-16 md:pt-0" />
    </>
  );
}
