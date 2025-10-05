import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentSettingsPanel } from "@/components/settings/PaymentSettingsPanel";
import { CreditCard } from "lucide-react";

const PaymentSettings = () => {
  return (
    <div className="min-h-screen bg-background pb-20 px-4 py-6">
      <div className="container mx-auto max-w-4xl">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Payment Settings</h1>
              <p className="text-muted-foreground">Manage your payment methods and preferences</p>
            </div>
          </div>

          <PaymentSettingsPanel />
        </div>
      </div>
    </div>
  );
};

export default PaymentSettings;
