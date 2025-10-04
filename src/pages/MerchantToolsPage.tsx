import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DresserPlusAI } from '@/components/merchant/DresserPlusAI';
import { MyStylistAI } from '@/components/merchant/MyStylistAI';
import AdvancedMerchantTools from '@/components/AdvancedMerchantTools';
import { Sparkles, Palette, Zap } from 'lucide-react';

const MerchantToolsPage = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Business Tools</h1>
        <p className="text-muted-foreground">
          Advanced AI-powered tools for fashion innovation and business optimization
        </p>
      </div>

      <Tabs defaultValue="dresser-plus" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dresser-plus" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Dresser+ AI
          </TabsTrigger>
          <TabsTrigger value="mystylist" className="gap-2">
            <Palette className="h-4 w-4" />
            MyStylist AI
          </TabsTrigger>
          <TabsTrigger value="operations" className="gap-2">
            <Zap className="h-4 w-4" />
            Operations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dresser-plus">
          <DresserPlusAI />
        </TabsContent>

        <TabsContent value="mystylist">
          <MyStylistAI />
        </TabsContent>

        <TabsContent value="operations">
          <AdvancedMerchantTools />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MerchantToolsPage;
