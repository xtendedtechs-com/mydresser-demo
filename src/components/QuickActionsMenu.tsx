import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Zap, PlusCircle, Camera, Sparkles, ShoppingBag, Target,
  BarChart3, Search, MessageSquare, Calendar
} from "lucide-react";

export function QuickActionsMenu() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const quickActions = [
    {
      icon: PlusCircle,
      label: "Add Item",
      description: "Upload to wardrobe",
      action: () => navigate("/add"),
      shortcut: "⌘N"
    },
    {
      icon: Camera,
      label: "Scan Item",
      description: "AI camera scan",
      action: () => navigate("/add"),
      shortcut: "⌘S"
    },
    {
      icon: Sparkles,
      label: "Daily Outfit",
      description: "Generate outfit",
      action: () => navigate("/outfit-generator"),
      shortcut: "⌘O"
    },
    {
      icon: MessageSquare,
      label: "AI Shopping",
      description: "Get advice",
      action: () => navigate("/personal-shopping"),
      shortcut: "⌘A"
    },
    {
      icon: ShoppingBag,
      label: "Browse Market",
      description: "Discover items",
      action: () => navigate("/market"),
      shortcut: "⌘M"
    },
    {
      icon: BarChart3,
      label: "View Analytics",
      description: "Your insights",
      action: () => navigate("/analytics"),
      shortcut: "⌘I"
    },
  ];

  const handleAction = (action: () => void) => {
    setOpen(false);
    action();
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="default"
          size="icon"
          className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg z-40 md:bottom-4"
        >
          <Zap className="h-6 w-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          {quickActions.slice(0, 3).map((action) => {
            const Icon = action.icon;
            return (
              <DropdownMenuItem
                key={action.label}
                onClick={() => handleAction(action.action)}
                className="flex items-start gap-3 py-3"
              >
                <div className="mt-0.5 h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{action.label}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
                <DropdownMenuShortcut>{action.shortcut}</DropdownMenuShortcut>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          {quickActions.slice(3).map((action) => {
            const Icon = action.icon;
            return (
              <DropdownMenuItem
                key={action.label}
                onClick={() => handleAction(action.action)}
                className="flex items-start gap-3 py-3"
              >
                <div className="mt-0.5 h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{action.label}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
                <DropdownMenuShortcut>{action.shortcut}</DropdownMenuShortcut>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => {
            setOpen(false);
            // Trigger command palette
            const event = new KeyboardEvent('keydown', {
              key: 'k',
              metaKey: true,
              bubbles: true
            });
            document.dispatchEvent(event);
          }}
          className="flex items-center gap-2"
        >
          <Search className="h-4 w-4" />
          Search Everything
          <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
