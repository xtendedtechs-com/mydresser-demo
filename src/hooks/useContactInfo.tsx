import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from './useProfile';
import { toast } from 'sonner';

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
  const [maskSensitiveData, setMaskSensitiveData] = useState(false);

  useEffect(() => {
    if (user) {
      fetchContactInfo();
    } else {
      setContactInfo(null);
      setLoading(false);
    }
  }, [user]);

  const fetchContactInfo = async (masked: boolean = false) => {
    if (!user) return;

    try {
      // Use direct table access for simplicity and reliability
      const { data, error } = await supabase
        .from('profile_contact_info')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        // Handle rate limiting gracefully
        if (error.message?.includes('Rate limit exceeded')) {
          toast.error('Too many requests. Please try again later.');
          return;
        }
        throw error;
      }

      // Direct query returns single object or null
      const contactData = data;
      
      setContactInfo(contactData || {
        email: null,
        social_instagram: null,
        social_facebook: null,
        social_tiktok: null,
      });
    } catch (error) {
      console.error('Error fetching contact info:', error);
      // Fallback to empty data instead of null to prevent UI issues
      setContactInfo({
        email: null,
        social_instagram: null,
        social_facebook: null,
        social_tiktok: null,
      });
      
      if (error.message?.includes('Rate limit exceeded')) {
        toast.error('Access limit reached. Contact information is temporarily restricted.');
      } else {
        toast.error('Failed to load contact information');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateContactInfo = async (updates: Partial<UserContactInfo>) => {
    if (!user) return;

    try {
      // Use the secure encrypted update function
      // Use direct upsert with ON CONFLICT for contact info updates
      const { error } = await supabase
        .from('profile_contact_info')
        .upsert({
          user_id: user.id,
          email: updates.email || null,
          social_instagram: updates.social_instagram || null,
          social_facebook: updates.social_facebook || null,
          social_tiktok: updates.social_tiktok || null,
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        if (error.message?.includes('Rate limit exceeded')) {
          toast.error('Update limit reached. Please try again later.');
          throw new Error('Rate limit exceeded');
        }
        throw error;
      }

      toast.success('Contact information updated');
      // Refresh contact info data
      await fetchContactInfo(maskSensitiveData);
    } catch (error) {
      console.error('Error updating contact info:', error);
      if (!error.message?.includes('Rate limit exceeded')) {
        toast.error('Failed to update contact information');
      }
      throw error;
    }
  };

  const toggleDataMasking = () => {
    const newMaskState = !maskSensitiveData;
    setMaskSensitiveData(newMaskState);
    fetchContactInfo(newMaskState);
  };

  return {
    contactInfo,
    loading,
    updateContactInfo,
    refreshContactInfo: () => fetchContactInfo(maskSensitiveData),
    maskSensitiveData,
    toggleDataMasking,
  };
};