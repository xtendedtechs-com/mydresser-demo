import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, DollarSign, MapPin, Languages } from "lucide-react";
import MultiCurrencySettings from "@/components/MultiCurrencySettings";
import ShippingZonesManager from "@/components/ShippingZonesManager";
import { LanguageRegionalSettings } from "@/components/settings/LanguageRegionalSettings";

const InternationalSettingsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4 max-w-6xl">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Globe className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">International Settings</h1>
          </div>
          <p className="text-muted-foreground">
            Configure multi-currency support and international shipping options
          </p>
        </div>

        <Tabs defaultValue="language" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
            <TabsTrigger value="language" className="flex items-center gap-2">
              <Languages className="w-4 h-4" />
              Language
            </TabsTrigger>
            <TabsTrigger value="currency" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Currency
            </TabsTrigger>
            <TabsTrigger value="shipping" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Shipping
            </TabsTrigger>
          </TabsList>

          <TabsContent value="language" className="space-y-6">
            <LanguageRegionalSettings />
          </TabsContent>

          <TabsContent value="currency" className="space-y-6">
            <MultiCurrencySettings />
          </TabsContent>

          <TabsContent value="shipping" className="space-y-6">
            <ShippingZonesManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default InternationalSettingsPage;
