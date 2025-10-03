import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SmartSearch } from "@/components/SmartSearch";
import { TrendDiscovery } from "@/components/TrendDiscovery";
import { PersonalizedFeed } from "@/components/PersonalizedFeed";
import { Search, TrendingUp, Sparkles } from "lucide-react";

export default function DiscoverPage() {
  return (
    <div className="container mx-auto p-4 pb-20 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Discover</h1>
        <p className="text-muted-foreground">
          Explore trends, search your wardrobe, and get personalized recommendations
        </p>
      </div>

      <Tabs defaultValue="search" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Search</span>
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Trends</span>
          </TabsTrigger>
          <TabsTrigger value="feed" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">For You</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-6">
          <SmartSearch />
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <TrendDiscovery />
        </TabsContent>

        <TabsContent value="feed" className="space-y-6">
          <PersonalizedFeed />
        </TabsContent>
      </Tabs>
    </div>
  );
}
