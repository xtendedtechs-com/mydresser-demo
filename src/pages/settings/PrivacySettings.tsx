import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AccountDeletionDialog } from "@/components/AccountDeletionDialog";
import { PrivacyPolicyDialog } from "@/components/PrivacyPolicyDialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useToast } from "@/hooks/use-toast";
import { Shield, Eye, Users, Share2, Download, Trash2, FileText } from "lucide-react";

const PrivacySettings = () => {
  const { preferences, updatePreferences, loading } = useUserPreferences();
  const { toast } = useToast();
  const [deletionDialogOpen, setDeletionDialogOpen] = useState(false);
  const [privacyPolicyOpen, setPrivacyPolicyOpen] = useState(false);

  const handleToggle = async (setting: string, value: boolean) => {
    try {
      await updatePreferences({ [setting]: value });
      toast({
        title: "Privacy setting updated",
        description: "Your privacy preferences have been saved."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update privacy setting.",
        variant: "destructive"
      });
    }
  };

  const privacySettings = preferences || {
    public_profile: preferences?.public_profile !== false,
    wardrobe_visible: preferences?.wardrobe_visible !== false,
    activity_visible: preferences?.activity_visible !== false,
    analytics_sharing: preferences?.analytics_sharing !== false,
    personalized_recommendations: preferences?.personalized_recommendations !== false
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Your privacy is important to us. These settings control how your information is shared and used.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Profile Visibility
          </CardTitle>
          <CardDescription>
            Control who can see your profile and wardrobe information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="public-profile">Public Profile</Label>
              <p className="text-sm text-muted-foreground">
                Allow others to view your basic profile information
              </p>
            </div>
            <Switch
              id="public-profile"
              checked={privacySettings.public_profile !== false}
              onCheckedChange={(checked) => handleToggle("public_profile", checked)}
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="wardrobe-visible">Wardrobe Visibility</Label>
              <p className="text-sm text-muted-foreground">
                Let others see your wardrobe items and outfits
              </p>
            </div>
            <Switch
              id="wardrobe-visible"
              checked={privacySettings.wardrobe_visible !== false}
              onCheckedChange={(checked) => handleToggle("wardrobe_visible", checked)}
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="activity-visible">Activity Visibility</Label>
              <p className="text-sm text-muted-foreground">
                Show your activity in the social feed
              </p>
            </div>
            <Switch
              id="activity-visible"
              checked={privacySettings.activity_visible !== false}
              onCheckedChange={(checked) => handleToggle("activity_visible", checked)}
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Data Sharing
          </CardTitle>
          <CardDescription>
            Control how your data is used for personalization and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="analytics-sharing">Usage Analytics</Label>
              <p className="text-sm text-muted-foreground">
                Share anonymous usage data to improve the platform
              </p>
            </div>
            <Switch
              id="analytics-sharing"
              checked={privacySettings.analytics_sharing !== false}
              onCheckedChange={(checked) => handleToggle("analytics_sharing", checked)}
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="personalized-ads">Personalized Recommendations</Label>
              <p className="text-sm text-muted-foreground">
                Use your data to provide personalized outfit and shopping recommendations
              </p>
            </div>
            <Switch
              id="personalized-ads"
              checked={privacySettings.personalized_recommendations !== false}
              onCheckedChange={(checked) => handleToggle("personalized_recommendations", checked)}
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Data Management
          </CardTitle>
          <CardDescription>
            Download or delete your personal data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => window.open('/data-export', '_blank')}
            >
              <Download className="w-4 h-4 mr-2" />
              Download My Data
            </Button>
            
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setPrivacyPolicyOpen(true)}
            >
              <FileText className="w-4 h-4 mr-2" />
              Privacy Policy
            </Button>
          </div>
          
          <Button 
            variant="destructive" 
            className="w-full"
            onClick={() => setDeletionDialogOpen(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete My Account
          </Button>
        </CardContent>
      </Card>

      <AccountDeletionDialog 
        open={deletionDialogOpen} 
        onOpenChange={setDeletionDialogOpen} 
      />
      <PrivacyPolicyDialog 
        open={privacyPolicyOpen} 
        onOpenChange={setPrivacyPolicyOpen} 
      />
    </div>
  );
};

export default PrivacySettings;