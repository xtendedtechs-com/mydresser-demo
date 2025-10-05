import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OutfitHistoryCalendar } from "@/components/outfit/OutfitHistoryCalendar";
import { WearAnalytics } from "@/components/analytics/WearAnalytics";
import { Calendar, BarChart3, History } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function OutfitHistoryPage() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto p-4 pb-20 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <History className="h-8 w-8" />
          {t('nav.outfitHistory', 'Outfit History')}
        </h1>
        <p className="text-muted-foreground">
          {t('outfit.historyDescription', 'Track what you wear and analyze your wardrobe usage')}
        </p>
      </div>

      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">{t('common.calendar', 'Calendar')}</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">{t('common.analytics', 'Analytics')}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-6">
          <OutfitHistoryCalendar />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <WearAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}
