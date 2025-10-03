import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIShoppingAssistant } from "@/components/AIShoppingAssistant";
import { SmartShoppingList } from "@/components/SmartShoppingList";
import { PurchaseDecisionAnalyzer } from "@/components/PurchaseDecisionAnalyzer";
import { MessageSquare, ListChecks, Calculator } from "lucide-react";

export default function PersonalShoppingPage() {
  return (
    <div className="container mx-auto p-4 pb-20 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Personal Shopping Assistant</h1>
        <p className="text-muted-foreground">
          AI-powered shopping guidance, smart lists, and purchase analysis
        </p>
      </div>

      <Tabs defaultValue="assistant" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="assistant" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">AI Assistant</span>
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <ListChecks className="h-4 w-4" />
            <span className="hidden sm:inline">Shopping List</span>
          </TabsTrigger>
          <TabsTrigger value="analyzer" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            <span className="hidden sm:inline">Decision Helper</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assistant" className="space-y-6">
          <AIShoppingAssistant />
        </TabsContent>

        <TabsContent value="list" className="space-y-6">
          <SmartShoppingList />
        </TabsContent>

        <TabsContent value="analyzer" className="space-y-6">
          <PurchaseDecisionAnalyzer />
        </TabsContent>
      </Tabs>
    </div>
  );
}
