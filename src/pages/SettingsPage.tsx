import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThemeSettingsPanel } from '@/components/settings/ThemeSettingsPanel';
import { PrivacySettingsPanel } from '@/components/settings/PrivacySettingsPanel';
import { NotificationSettingsPanel } from '@/components/settings/NotificationSettingsPanel';
import { WardrobeSettingsPanel } from '@/components/settings/WardrobeSettingsPanel';
import { OutfitSettingsPanel } from '@/components/settings/OutfitSettingsPanel';
import { AISettingsPanel } from '@/components/settings/AISettingsPanel';
import { MyStyleSettingsPanel } from '@/components/settings/MyStyleSettingsPanel';
import SocialSettingsPanel from '@/components/settings/SocialSettingsPanel';
import MarketplaceSettingsPanel from '@/components/settings/MarketplaceSettingsPanel';
import MyMirrorSettingsPanel from '@/components/settings/MyMirrorSettingsPanel';
import ChallengeSettingsPanel from '@/components/settings/ChallengeSettingsPanel';
import { AccessibilitySettingsPanel } from '@/components/settings/AccessibilitySettingsPanel';
import { MerchantSettingsPanel } from '@/components/settings/MerchantSettingsPanel';
import { PWASettingsPanel } from '@/components/settings/PWASettingsPanel';
import { PaymentSettingsPanel } from '@/components/settings/PaymentSettingsPanel';
import { useSettings } from '@/hooks/useSettings';

export default function SettingsPage() {
  const { category } = useParams();
  const navigate = useNavigate();
  const { loading } = useSettings();

  return (
    <div className="container max-w-6xl py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/account')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Account
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences and settings</p>
      </div>

      {loading ? (
        <Card className="p-8 text-center">Loading settings...</Card>
      ) : (
        <Tabs defaultValue={category || 'general'} className="space-y-6">
          <TabsList className="grid grid-cols-2 lg:grid-cols-6 gap-2">
            <TabsTrigger value="general" onClick={() => navigate('/settings/general')}>General</TabsTrigger>
            <TabsTrigger value="privacy" onClick={() => navigate('/settings/privacy')}>Privacy</TabsTrigger>
            <TabsTrigger value="notifications" onClick={() => navigate('/settings/notifications')}>Notifications</TabsTrigger>
            <TabsTrigger value="wardrobe" onClick={() => navigate('/settings/wardrobe')}>Wardrobe</TabsTrigger>
            <TabsTrigger value="outfit" onClick={() => navigate('/settings/outfit')}>Outfit</TabsTrigger>
            <TabsTrigger value="ai" onClick={() => navigate('/settings/ai')}>AI</TabsTrigger>
            <TabsTrigger value="mystyle" onClick={() => navigate('/settings/mystyle')}>My Style</TabsTrigger>
            <TabsTrigger value="social" onClick={() => navigate('/settings/social')}>Social</TabsTrigger>
            <TabsTrigger value="marketplace" onClick={() => navigate('/settings/marketplace')}>Marketplace</TabsTrigger>
            <TabsTrigger value="mymirror" onClick={() => navigate('/settings/mymirror')}>MyMirror</TabsTrigger>
            <TabsTrigger value="challenges" onClick={() => navigate('/settings/challenges')}>Challenges</TabsTrigger>
            <TabsTrigger value="accessibility" onClick={() => navigate('/settings/accessibility')}>Accessibility</TabsTrigger>
            <TabsTrigger value="merchant" onClick={() => navigate('/settings/merchant')}>Merchant</TabsTrigger>
            <TabsTrigger value="pwa" onClick={() => navigate('/settings/pwa')}>PWA</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Theme & Appearance</h2>
              <ThemeSettingsPanel />
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Privacy Settings</h2>
              <PrivacySettingsPanel />
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
              <NotificationSettingsPanel />
            </Card>
          </TabsContent>

          <TabsContent value="wardrobe" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Wardrobe Settings</h2>
              <WardrobeSettingsPanel />
            </Card>
          </TabsContent>

          <TabsContent value="outfit" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Outfit Generator Settings</h2>
              <OutfitSettingsPanel />
            </Card>
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">AI Assistant Settings</h2>
              <AISettingsPanel />
            </Card>
          </TabsContent>

          <TabsContent value="mystyle" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">My Style Preferences</h2>
              <MyStyleSettingsPanel />
            </Card>
          </TabsContent>

          <TabsContent value="social" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Social Settings</h2>
              <SocialSettingsPanel />
            </Card>
          </TabsContent>

          <TabsContent value="marketplace" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Marketplace Settings</h2>
              <MarketplaceSettingsPanel />
            </Card>
          </TabsContent>

          <TabsContent value="mymirror" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">MyMirror & Virtual Try-On</h2>
              <MyMirrorSettingsPanel />
            </Card>
          </TabsContent>

          <TabsContent value="challenges" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Challenge Settings</h2>
              <ChallengeSettingsPanel />
            </Card>
          </TabsContent>

          <TabsContent value="accessibility" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Accessibility Options</h2>
              <AccessibilitySettingsPanel />
            </Card>
          </TabsContent>

          <TabsContent value="merchant" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Merchant Settings</h2>
              <MerchantSettingsPanel />
            </Card>
          </TabsContent>

          <TabsContent value="pwa" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">PWA Settings</h2>
              <PWASettingsPanel />
            </Card>
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Payment Settings</h2>
              <PaymentSettingsPanel />
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
