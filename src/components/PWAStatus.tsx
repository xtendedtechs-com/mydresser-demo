import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Download } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export const PWAStatus = () => {
  const { isOnline, isInstallable, isInstalled, install } = usePWA();

  return (
    <div className="flex items-center gap-2">
      {/* Online/Offline Status */}
      <Popover>
        <PopoverTrigger asChild>
          <button className="focus:outline-none">
            <Badge
              variant={isOnline ? 'default' : 'destructive'}
              className="cursor-pointer"
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3 h-3 mr-1" />
                  Online
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 mr-1" />
                  Offline
                </>
              )}
            </Badge>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64" align="end">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Connection Status</h4>
            <p className="text-xs text-muted-foreground">
              {isOnline
                ? 'You are connected to the internet. All features are available.'
                : 'You are offline. Some features may be limited. Changes will sync when connection is restored.'}
            </p>
          </div>
        </PopoverContent>
      </Popover>

      {/* Install Button */}
      {isInstallable && !isInstalled && (
        <Button
          size="sm"
          variant="outline"
          onClick={install}
          className="hidden md:flex"
        >
          <Download className="w-4 h-4 mr-1" />
          Install App
        </Button>
      )}

      {isInstalled && (
        <Badge variant="secondary" className="hidden md:flex">
          Installed
        </Badge>
      )}
    </div>
  );
};
