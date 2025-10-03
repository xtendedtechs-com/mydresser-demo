import SecurityDashboard from '@/components/SecurityDashboard';

const SecurityPage = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Security Center</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account security and privacy settings
        </p>
      </div>
      <SecurityDashboard />
    </div>
  );
};

export default SecurityPage;
