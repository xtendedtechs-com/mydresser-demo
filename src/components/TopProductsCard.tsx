import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Package } from "lucide-react";

const topProducts = [
  { name: "Classic White Shirt", sales: 145, revenue: 7250, growth: 12 },
  { name: "Black Leather Jacket", sales: 98, revenue: 19600, growth: 8 },
  { name: "Blue Denim Jeans", sales: 156, revenue: 12480, growth: 15 },
  { name: "Summer Floral Dress", sales: 87, revenue: 6960, growth: -3 },
  { name: "Running Sneakers", sales: 134, revenue: 16080, growth: 20 },
];

export const TopProductsCard = () => {
  const maxSales = Math.max(...topProducts.map((p) => p.sales));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Top Products
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {topProducts.map((product, index) => (
          <div key={product.name} className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    #{index + 1}
                  </Badge>
                  <p className="font-medium truncate">{product.name}</p>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span>{product.sales} sales</span>
                  <span>${product.revenue.toLocaleString()}</span>
                  <span
                    className={`flex items-center gap-1 ${
                      product.growth > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    <TrendingUp className="h-3 w-3" />
                    {product.growth > 0 ? "+" : ""}
                    {product.growth}%
                  </span>
                </div>
              </div>
            </div>
            <Progress value={(product.sales / maxSales) * 100} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
