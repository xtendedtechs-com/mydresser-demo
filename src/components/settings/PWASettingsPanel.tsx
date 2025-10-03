import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Download, 
  Smartphone, 
  WifiOff, 
  Bell, 
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Zap
} from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export const PWASettingsPanel = () => {
  const { 
    isInstallable, 
    isInstalled, 
    isOnline, 
    updateAvailable,
    install,
    updateApp,
    requestNotificationPermission,
    getNetworkStatus
  } = usePWA();
  
  const { toast } = useToast();
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    Notification.permission === 'granted'
  );
  const networkStatus = getNetworkStatus();

  const handleInstall = async () => {
    const success = await install();
    if (success) {
      toast({
        title: 'Installing...',
        description: 'MyDresser is being installed on your device.',
      });
    } else {
      toast({
        title: 'Installation Failed',
        description: 'Unable to install the app. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdate = () => {
    updateApp();
    toast({
      title: 'Updating...',
      description: 'The app will reload with the latest version.',
    });
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled) {
      const granted = await requestNotificationPermission();
      setNotificationsEnabled(granted);
      
      if (granted) {
        toast({
          title: 'Notifications Enabled',
          description: 'You will now receive push notifications.',
        });
      } else {
        toast({
          title: 'Permission Denied',
          description: 'Please enable notifications in your browser settings.',
          variant: 'destructive',
        });
      }
    } else {
      setNotificationsEnabled(false);
      toast({
        title: 'Notifications Disabled',
        description: 'You will no longer receive push notifications.',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Installation Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Progressive Web App
          </CardTitle>
          <CardDescription>Install MyDresser for the best experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${isInstalled ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="text-sm font-medium">Installation Status</span>
            </div>
            {isInstalled ? (
              <Badge variant="default" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Installed
              </Badge>
            ) : (
              <Badge variant="secondary">Not Installed</Badge>
            )}
          </div>

          {!isInstalled && isInstallable && (
            <Button onClick={handleInstall} className="w-full gap-2">
              <Download className="h-4 w-4" />
              Install MyDresser
            </Button>
          )}

          {isInstalled && (
            <div className="rounded-lg border bg-muted/50 p-4 text-sm">
              <p className="text-muted-foreground">
                ✓ MyDresser is installed and ready to use offline
              </p>
            </div>
          )}

          {!isInstallable && !isInstalled && (
            <div className="rounded-lg border bg-muted/50 p-4 text-sm">
              <p className="text-muted-foreground">
                Installation is not available on this device or browser.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Updates */}
      {updateAvailable && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-primary" />
              Update Available
            </CardTitle>
            <CardDescription>A new version of MyDresser is ready</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleUpdate} className="w-full gap-2">
              <RefreshCw className="h-4 w-4" />
              Update Now
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Network Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isOnline ? (
              <Zap className="h-5 w-5 text-green-500" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-500" />
            )}
            Network Status
          </CardTitle>
          <CardDescription>Your current connection status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Status</span>
            <Badge variant={isOnline ? 'default' : 'destructive'}>
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
          </div>
          
          {isOnline && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Connection Type</span>
                <span className="text-sm font-medium">{networkStatus.effectiveType}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Speed</span>
                <span className="text-sm font-medium">{networkStatus.downlink} Mbps</span>
              </div>
            </>
          )}

          {!isOnline && (
            <div className="rounded-lg border bg-muted/50 p-4 text-sm">
              <p className="text-muted-foreground">
                You're offline. Some features may be limited, but your wardrobe is still accessible.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>Receive updates about your wardrobe and marketplace</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="notifications" className="flex flex-col gap-1">
              <span>Enable Notifications</span>
              <span className="text-xs text-muted-foreground">
                Get alerts for new matches, outfits, and more
              </span>
            </Label>
            <Switch
              id="notifications"
              checked={notificationsEnabled}
              onCheckedChange={handleNotificationToggle}
            />
          </div>

          {Notification.permission === 'denied' && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm">
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
              <p className="text-destructive">
                Notifications are blocked. Please enable them in your browser settings.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Offline Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <WifiOff className="h-5 w-5" />
            Offline Features
          </CardTitle>
          <CardDescription>What works without an internet connection</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
              <span>Browse your wardrobe items</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
              <span>View outfit suggestions</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
              <span>Add items (syncs when online)</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
              <span>Access cached marketplace items</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
