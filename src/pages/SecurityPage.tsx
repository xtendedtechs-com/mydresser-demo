import { SecurityDashboardPanel } from '@/components/SecurityDashboardPanel';

const SecurityPage = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-5xl mx-auto p-4 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Security & Privacy</h1>
          <p className="text-muted-foreground">
            Monitor your account security and manage privacy settings
          </p>
        </div>

        <SecurityDashboardPanel />
      </div>
    </div>
  );
};

export default SecurityPage;
