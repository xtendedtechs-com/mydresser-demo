import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CarbonFootprintTracker } from "@/components/CarbonFootprintTracker";
import { SustainabilityInsights } from "@/components/SustainabilityInsights";
import { EcoFriendlyRecommendations } from "@/components/EcoFriendlyRecommendations";
import { Leaf, TrendingDown, ShoppingBag } from "lucide-react";

export default function SustainabilityPage() {
  return (
    <div className="container mx-auto p-4 pb-20 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Sustainability Impact</h1>
        <p className="text-muted-foreground">
          Track your environmental impact and discover eco-friendly fashion choices
        </p>
      </div>

      <Tabs defaultValue="impact" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="impact" className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4" />
            <span className="hidden sm:inline">Impact</span>
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Leaf className="h-4 w-4" />
            <span className="hidden sm:inline">Insights</span>
          </TabsTrigger>
          <TabsTrigger value="shop" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Eco Shop</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="impact" className="space-y-6">
          <CarbonFootprintTracker />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <SustainabilityInsights />
        </TabsContent>

        <TabsContent value="shop" className="space-y-6">
          <EcoFriendlyRecommendations />
        </TabsContent>
      </Tabs>
    </div>
  );
}
