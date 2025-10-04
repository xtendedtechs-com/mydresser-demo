import AIStyleChallenges from "@/components/AIStyleChallenges";
import EnhancedSocialDiscovery from "@/components/EnhancedSocialDiscovery";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const StyleChallengesPage = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Tabs defaultValue="challenges" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="challenges">Style Challenges</TabsTrigger>
          <TabsTrigger value="discovery">Discover Community</TabsTrigger>
        </TabsList>

        <TabsContent value="challenges" className="mt-6">
          <AIStyleChallenges />
        </TabsContent>

        <TabsContent value="discovery" className="mt-6">
          <EnhancedSocialDiscovery />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StyleChallengesPage;
