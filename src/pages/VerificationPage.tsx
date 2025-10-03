import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MerchantVerificationDialog } from "@/components/MerchantVerificationDialog";
import { ProfessionalVerificationCard } from "@/components/ProfessionalVerificationCard";
import { VerificationStatusBadge } from "@/components/VerificationStatusBadge";
import { useProfile } from "@/hooks/useProfile";
import { useMerchantProfile } from "@/hooks/useMerchantProfile";
import { Shield, Store, Award, CheckCircle2, Lock, TrendingUp } from "lucide-react";

export default function VerificationPage() {
  const [merchantDialogOpen, setMerchantDialogOpen] = useState(false);
  const { profile } = useProfile();
  const { profile: merchantProfile } = useMerchantProfile();

  const isMerchant = profile?.role === "merchant";
  const isProfessional = profile?.role === "professional";
  const verificationStatus = merchantProfile?.verification_status || "none";

  return (
    <div className="container mx-auto p-4 pb-20 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          Verification Center
        </h1>
        <p className="text-muted-foreground">
          Build trust and unlock premium features with verified status
        </p>
      </div>

      {/* Current Status Overview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Your Verification Status</CardTitle>
          <CardDescription>Current verification level and benefits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Merchant Status */}
            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Store className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Merchant</h3>
                </div>
                {isMerchant && (
                  <VerificationStatusBadge
                    status={verificationStatus as any}
                    type="merchant"
                    size="sm"
                  />
                )}
              </div>
              {isMerchant ? (
                <Button
                  onClick={() => setMerchantDialogOpen(true)}
                  variant={verificationStatus === "verified" ? "outline" : "default"}
                  size="sm"
                  className="w-full"
                >
                  {verificationStatus === "verified" ? "View Status" : "Start Verification"}
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Switch to merchant account to verify
                </p>
              )}
            </div>

            {/* Professional Status */}
            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Professional</h3>
                </div>
                {isProfessional && (
                  <VerificationStatusBadge
                    status="verified"
                    type="professional"
                    size="sm"
                  />
                )}
              </div>
              <Button
                variant={isProfessional ? "outline" : "default"}
                size="sm"
                className="w-full"
                disabled={isProfessional}
              >
                {isProfessional ? "Verified" : "Apply for Professional"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification Tabs */}
      <Tabs defaultValue="merchant" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="merchant" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            <span className="hidden sm:inline">Merchant Verification</span>
            <span className="sm:hidden">Merchant</span>
          </TabsTrigger>
          <TabsTrigger value="professional" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            <span className="hidden sm:inline">Professional Verification</span>
            <span className="sm:hidden">Professional</span>
          </TabsTrigger>
        </TabsList>

        {/* Merchant Verification Tab */}
        <TabsContent value="merchant" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5 text-primary" />
                Merchant Verification
              </CardTitle>
              <CardDescription>
                Verify your business to build customer trust and access premium features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Benefits Grid */}
              <div className="grid md:grid-cols-2 gap-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Verified Badge</p>
                    <p className="text-xs text-muted-foreground">
                      Display verified merchant badge on your profile
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted">
                  <TrendingUp className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Higher Visibility</p>
                    <p className="text-xs text-muted-foreground">
                      Rank higher in marketplace search results
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted">
                  <Lock className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Enhanced Security</p>
                    <p className="text-xs text-muted-foreground">
                      Secure payment processing and fraud protection
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted">
                  <Award className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Premium Tools</p>
                    <p className="text-xs text-muted-foreground">
                      Access advanced analytics and bulk operations
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="flex justify-center pt-4">
                <Button
                  onClick={() => setMerchantDialogOpen(true)}
                  size="lg"
                  disabled={!isMerchant}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  {isMerchant ? "Start Merchant Verification" : "Become a Merchant First"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Professional Verification Tab */}
        <TabsContent value="professional" className="space-y-6">
          <ProfessionalVerificationCard />
        </TabsContent>
      </Tabs>

      {/* Merchant Verification Dialog */}
      <MerchantVerificationDialog
        open={merchantDialogOpen}
        onOpenChange={setMerchantDialogOpen}
        currentStatus={verificationStatus}
      />
    </div>
  );
}
