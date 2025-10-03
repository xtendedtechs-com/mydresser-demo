import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Upload, CheckCircle, Clock, XCircle, Loader2 } from "lucide-react";

interface MerchantVerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStatus?: string;
}

export const MerchantVerificationDialog = ({
  open,
  onOpenChange,
  currentStatus = "pending"
}: MerchantVerificationDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [businessDocument, setBusinessDocument] = useState<File | null>(null);
  const [taxDocument, setTaxDocument] = useState<File | null>(null);
  const [additionalInfo, setAdditionalInfo] = useState("");
  const { toast } = useToast();

  const statusConfig = {
    verified: { icon: CheckCircle, color: "text-green-600", label: "Verified", variant: "default" as const },
    pending: { icon: Clock, color: "text-yellow-600", label: "Pending Review", variant: "secondary" as const },
    rejected: { icon: XCircle, color: "text-red-600", label: "Rejected", variant: "destructive" as const },
  };

  const status = statusConfig[currentStatus as keyof typeof statusConfig] || statusConfig.pending;

  const handleSubmit = async () => {
    if (!businessDocument || !taxDocument) {
      toast({
        title: "Missing Documents",
        description: "Please upload all required documents",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // In a real implementation, upload documents to Supabase Storage
      // For now, just update the merchant profile
      const { error } = await supabase
        .from("merchant_profiles")
        .update({
          verification_status: "pending",
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Verification Submitted",
        description: "Your documents have been submitted for review. We'll notify you within 2-3 business days.",
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Verification submission error:", error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit verification. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Merchant Verification
          </DialogTitle>
          <DialogDescription>
            Get verified to build trust and unlock premium features
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Status */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
            <div className="flex items-center gap-2">
              <status.icon className={`h-4 w-4 ${status.color}`} />
              <span className="text-sm font-medium">Current Status</span>
            </div>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>

          {/* Verification Benefits */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Verification Benefits</Label>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Verified merchant badge on your profile</li>
              <li>Higher search ranking in marketplace</li>
              <li>Access to bulk order management</li>
              <li>Priority customer support</li>
              <li>Advanced analytics dashboard</li>
            </ul>
          </div>

          {/* Document Upload */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="business-doc">Business Registration Document *</Label>
              <div className="mt-1 flex items-center gap-2">
                <Input
                  id="business-doc"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setBusinessDocument(e.target.files?.[0] || null)}
                  className="flex-1"
                />
                <Upload className="h-4 w-4 text-muted-foreground" />
              </div>
              {businessDocument && (
                <p className="text-xs text-muted-foreground mt-1">
                  Selected: {businessDocument.name}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="tax-doc">Tax ID / EIN Document *</Label>
              <div className="mt-1 flex items-center gap-2">
                <Input
                  id="tax-doc"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setTaxDocument(e.target.files?.[0] || null)}
                  className="flex-1"
                />
                <Upload className="h-4 w-4 text-muted-foreground" />
              </div>
              {taxDocument && (
                <p className="text-xs text-muted-foreground mt-1">
                  Selected: {taxDocument.name}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="additional-info">Additional Information (Optional)</Label>
              <Textarea
                id="additional-info"
                placeholder="Any additional details about your business..."
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                rows={3}
                className="mt-1"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={loading || currentStatus === "verified"}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {currentStatus === "verified" ? "Already Verified" : "Submit for Verification"}
            </Button>
          </div>

          {/* Security Note */}
          <p className="text-xs text-muted-foreground text-center">
            🔒 Your documents are encrypted and securely stored
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
