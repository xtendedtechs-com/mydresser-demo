import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AIStyleConsultant } from '@/components/AIStyleConsultant';
import { AIOutfitSuggestions } from '@/components/AIOutfitSuggestions';
import { Sparkles, MessageCircle, Wand2 } from 'lucide-react';

const AIAssistantPage = () => {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          AI Fashion Assistant
        </h1>
        <p className="text-muted-foreground mt-2">
          Your personal AI stylist powered by advanced fashion intelligence
        </p>
      </div>

      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Style Consultant
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            Outfit Suggestions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="mt-6">
          <AIStyleConsultant />
        </TabsContent>

        <TabsContent value="suggestions" className="mt-6">
          <AIOutfitSuggestions />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIAssistantPage;
