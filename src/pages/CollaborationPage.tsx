import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Trophy, Target } from "lucide-react";
import Navigation from "@/components/Navigation";
import { CollaborativeOutfitBuilder } from "@/components/CollaborativeOutfitBuilder";
import { StyleChallengesHub } from "@/components/StyleChallengesHub";

const CollaborationPage = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            Style Together
          </h1>
          <p className="text-text-muted">
            Collaborate with friends and join style challenges
          </p>
        </div>

        <Tabs defaultValue="collaborate" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="collaborate" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Collaborate</span>
            </TabsTrigger>
            <TabsTrigger value="challenges" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              <span>Challenges</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="collaborate">
            <CollaborativeOutfitBuilder />
          </TabsContent>

          <TabsContent value="challenges">
            <StyleChallengesHub />
          </TabsContent>
        </Tabs>
      </div>
      <Navigation />
    </div>
  );
};

export default CollaborationPage;
