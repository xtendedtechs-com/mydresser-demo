import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff } from 'lucide-react';

export const RealTimeIndicator = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Check initial connection status
    const checkConnection = () => {
      const channels = supabase.getChannels();
      setIsConnected(channels.length > 0);
    };

    checkConnection();

    // Listen for connection changes
    const interval = setInterval(checkConnection, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!isConnected) {
    return (
      <Badge variant="outline" className="gap-2 text-muted-foreground">
        <WifiOff className="h-3 w-3" />
        Offline
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="gap-2 text-primary animate-pulse">
      <Wifi className="h-3 w-3" />
      Live
    </Badge>
  );
};
