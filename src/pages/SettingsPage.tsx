import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ComprehensiveSettingsPanel from '@/components/ComprehensiveSettingsPanel';

const SettingsPage = () => {
  const [searchParams] = useSearchParams();
  const [activeSection] = useState<string>(searchParams.get('section') || 'account');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col gap-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Customize your MyDresser experience</p>
          </div>
          
          <ComprehensiveSettingsPanel activeSection={activeSection} />
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;