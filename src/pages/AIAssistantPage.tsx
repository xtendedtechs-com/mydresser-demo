import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AIStyleChat } from '@/components/AIStyleChat';
import { SmartOutfitRecommendations } from '@/components/SmartOutfitRecommendations';
import { Sparkles, Lightbulb, Wand2 } from 'lucide-react';

const AIAssistantPage = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Sparkles className="w-8 h-8" />
              AI Style Assistant
            </h1>
            <p className="text-muted-foreground">Your personal AI fashion consultant</p>
          </div>
        </div>

        <Tabs defaultValue="chat" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chat" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Style Chat
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="gap-2">
              <Lightbulb className="w-4 h-4" />
              Outfit Ideas
            </TabsTrigger>
            <TabsTrigger value="insights" className="gap-2">
              <Wand2 className="w-4 h-4" />
              Wardrobe Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat">
            <AIStyleChat />
          </TabsContent>

          <TabsContent value="recommendations">
            <SmartOutfitRecommendations />
          </TabsContent>

          <TabsContent value="insights">
            <div className="text-center p-8 text-muted-foreground">
              <Wand2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Wardrobe insights coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AIAssistantPage;
