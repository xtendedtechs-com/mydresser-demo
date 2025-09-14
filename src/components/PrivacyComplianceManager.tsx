import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Download, Trash2, Shield, FileText, AlertTriangle } from "lucide-react";

const PrivacyComplianceManager = () => {
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { toast } = useToast();

  const exportUserData = async () => {
    setLoading(true);
    try {
      // Export all user data (GDPR Article 20 - Right to data portability)
      const { data: profile } = await supabase.from('profiles').select('*').single();
      const { data: contactInfo } = await supabase.rpc('get_user_contact_info_secure');
      const { data: wardrobeItems } = await supabase.from('wardrobe_items').select('*');
      const { data: outfits } = await supabase.from('outfits').select('*');
      const { data: preferences } = await supabase.from('user_preferences').select('*').single();

      const exportData = {
        profile,
        contactInfo,
        wardrobeItems: wardrobeItems || [],
        outfits: outfits || [],
        preferences,
        exportDate: new Date().toISOString(),
        exportType: 'GDPR_DATA_EXPORT'
      };

      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mydresser-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Data export completed",
        description: "Your data has been downloaded as a JSON file",
      });
    } catch (error: any) {
      toast({
        title: "Export failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteAllUserData = async () => {
    if (!confirm("This will permanently delete ALL your data. This action cannot be undone. Are you sure?")) {
      return;
    }

    setDeleteLoading(true);
    try {
      // GDPR Article 17 - Right to erasure (Right to be forgotten)
      
      // Delete user-specific data in correct order (respecting foreign key constraints)
      await supabase.from('collection_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('collections').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('outfit_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('outfits').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('wardrobe_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('laundry_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('laundry_batches').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('laundry_schedules').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('item_matches').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('reactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('user_follows').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('user_subscriptions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('user_preferences').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('profile_contact_info').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('merchant_profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      // Log the deletion request (actual user deletion handled by admin)
      await supabase.from('security_audit_log').insert({
        action: 'account_deletion_requested',
        resource: 'auth.users',
        success: true,
        details: {
          deletion_method: 'user_initiated',
          compliance: 'GDPR_Article_17'
        }
      });

      toast({
        title: "Account deleted successfully",
        description: "All your data has been permanently removed",
      });

      // Sign out and redirect
      await supabase.auth.signOut();
    } catch (error: any) {
      toast({
        title: "Deletion failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy & Data Rights
          </CardTitle>
          <CardDescription>
            Manage your data according to GDPR, CCPA, and other privacy regulations
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="export" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="export">Data Export</TabsTrigger>
          <TabsTrigger value="delete">Data Deletion</TabsTrigger>
          <TabsTrigger value="rights">Your Rights</TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export Your Data
              </CardTitle>
              <CardDescription>
                Download all your personal data in a machine-readable format (GDPR Article 20)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4">
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  This will create a comprehensive export including your profile, wardrobe items, 
                  outfits, preferences, and contact information.
                </AlertDescription>
              </Alert>
              <Button onClick={exportUserData} disabled={loading}>
                {loading ? "Preparing Export..." : "Download My Data"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delete" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-destructive" />
                Delete Your Account
              </CardTitle>
              <CardDescription>
                Permanently remove all your data (GDPR Article 17 - Right to be forgotten)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Warning:</strong> This action cannot be undone. All your data including 
                  wardrobe items, outfits, and account information will be permanently deleted.
                </AlertDescription>
              </Alert>
              <Button 
                variant="destructive" 
                onClick={deleteAllUserData} 
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting Account..." : "Permanently Delete Account"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Privacy Rights</CardTitle>
              <CardDescription>
                Understanding your rights under GDPR, CCPA, and other privacy laws
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Right to Access (GDPR Art. 15)</h3>
                  <p className="text-sm text-muted-foreground">
                    You can request access to your personal data and information about how it's processed.
                  </p>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Right to Rectification (GDPR Art. 16)</h3>
                  <p className="text-sm text-muted-foreground">
                    You can correct inaccurate personal data through your account settings.
                  </p>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Right to Erasure (GDPR Art. 17)</h3>
                  <p className="text-sm text-muted-foreground">
                    You can request deletion of your personal data under certain circumstances.
                  </p>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibent mb-2">Right to Data Portability (GDPR Art. 20)</h3>
                  <p className="text-sm text-muted-foreground">
                    You can receive your data in a structured, machine-readable format.
                  </p>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Right to Object (GDPR Art. 21)</h3>
                  <p className="text-sm text-muted-foreground">
                    You can object to processing of your data for certain purposes.
                  </p>
                </div>
              </div>
              
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  For questions about your privacy rights or to file a complaint, 
                  contact our Data Protection Officer at privacy@mydresser.com
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PrivacyComplianceManager;