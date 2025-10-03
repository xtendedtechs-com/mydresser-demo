import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Camera, Sparkles, TrendingUp, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SearchResult {
  id: string;
  type: "wardrobe" | "market" | "outfit" | "trend";
  title: string;
  description: string;
  image: string;
  tags: string[];
  relevance: number;
}

export const SmartSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();

  const popularSearches = [
    "casual summer outfits",
    "business formal",
    "vintage denim",
    "minimalist style",
    "workout gear",
    "evening wear",
  ];

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      // Simulate AI-powered search
      await new Promise((resolve) => setTimeout(resolve, 800));

      const mockResults: SearchResult[] = [
        {
          id: "1",
          type: "wardrobe",
          title: "Navy Blue Blazer",
          description: "Classic navy blazer, perfect for business meetings",
          image: "/placeholder.svg",
          tags: ["formal", "business", "navy"],
          relevance: 0.95,
        },
        {
          id: "2",
          type: "outfit",
          title: "Smart Casual Monday",
          description: "Perfect blend of professional and comfortable",
          image: "/placeholder.svg",
          tags: ["casual", "smart", "versatile"],
          relevance: 0.88,
        },
        {
          id: "3",
          type: "market",
          title: "Designer White Shirt",
          description: "Premium cotton shirt, like new condition",
          image: "/placeholder.svg",
          tags: ["formal", "white", "designer"],
          relevance: 0.82,
        },
      ];

      setResults(mockResults);
      toast({
        title: "Search Complete",
        description: `Found ${mockResults.length} results for "${query}"`,
      });
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Error",
        description: "Failed to search. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleVisualSearch = () => {
    toast({
      title: "Visual Search",
      description: "Upload an image to find similar items",
    });
  };

  const handleQuickSearch = (searchTerm: string) => {
    setQuery(searchTerm);
    handleSearch();
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "wardrobe":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-300";
      case "market":
        return "bg-green-500/10 text-green-700 dark:text-green-300";
      case "outfit":
        return "bg-purple-500/10 text-purple-700 dark:text-purple-300";
      case "trend":
        return "bg-orange-500/10 text-orange-700 dark:text-orange-300";
      default:
        return "bg-muted";
    }
  };

  const filteredResults = results.filter((result) => {
    if (activeTab === "all") return true;
    return result.type === activeTab;
  });

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search your wardrobe, outfits, trends..."
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} disabled={isSearching}>
              <Sparkles className="mr-2 h-4 w-4" />
              AI Search
            </Button>
            <Button variant="outline" onClick={handleVisualSearch}>
              <Camera className="h-4 w-4" />
            </Button>
            <Button variant="outline">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {/* Popular Searches */}
          {!results.length && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Popular searches:</p>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((search) => (
                  <Badge
                    key={search}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary/10"
                    onClick={() => handleQuickSearch(search)}
                  >
                    {search}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="wardrobe">Wardrobe</TabsTrigger>
                <TabsTrigger value="outfit">Outfits</TabsTrigger>
                <TabsTrigger value="market">Market</TabsTrigger>
                <TabsTrigger value="trend">Trends</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-6">
                <div className="space-y-4">
                  {filteredResults.map((result) => (
                    <div
                      key={result.id}
                      className="flex gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <img
                        src={result.image}
                        alt={result.title}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="font-semibold">{result.title}</h3>
                          <Badge className={getTypeColor(result.type)}>
                            {result.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {result.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {result.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Relevance</p>
                          <p className="text-lg font-bold text-primary">
                            {(result.relevance * 100).toFixed(0)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
