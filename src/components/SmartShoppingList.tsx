import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Plus, Trash2, DollarSign, Target, TrendingUp, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShoppingItem {
  id: string;
  name: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  estimatedPrice: number;
  purchased: boolean;
  reason: string;
}

export function SmartShoppingList() {
  const [items, setItems] = useState<ShoppingItem[]>([
    {
      id: "1",
      name: "Navy Blazer",
      category: "Outerwear",
      priority: 'high',
      estimatedPrice: 200,
      purchased: false,
      reason: "Essential for professional wardrobe"
    },
    {
      id: "2",
      name: "White Sneakers",
      category: "Shoes",
      priority: 'medium',
      estimatedPrice: 85,
      purchased: false,
      reason: "Versatile casual footwear"
    },
    {
      id: "3",
      name: "Dark Jeans",
      category: "Bottoms",
      priority: 'high',
      estimatedPrice: 120,
      purchased: true,
      reason: "Wardrobe staple"
    }
  ]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [budget] = useState(1000);
  const { toast } = useToast();

  const totalEstimated = items.reduce((sum, item) => sum + item.estimatedPrice, 0);
  const totalSpent = items.filter(item => item.purchased).reduce((sum, item) => sum + item.estimatedPrice, 0);
  const remaining = budget - totalSpent;
  const budgetUsed = (totalSpent / budget) * 100;

  const handleAddItem = () => {
    if (!newItemName.trim() || !newItemPrice) return;

    const newItem: ShoppingItem = {
      id: Date.now().toString(),
      name: newItemName,
      category: "Uncategorized",
      priority: 'medium',
      estimatedPrice: parseFloat(newItemPrice),
      purchased: false,
      reason: "Added manually"
    };

    setItems([...items, newItem]);
    setNewItemName("");
    setNewItemPrice("");

    toast({
      title: "Item added",
      description: `${newItemName} added to your shopping list`,
    });
  };

  const handleTogglePurchased = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, purchased: !item.purchased } : item
    ));
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
    toast({
      title: "Item removed",
      description: "Item removed from shopping list",
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Budget Overview</CardTitle>
          <CardDescription>Track your shopping budget and spending</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Target className="h-4 w-4" />
                Total Budget
              </div>
              <p className="text-2xl font-bold">${budget}</p>
            </div>
            
            <div className="p-4 rounded-lg bg-muted">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <DollarSign className="h-4 w-4" />
                Spent
              </div>
              <p className="text-2xl font-bold">${totalSpent}</p>
            </div>
            
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4" />
                Remaining
              </div>
              <p className="text-2xl font-bold text-green-600">${remaining}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Budget Used</span>
              <span className="font-medium">{budgetUsed.toFixed(0)}%</span>
            </div>
            <Progress value={budgetUsed} className="h-2" />
          </div>

          {budgetUsed > 80 && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
              <div className="flex-1 text-sm">
                <p className="font-medium">Budget Alert</p>
                <p className="text-muted-foreground text-xs mt-1">
                  You've used {budgetUsed.toFixed(0)}% of your shopping budget
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Shopping List</CardTitle>
          <CardDescription>
            {items.filter(i => !i.purchased).length} items to buy • {items.filter(i => i.purchased).length} purchased
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Item name"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
            />
            <Input
              type="number"
              placeholder="Price"
              value={newItemPrice}
              onChange={(e) => setNewItemPrice(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
              className="max-w-[120px]"
            />
            <Button onClick={handleAddItem} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            {items.sort((a, b) => {
              if (a.purchased !== b.purchased) return a.purchased ? 1 : -1;
              const priorityOrder = { high: 0, medium: 1, low: 2 };
              return priorityOrder[a.priority] - priorityOrder[b.priority];
            }).map((item) => (
              <div
                key={item.id}
                className={`flex items-start gap-3 p-3 rounded-lg border ${
                  item.purchased ? 'opacity-60 bg-muted/50' : 'bg-card'
                }`}
              >
                <Checkbox
                  checked={item.purchased}
                  onCheckedChange={() => handleTogglePurchased(item.id)}
                  className="mt-1"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-medium ${item.purchased ? 'line-through' : ''}`}>
                        {item.name}
                      </h4>
                      <p className="text-xs text-muted-foreground">{item.reason}</p>
                    </div>
                    <Badge variant={getPriorityColor(item.priority)} className="flex-shrink-0">
                      {item.priority}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-medium">${item.estimatedPrice}</span>
                    <Badge variant="outline" className="text-xs">
                      {item.category}
                    </Badge>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveItem(item.id)}
                  className="flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {items.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingBag className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Your shopping list is empty</p>
              <p className="text-sm">Add items to start planning your purchases</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ShoppingBag(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}
