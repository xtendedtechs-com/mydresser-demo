import { useState } from 'react';
import { Link2, CheckCircle, XCircle, Loader2, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'shopping' | 'social' | 'analytics' | 'productivity';
  status: 'connected' | 'available' | 'coming-soon';
  apiKey?: string;
}

const availableIntegrations: Integration[] = [
  {
    id: 'shopify',
    name: 'Shopify',
    description: 'Sync your Shopify store inventory with MyDresser',
    icon: '🛍️',
    category: 'shopping',
    status: 'available',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    description: 'Share your outfits directly to Instagram',
    icon: '📸',
    category: 'social',
    status: 'available',
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    description: 'Import style inspiration from Pinterest boards',
    icon: '📌',
    category: 'social',
    status: 'available',
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Plan outfits based on your calendar events',
    icon: '📅',
    category: 'productivity',
    status: 'available',
  },
  {
    id: 'amazon',
    name: 'Amazon',
    description: 'Import purchases from Amazon Fashion',
    icon: '📦',
    category: 'shopping',
    status: 'coming-soon',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    description: 'Share outfit videos to TikTok',
    icon: '🎵',
    category: 'social',
    status: 'coming-soon',
  },
];

export const ThirdPartyIntegrations = () => {
  const [integrations, setIntegrations] = useState<Integration[]>(availableIntegrations);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const handleConnect = async (integrationId: string) => {
    setConnecting(integrationId);
    
    try {
      // Simulate API connection
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIntegrations(prev =>
        prev.map(int =>
          int.id === integrationId ? { ...int, status: 'connected' as const } : int
        )
      );
      
      toast({
        title: 'Integration Connected',
        description: `Successfully connected to ${integrations.find(i => i.id === integrationId)?.name}`,
      });
    } catch (error) {
      toast({
        title: 'Connection Failed',
        description: 'Could not connect to the integration',
        variant: 'destructive',
      });
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = async (integrationId: string) => {
    setIntegrations(prev =>
      prev.map(int =>
        int.id === integrationId ? { ...int, status: 'available' as const } : int
      )
    );
    
    toast({
      title: 'Integration Disconnected',
      description: 'Successfully disconnected the integration',
    });
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      shopping: 'bg-blue-500/10 text-blue-600',
      social: 'bg-purple-500/10 text-purple-600',
      analytics: 'bg-green-500/10 text-green-600',
      productivity: 'bg-orange-500/10 text-orange-600',
    };
    return colors[category] || 'bg-gray-500/10 text-gray-600';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'connected') return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (status === 'coming-soon') return <XCircle className="h-4 w-4 text-gray-400" />;
    return null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Third-Party Integrations</h2>
        <p className="text-muted-foreground">
          Connect MyDresser with your favorite services to unlock powerful features
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map((integration) => (
          <Card key={integration.id} className="relative overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{integration.icon}</div>
                  <div>
                    <CardTitle className="text-lg">{integration.name}</CardTitle>
                    <Badge variant="outline" className={`mt-1 ${getCategoryBadge(integration.category)}`}>
                      {integration.category}
                    </Badge>
                  </div>
                </div>
                {getStatusIcon(integration.status)}
              </div>
            </CardHeader>
            
            <CardContent>
              <CardDescription className="mb-4">
                {integration.description}
              </CardDescription>

              {integration.status === 'available' && (
                <div className="space-y-3">
                  {['shopify', 'google-calendar'].includes(integration.id) && (
                    <div className="space-y-2">
                      <Label htmlFor={`${integration.id}-key`}>API Key</Label>
                      <Input
                        id={`${integration.id}-key`}
                        type="password"
                        placeholder="Enter your API key"
                        value={apiKeys[integration.id] || ''}
                        onChange={(e) =>
                          setApiKeys(prev => ({ ...prev, [integration.id]: e.target.value }))
                        }
                      />
                    </div>
                  )}
                  
                  <Button
                    onClick={() => handleConnect(integration.id)}
                    disabled={connecting === integration.id}
                    className="w-full"
                  >
                    {connecting === integration.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Link2 className="mr-2 h-4 w-4" />
                        Connect
                      </>
                    )}
                  </Button>
                </div>
              )}

              {integration.status === 'connected' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Connected and active</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleDisconnect(integration.id)}
                      variant="outline"
                      className="flex-1"
                    >
                      Disconnect
                    </Button>
                    <Button variant="outline" size="icon">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {integration.status === 'coming-soon' && (
                <Badge variant="secondary" className="w-full justify-center py-2">
                  Coming Soon
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
