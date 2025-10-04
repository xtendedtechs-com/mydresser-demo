import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, TrendingUp, Users } from "lucide-react";
import PersonalizedRecommendations from "@/components/PersonalizedRecommendations";
import { WearFrequencyAnalyzer } from "@/components/WearFrequencyAnalyzer";
import { StyleEvolutionTracker } from "@/components/StyleEvolutionTracker";

const PersonalizationHub = () => {
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-primary/10">
            <Brain className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Personalization Hub</h1>
            <p className="text-muted-foreground">
              AI-powered recommendations tailored to your unique style
            </p>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">ML Personalization</h3>
              <p className="text-sm text-muted-foreground">
                Learns from your choices and preferences
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Collaborative Filtering</h3>
              <p className="text-sm text-muted-foreground">
                Finds users with similar taste
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Smart Insights</h3>
              <p className="text-sm text-muted-foreground">
                Discovers patterns in your wardrobe
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="recommendations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="insights">Style Insights</TabsTrigger>
          <TabsTrigger value="evolution">Style Evolution</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations">
          <PersonalizedRecommendations />
        </TabsContent>

        <TabsContent value="insights">
          <WearFrequencyAnalyzer />
        </TabsContent>

        <TabsContent value="evolution">
          <StyleEvolutionTracker />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PersonalizationHub;
