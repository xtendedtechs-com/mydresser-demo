import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Keyboard, Command } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

const shortcuts: Shortcut[] = [
  // Global
  { keys: ["⌘", "K"], description: "Open command palette", category: "Global" },
  { keys: ["?"], description: "Show keyboard shortcuts", category: "Global" },
  { keys: ["Esc"], description: "Close dialogs/menus", category: "Global" },
  
  // Navigation
  { keys: ["G", "H"], description: "Go to Home", category: "Navigation" },
  { keys: ["G", "W"], description: "Go to Wardrobe", category: "Navigation" },
  { keys: ["G", "M"], description: "Go to Market", category: "Navigation" },
  { keys: ["G", "S"], description: "Go to Social", category: "Navigation" },
  { keys: ["G", "A"], description: "Go to Account", category: "Navigation" },
  { keys: ["G", "O"], description: "Go to Outfit History", category: "Navigation" },
  { keys: ["G", "E"], description: "Go to Weather", category: "Navigation" },
  
  // Quick Actions
  { keys: ["⌘", "N"], description: "Add new item", category: "Quick Actions" },
  { keys: ["⌘", "S"], description: "Scan with camera", category: "Quick Actions" },
  { keys: ["⌘", "O"], description: "Generate outfit", category: "Quick Actions" },
  { keys: ["⌘", "A"], description: "AI Shopping assistant", category: "Quick Actions" },
  { keys: ["⌘", "M"], description: "Browse marketplace", category: "Quick Actions" },
  { keys: ["⌘", "I"], description: "View analytics", category: "Quick Actions" },
  
  // Interface
  { keys: ["⌘", "/"], description: "Focus search", category: "Interface" },
  { keys: ["⌘", ","], description: "Open settings", category: "Interface" },
  { keys: ["⌘", "B"], description: "Toggle sidebar", category: "Interface" },
];

export function KeyboardShortcutsHelper() {
  const [open, setOpen] = useState(false);

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, Shortcut[]>);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed bottom-32 right-4 h-12 w-12 rounded-full shadow-lg z-40 md:bottom-20 bg-background border"
        >
          <Keyboard className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Command className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use these shortcuts to navigate MyDresser faster
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-6">
            {Object.entries(groupedShortcuts).map(([category, items]) => (
              <div key={category}>
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
                  {category}
                </h3>
                <div className="space-y-2">
                  {items.map((shortcut, index) => (
                    <div
                      key={`${category}-${index}`}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <span className="text-sm">{shortcut.description}</span>
                      <div className="flex gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <Badge
                            key={keyIndex}
                            variant="outline"
                            className="font-mono text-xs px-2 py-1"
                          >
                            {key}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground text-center">
            Press <Badge variant="outline" className="mx-1 font-mono">?</Badge> anytime to show this dialog
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
