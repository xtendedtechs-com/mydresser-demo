import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Leaf, Star, ShoppingCart, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EcoProduct {
  id: string;
  name: string;
  brand: string;
  price: number;
  sustainabilityScore: number;
  features: string[];
  image: string;
  certifications: string[];
}

export const EcoFriendlyRecommendations = () => {
  const { toast } = useToast();

  const ecoProducts: EcoProduct[] = [
    {
      id: "1",
      name: "Organic Cotton T-Shirt",
      brand: "Patagonia",
      price: 35,
      sustainabilityScore: 95,
      features: ["100% Organic Cotton", "Fair Trade Certified", "Carbon Neutral"],
      image: "/placeholder.svg",
      certifications: ["GOTS", "Fair Trade"],
    },
    {
      id: "2",
      name: "Recycled Denim Jeans",
      brand: "Levi's",
      price: 98,
      sustainabilityScore: 88,
      features: ["40% Recycled Cotton", "Water<Less™", "Circular Design"],
      image: "/placeholder.svg",
      certifications: ["Better Cotton", "Recycled"],
    },
    {
      id: "3",
      name: "Tencel™ Dress",
      brand: "Reformation",
      price: 148,
      sustainabilityScore: 92,
      features: ["Sustainable Tencel", "Eco-Friendly Dye", "Biodegradable"],
      image: "/placeholder.svg",
      certifications: ["FSC", "Carbon Neutral"],
    },
  ];

  const handleSave = (productId: string) => {
    toast({
      title: "Saved",
      description: "Product added to your wishlist",
    });
  };

  const handleShop = (productId: string) => {
    toast({
      title: "Opening Store",
      description: "Redirecting to sustainable retailer...",
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-600";
    if (score >= 80) return "bg-green-500";
    return "bg-green-400";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Leaf className="h-5 w-5 text-green-600" />
          <CardTitle>Eco-Friendly Alternatives</CardTitle>
        </div>
        <CardDescription>
          Sustainable products that match your style and values
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {ecoProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="flex flex-col sm:flex-row gap-4 p-4">
                <div className="relative w-full sm:w-32 h-32 flex-shrink-0">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover rounded"
                  />
                  <div
                    className={`absolute top-2 right-2 ${getScoreColor(
                      product.sustainabilityScore
                    )} text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1`}
                  >
                    <Leaf className="h-3 w-3" />
                    {product.sustainabilityScore}
                  </div>
                </div>

                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">{product.brand}</p>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {product.features.map((feature) => (
                      <Badge key={feature} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    {product.certifications.map((cert) => (
                      <Badge
                        key={cert}
                        className="bg-green-500/10 text-green-700 dark:text-green-300 text-xs"
                      >
                        <Star className="h-3 w-3 mr-1" />
                        {cert}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xl font-bold">${product.price}</span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSave(product.id)}
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button size="sm" onClick={() => handleShop(product.id)}>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Shop Now
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
