import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface SupportSettings {
  enable_live_chat: boolean;
  chat_availability: 'always' | 'business_hours' | 'offline';
  enable_email_support: boolean;
  enable_ticket_notifications: boolean;
  auto_reply_enabled: boolean;
  preferred_contact_method: 'chat' | 'email' | 'ticket';
}

// Temporary mock implementation until database table is created
export const useSupportSettings = () => {
  const { toast } = useToast();
  const [settings] = useState<SupportSettings>({
    enable_live_chat: true,
    chat_availability: 'business_hours',
    enable_email_support: true,
    enable_ticket_notifications: true,
    auto_reply_enabled: true,
    preferred_contact_method: 'chat',
  });

  const updateSettings = (updates: Partial<SupportSettings>) => {
    toast({
      title: 'Support Settings Updated',
      description: 'Your support preferences have been saved',
    });
  };

  return {
    settings,
    isLoading: false,
    updateSettings,
    isUpdating: false,
  };
};
