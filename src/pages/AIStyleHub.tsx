import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIStyleConsultant } from "@/components/AIStyleConsultant";
import { StyleTransformationTool } from "@/components/StyleTransformationTool";
import { PersonalStyleReport } from "@/components/PersonalStyleReport";
import { Sparkles, Wand2, FileText } from "lucide-react";

export default function AIStyleHub() {
  return (
    <div className="container mx-auto p-4 pb-20 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">AI Style Hub</h1>
        <p className="text-muted-foreground">
          Your personal AI-powered style consultant and fashion advisor
        </p>
      </div>

      <Tabs defaultValue="consultant" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="consultant" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Style Chat</span>
          </TabsTrigger>
          <TabsTrigger value="transformation" className="flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            <span className="hidden sm:inline">Transform</span>
          </TabsTrigger>
          <TabsTrigger value="report" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Report</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="consultant" className="space-y-4">
          <div className="h-[calc(100vh-240px)]">
            <AIStyleConsultant />
          </div>
        </TabsContent>

        <TabsContent value="transformation" className="space-y-4">
          <StyleTransformationTool />
        </TabsContent>

        <TabsContent value="report" className="space-y-4">
          <PersonalStyleReport />
        </TabsContent>
      </Tabs>
    </div>
  );
}
