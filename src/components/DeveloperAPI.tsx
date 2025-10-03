import { useState } from 'react';
import { Code, Copy, Eye, EyeOff, Plus, Trash2, Key } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface APIKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed?: string;
  permissions: string[];
}

export const DeveloperAPI = () => {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([
    {
      id: '1',
      name: 'Development Key',
      key: 'md_dev_1234567890abcdef',
      createdAt: '2024-01-15',
      lastUsed: '2024-01-20',
      permissions: ['read:wardrobe', 'write:wardrobe'],
    },
  ]);
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [newKeyName, setNewKeyName] = useState('');
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const { toast } = useToast();

  const generateAPIKey = () => {
    const prefix = 'md_live_';
    const randomStr = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    return prefix + randomStr;
  };

  const handleCreateKey = () => {
    if (!newKeyName.trim()) {
      toast({
        title: 'Name Required',
        description: 'Please enter a name for your API key',
        variant: 'destructive',
      });
      return;
    }

    const newKey: APIKey = {
      id: Date.now().toString(),
      name: newKeyName,
      key: generateAPIKey(),
      createdAt: new Date().toISOString().split('T')[0],
      permissions: ['read:wardrobe', 'read:outfits'],
    };

    setApiKeys([...apiKeys, newKey]);
    setNewKeyName('');
    setIsCreatingKey(false);
    
    toast({
      title: 'API Key Created',
      description: 'Your new API key has been generated. Make sure to copy it now!',
    });
  };

  const handleDeleteKey = (id: string) => {
    setApiKeys(apiKeys.filter(key => key.id !== id));
    toast({
      title: 'API Key Deleted',
      description: 'The API key has been permanently deleted',
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'API key copied to clipboard',
    });
  };

  const toggleShowKey = (id: string) => {
    setShowKey(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Developer API</h2>
          <p className="text-muted-foreground">
            Build applications and integrations with the MyDresser API
          </p>
        </div>
        
        <Dialog open={isCreatingKey} onOpenChange={setIsCreatingKey}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create API Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New API Key</DialogTitle>
              <DialogDescription>
                Generate a new API key for your application. Keep it secure!
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="key-name">Key Name</Label>
                <Input
                  id="key-name"
                  placeholder="e.g., My Mobile App"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreatingKey(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateKey}>Create Key</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Alert>
        <Key className="h-4 w-4" />
        <AlertDescription>
          Keep your API keys secure. Never share them publicly or commit them to version control.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>API Documentation</CardTitle>
          <CardDescription>
            Quick reference for common endpoints
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 font-mono text-sm">
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-600 font-semibold">GET</span>
                <Badge variant="outline">Auth Required</Badge>
              </div>
              <code className="text-xs">https://api.mydresser.app/v1/wardrobe/items</code>
            </div>
            
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-600 font-semibold">POST</span>
                <Badge variant="outline">Auth Required</Badge>
              </div>
              <code className="text-xs">https://api.mydresser.app/v1/wardrobe/items</code>
            </div>
            
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-purple-600 font-semibold">GET</span>
                <Badge variant="outline">Auth Required</Badge>
              </div>
              <code className="text-xs">https://api.mydresser.app/v1/outfits/suggestions</code>
            </div>
          </div>
          
          <Button variant="outline" className="w-full mt-4">
            <Code className="mr-2 h-4 w-4" />
            View Full Documentation
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Your API Keys</h3>
        
        {apiKeys.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Key className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No API keys yet</p>
              <Button onClick={() => setIsCreatingKey(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Key
              </Button>
            </CardContent>
          </Card>
        ) : (
          apiKeys.map((apiKey) => (
            <Card key={apiKey.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{apiKey.name}</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteKey(apiKey.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Input
                        type={showKey[apiKey.id] ? 'text' : 'password'}
                        value={apiKey.key}
                        readOnly
                        className="font-mono text-xs pr-10"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full"
                        onClick={() => toggleShowKey(apiKey.id)}
                      >
                        {showKey[apiKey.id] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(apiKey.key)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {apiKey.permissions.map((permission) => (
                    <Badge key={permission} variant="secondary">
                      {permission}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>Created: {apiKey.createdAt}</span>
                  {apiKey.lastUsed && <span>Last used: {apiKey.lastUsed}</span>}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
