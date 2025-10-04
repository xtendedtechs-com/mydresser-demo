import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SupportTicket {
  id: string;
  merchant_id: string;
  subject: string;
  message: string;
  status: 'open' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface SupportMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  message: string;
  is_internal: boolean;
  attachments?: any[];
  created_at: string;
}

export const useSupportTickets = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTickets = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('merchant_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets((data || []) as SupportTicket[]);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({
        title: 'Error',
        description: 'Failed to load support tickets',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('support_tickets_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_tickets'
        },
        () => {
          fetchTickets();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const createTicket = async (
    subject: string,
    message: string,
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium',
    category?: string
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('support_tickets')
        .insert([
          {
            merchant_id: user.id,
            subject,
            message,
            priority,
            category,
            status: 'open'
          }
        ])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Ticket Created',
        description: 'Your support ticket has been submitted successfully',
      });

      fetchTickets();
      return data;
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast({
        title: 'Error',
        description: 'Failed to create support ticket',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateTicketStatus = async (ticketId: string, status: SupportTicket['status']) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ 
          status,
          resolved_at: status === 'resolved' ? new Date().toISOString() : null
        })
        .eq('id', ticketId);

      if (error) throw error;

      toast({
        title: 'Status Updated',
        description: `Ticket status changed to ${status}`,
      });

      fetchTickets();
    } catch (error) {
      console.error('Error updating ticket:', error);
      toast({
        title: 'Error',
        description: 'Failed to update ticket status',
        variant: 'destructive',
      });
    }
  };

  const getTicketMessages = async (ticketId: string): Promise<SupportMessage[]> => {
    try {
      const { data, error } = await supabase
        .from('support_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data || []) as SupportMessage[];
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  };

  const addMessage = async (ticketId: string, message: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('support_messages')
        .insert([
          {
            ticket_id: ticketId,
            sender_id: user.id,
            message,
            is_internal: false
          }
        ]);

      if (error) throw error;

      toast({
        title: 'Message Sent',
        description: 'Your message has been added to the ticket',
      });

      return true;
    } catch (error) {
      console.error('Error adding message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    tickets,
    loading,
    createTicket,
    updateTicketStatus,
    getTicketMessages,
    addMessage,
    refetch: fetchTickets
  };
};
