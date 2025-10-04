import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeSettingsPanel } from "@/components/settings/ThemeSettingsPanel";
import { PrivacySettingsPanel } from "@/components/settings/PrivacySettingsPanel";
import { NotificationSettingsPanel } from "@/components/settings/NotificationSettingsPanel";
import { WardrobeSettingsPanel } from "@/components/settings/WardrobeSettingsPanel";
import { OutfitSettingsPanel } from "@/components/settings/OutfitSettingsPanel";
import { AISettingsPanel } from "@/components/settings/AISettingsPanel";
import { MyStyleSettingsPanel } from "@/components/settings/MyStyleSettingsPanel";
import SocialSettingsPanel from "@/components/settings/SocialSettingsPanel";
import MarketplaceSettingsPanel from "@/components/settings/MarketplaceSettingsPanel";
import MyMirrorSettingsPanel from "@/components/settings/MyMirrorSettingsPanel";
import ChallengeSettingsPanel from "@/components/settings/ChallengeSettingsPanel";
import AccessibilitySettingsPanel from "@/components/settings/AccessibilitySettingsPanel";
import { MerchantSettingsPanel } from "@/components/settings/MerchantSettingsPanel";
import { PWASettingsPanel } from "@/components/settings/PWASettingsPanel";
import { PaymentSettingsPanel } from "@/components/settings/PaymentSettingsPanel";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: string;
}

const SettingsDialog = ({ open, onOpenChange, defaultTab = "general" }: SettingsDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid grid-cols-3 lg:grid-cols-5 gap-1 h-auto">
            <TabsTrigger value="general" className="text-xs sm:text-sm">General</TabsTrigger>
            <TabsTrigger value="privacy" className="text-xs sm:text-sm">Privacy</TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs sm:text-sm">Notifications</TabsTrigger>
            <TabsTrigger value="wardrobe" className="text-xs sm:text-sm">Wardrobe</TabsTrigger>
            <TabsTrigger value="outfit" className="text-xs sm:text-sm">Outfit</TabsTrigger>
            <TabsTrigger value="ai" className="text-xs sm:text-sm">AI</TabsTrigger>
            <TabsTrigger value="mystyle" className="text-xs sm:text-sm">Style</TabsTrigger>
            <TabsTrigger value="social" className="text-xs sm:text-sm">Social</TabsTrigger>
            <TabsTrigger value="marketplace" className="text-xs sm:text-sm">Market</TabsTrigger>
            <TabsTrigger value="mymirror" className="text-xs sm:text-sm">VTO</TabsTrigger>
            <TabsTrigger value="challenges" className="text-xs sm:text-sm">Challenges</TabsTrigger>
            <TabsTrigger value="accessibility" className="text-xs sm:text-sm">Access</TabsTrigger>
            <TabsTrigger value="merchant" className="text-xs sm:text-sm">Merchant</TabsTrigger>
            <TabsTrigger value="pwa" className="text-xs sm:text-sm">App</TabsTrigger>
            <TabsTrigger value="payment" className="text-xs sm:text-sm">Payment</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 mt-4">
            <ThemeSettingsPanel />
          </TabsContent>

          <TabsContent value="privacy" className="space-y-4 mt-4">
            <PrivacySettingsPanel />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4 mt-4">
            <NotificationSettingsPanel />
          </TabsContent>

          <TabsContent value="wardrobe" className="space-y-4 mt-4">
            <WardrobeSettingsPanel />
          </TabsContent>

          <TabsContent value="outfit" className="space-y-4 mt-4">
            <OutfitSettingsPanel />
          </TabsContent>

          <TabsContent value="ai" className="space-y-4 mt-4">
            <AISettingsPanel />
          </TabsContent>

          <TabsContent value="mystyle" className="space-y-4 mt-4">
            <MyStyleSettingsPanel />
          </TabsContent>

          <TabsContent value="social" className="space-y-4 mt-4">
            <SocialSettingsPanel />
          </TabsContent>

          <TabsContent value="marketplace" className="space-y-4 mt-4">
            <MarketplaceSettingsPanel />
          </TabsContent>

          <TabsContent value="mymirror" className="space-y-4 mt-4">
            <MyMirrorSettingsPanel />
          </TabsContent>

          <TabsContent value="challenges" className="space-y-4 mt-4">
            <ChallengeSettingsPanel />
          </TabsContent>

          <TabsContent value="accessibility" className="space-y-4 mt-4">
            <AccessibilitySettingsPanel />
          </TabsContent>

          <TabsContent value="merchant" className="space-y-4 mt-4">
            <MerchantSettingsPanel />
          </TabsContent>

          <TabsContent value="pwa" className="space-y-4 mt-4">
            <PWASettingsPanel />
          </TabsContent>

          <TabsContent value="payment" className="space-y-4 mt-4">
            <PaymentSettingsPanel />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
