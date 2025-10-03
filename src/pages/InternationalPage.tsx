import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LanguageSelector } from '@/components/LanguageSelector';
import { CurrencyConverter } from '@/components/CurrencyConverter';
import { RegionalPreferences } from '@/components/RegionalPreferences';
import { InternationalShipping } from '@/components/InternationalShipping';
import { Globe, DollarSign, MapPin, Plane } from 'lucide-react';

const InternationalPage = () => {
  return (
    <div className="min-h-screen bg-background p-6 space-y-6 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Globe className="h-8 w-8 text-primary" />
              International Settings
            </h1>
            <p className="text-muted-foreground">Customize your global shopping experience</p>
          </div>
          <LanguageSelector />
        </div>

        <Tabs defaultValue="currency" className="w-full">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl">
            <TabsTrigger value="currency" className="gap-2">
              <DollarSign className="h-4 w-4" />
              Currency
            </TabsTrigger>
            <TabsTrigger value="regional" className="gap-2">
              <MapPin className="h-4 w-4" />
              Regional
            </TabsTrigger>
            <TabsTrigger value="shipping" className="gap-2">
              <Plane className="h-4 w-4" />
              Shipping
            </TabsTrigger>
            <TabsTrigger value="language" className="gap-2">
              <Globe className="h-4 w-4" />
              Language
            </TabsTrigger>
          </TabsList>

          <TabsContent value="currency" className="mt-6">
            <div className="max-w-2xl">
              <CurrencyConverter />
            </div>
          </TabsContent>

          <TabsContent value="regional" className="mt-6">
            <div className="max-w-2xl">
              <RegionalPreferences />
            </div>
          </TabsContent>

          <TabsContent value="shipping" className="mt-6">
            <div className="max-w-2xl">
              <InternationalShipping />
            </div>
          </TabsContent>

          <TabsContent value="language" className="mt-6">
            <div className="max-w-2xl">
              <div className="p-6 bg-card rounded-lg border">
                <h3 className="text-xl font-semibold mb-4">Language Settings</h3>
                <p className="text-muted-foreground mb-4">
                  Change your preferred language using the language selector in the top right corner.
                </p>
                <div className="flex justify-center py-8">
                  <LanguageSelector />
                </div>
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <p className="text-sm font-semibold mb-2">Available Languages:</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                    <span>🇺🇸 English</span>
                    <span>🇪🇸 Español</span>
                    <span>🇫🇷 Français</span>
                    <span>🇩🇪 Deutsch</span>
                    <span>🇮🇹 Italiano</span>
                    <span>🇵🇹 Português</span>
                    <span>🇯🇵 日本語</span>
                    <span>🇰🇷 한국어</span>
                    <span>🇨🇳 中文</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default InternationalPage;
