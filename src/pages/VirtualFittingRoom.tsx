import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VirtualTryOnStudio } from "@/components/VirtualTryOnStudio";
import { FitPredictionEngine } from "@/components/FitPredictionEngine";
import { SizeGuideComparison } from "@/components/SizeGuideComparison";
import { Scan, Ruler, BookOpen } from "lucide-react";

export default function VirtualFittingRoom() {
  return (
    <div className="container mx-auto p-4 pb-20 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Virtual Fitting Room</h1>
        <p className="text-muted-foreground">
          Try on clothes virtually, predict fit, and find your perfect size
        </p>
      </div>

      <Tabs defaultValue="tryon" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="tryon" className="flex items-center gap-2">
            <Scan className="h-4 w-4" />
            <span className="hidden sm:inline">Try-On</span>
          </TabsTrigger>
          <TabsTrigger value="fit" className="flex items-center gap-2">
            <Ruler className="h-4 w-4" />
            <span className="hidden sm:inline">Fit Prediction</span>
          </TabsTrigger>
          <TabsTrigger value="guide" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Size Guide</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tryon" className="space-y-6">
          <VirtualTryOnStudio />
        </TabsContent>

        <TabsContent value="fit" className="space-y-6">
          <FitPredictionEngine />
        </TabsContent>

        <TabsContent value="guide" className="space-y-6">
          <SizeGuideComparison />
        </TabsContent>
      </Tabs>
    </div>
  );
}
