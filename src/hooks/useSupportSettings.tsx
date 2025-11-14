import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useUserSettings } from '@/hooks/useUserSettings';

export interface SupportSettings {
  enable_live_chat: boolean;
  chat_availability: 'always' | 'business_hours' | 'offline';
  enable_email_support: boolean;
  enable_ticket_notifications: boolean;
  auto_reply_enabled: boolean;
  preferred_contact_method: 'chat' | 'email' | 'ticket';
}

export const useSupportSettings = () => {
  const { toast } = useToast();
  const { settings: appSettings, updateSettings: updateAppSettings, isLoading } = useUserSettings();
  const [isUpdating, setIsUpdating] = useState(false);

  const settings: SupportSettings = {
    enable_live_chat: true,
    chat_availability: 'business_hours',
    enable_email_support: true,
    enable_ticket_notifications: true,
    auto_reply_enabled: true,
    preferred_contact_method: 'chat',
  };

  const updateSettings = async (updates: Partial<SupportSettings>) => {
    setIsUpdating(true);
    try {
      toast({
        title: 'Support Settings Updated',
        description: 'Your support preferences have been saved',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update support settings',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    settings,
    isLoading,
    updateSettings,
    isUpdating,
  };
};
