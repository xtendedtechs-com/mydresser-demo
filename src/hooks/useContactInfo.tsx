import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from './useProfile';

export interface UserContactInfo {
  email: string | null;
  social_instagram: string | null;
  social_facebook: string | null;
  social_tiktok: string | null;
}

export const useContactInfo = () => {
  const { user } = useProfile();
  const [contactInfo, setContactInfo] = useState<UserContactInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchContactInfo();
    } else {
      setContactInfo(null);
      setLoading(false);
    }
  }, [user]);

  const fetchContactInfo = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profile_contact_info')
        .select('email, social_instagram, social_facebook, social_tiktok')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "no rows returned" which is fine
        throw error;
      }

      setContactInfo(data || {
        email: null,
        social_instagram: null,
        social_facebook: null,
        social_tiktok: null,
      });
    } catch (error) {
      console.error('Error fetching contact info:', error);
      setContactInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const updateContactInfo = async (updates: Partial<UserContactInfo>) => {
    if (!user) return;

    try {
      // First try to update existing record
      const { error: updateError } = await supabase
        .from('profile_contact_info')
        .update(updates)
        .eq('user_id', user.id);

      if (updateError && updateError.code === 'PGRST116') {
        // No record exists, create one
        const { error: insertError } = await supabase
          .from('profile_contact_info')
          .insert({
            user_id: user.id,
            ...updates,
          });

        if (insertError) throw insertError;
      } else if (updateError) {
        throw updateError;
      }

      // Refresh contact info data
      await fetchContactInfo();
    } catch (error) {
      console.error('Error updating contact info:', error);
      throw error;
    }
  };

  return {
    contactInfo,
    loading,
    updateContactInfo,
    refreshContactInfo: fetchContactInfo,
  };
};