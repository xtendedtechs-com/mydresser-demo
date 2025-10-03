import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ShoppingBag, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const recentOrders = [
  {
    id: "ORD-001",
    customer: "Sarah Johnson",
    items: 3,
    total: 289.99,
    status: "completed",
    date: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: "ORD-002",
    customer: "Michael Chen",
    items: 1,
    total: 199.99,
    status: "processing",
    date: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: "ORD-003",
    customer: "Emma Davis",
    items: 5,
    total: 459.99,
    status: "shipped",
    date: new Date(Date.now() - 1000 * 60 * 60 * 4),
  },
  {
    id: "ORD-004",
    customer: "James Wilson",
    items: 2,
    total: 149.99,
    status: "pending",
    date: new Date(Date.now() - 1000 * 60 * 60 * 6),
  },
];

const statusConfig = {
  completed: { variant: "default" as const, label: "Completed" },
  processing: { variant: "secondary" as const, label: "Processing" },
  shipped: { variant: "outline" as const, label: "Shipped" },
  pending: { variant: "destructive" as const, label: "Pending" },
};

export const RecentOrdersCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          Recent Orders
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentOrders.map((order) => (
          <div
            key={order.id}
            className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1">
              <Avatar>
                <AvatarFallback>{order.customer.charAt(0)}</AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{order.customer}</p>
                  <Badge variant={statusConfig[order.status as keyof typeof statusConfig].variant}>
                    {statusConfig[order.status as keyof typeof statusConfig].label}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                  <span>{order.id}</span>
                  <span>{order.items} items</span>
                  <span>${order.total}</span>
                  <span>{formatDistanceToNow(order.date, { addSuffix: true })}</span>
                </div>
              </div>
            </div>

            <Button size="sm" variant="ghost">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
