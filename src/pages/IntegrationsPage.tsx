import { useState } from 'react';
import { Link2, Code } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThirdPartyIntegrations } from '@/components/ThirdPartyIntegrations';
import { DeveloperAPI } from '@/components/DeveloperAPI';

export default function IntegrationsPage() {
  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Integrations & API</h1>
        <p className="text-muted-foreground">
          Connect MyDresser with your favorite apps and build custom integrations
        </p>
      </div>

      <Tabs defaultValue="integrations" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Developer API
          </TabsTrigger>
        </TabsList>

        <TabsContent value="integrations">
          <ThirdPartyIntegrations />
        </TabsContent>

        <TabsContent value="api">
          <DeveloperAPI />
        </TabsContent>
      </Tabs>
    </div>
  );
}
