import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { WifiOff, Wifi } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showIndicator, setShowIndicator] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowIndicator(true);
      toast({
        title: 'Back Online',
        description: 'Your connection has been restored.',
      });
      setTimeout(() => setShowIndicator(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowIndicator(true);
      toast({
        title: 'You\'re Offline',
        description: 'Some features may be limited. Changes will sync when back online.',
        variant: 'destructive',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Show indicator initially if offline
    if (!navigator.onLine) {
      setShowIndicator(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  if (!showIndicator && isOnline) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
      <Badge
        variant={isOnline ? 'default' : 'destructive'}
        className="gap-2 px-4 py-2 shadow-lg"
      >
        {isOnline ? (
          <>
            <Wifi className="h-4 w-4 animate-pulse" />
            <span className="font-medium">Back Online</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4" />
            <span className="font-medium">Offline Mode</span>
          </>
        )}
      </Badge>
    </div>
  );
};
