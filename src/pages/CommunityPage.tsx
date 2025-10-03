import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StyleChallenges } from '@/components/StyleChallenges';
import { FashionEvents } from '@/components/FashionEvents';
import { InfluencerProgram } from '@/components/InfluencerProgram';
import { Trophy, Calendar, Crown } from 'lucide-react';

const CommunityPage = () => {
  return (
    <div className="min-h-screen bg-background p-6 space-y-6 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <Tabs defaultValue="challenges" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl">
            <TabsTrigger value="challenges" className="gap-2">
              <Trophy className="h-4 w-4" />
              Challenges
            </TabsTrigger>
            <TabsTrigger value="events" className="gap-2">
              <Calendar className="h-4 w-4" />
              Events
            </TabsTrigger>
            <TabsTrigger value="influencer" className="gap-2">
              <Crown className="h-4 w-4" />
              Influencer Program
            </TabsTrigger>
          </TabsList>

          <TabsContent value="challenges" className="mt-6">
            <StyleChallenges />
          </TabsContent>

          <TabsContent value="events" className="mt-6">
            <FashionEvents />
          </TabsContent>

          <TabsContent value="influencer" className="mt-6">
            <InfluencerProgram />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CommunityPage;
