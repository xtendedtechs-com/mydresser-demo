import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Download, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after a delay (don't be annoying)
      setTimeout(() => {
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (!dismissed || Date.now() - parseInt(dismissed) > 7 * 24 * 60 * 60 * 1000) {
          setShowPrompt(true);
        }
      }, 3000);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      toast({
        title: 'App Installed!',
        description: 'MyDresser is now installed on your device.',
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [toast]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      toast({
        title: 'Installing...',
        description: 'MyDresser is being installed on your device.',
      });
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    toast({
      title: 'Install Later',
      description: 'You can install MyDresser anytime from settings.',
    });
  };

  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-fade-in md:left-auto md:right-4 md:w-96">
      <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-background shadow-lg">
        <CardHeader className="relative pb-3">
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2 h-6 w-6 p-0"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/20 p-2">
              <Smartphone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Install MyDresser</CardTitle>
              <CardDescription className="text-xs">Get the full app experience</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pb-4">
          <p className="text-sm text-muted-foreground">
            Install MyDresser on your device for:
          </p>
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li>• Offline access to your wardrobe</li>
            <li>• Faster loading and performance</li>
            <li>• Push notifications for updates</li>
            <li>• Home screen quick access</li>
          </ul>
          <div className="flex gap-2 pt-2">
            <Button onClick={handleInstall} className="flex-1 gap-2" size="sm">
              <Download className="h-4 w-4" />
              Install Now
            </Button>
            <Button onClick={handleDismiss} variant="outline" size="sm">
              Later
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
