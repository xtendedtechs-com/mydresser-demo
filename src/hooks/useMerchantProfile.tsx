import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MerchantProfile {
  id: string;
  user_id: string;
  business_name: string;
  business_type: string | null;
  verification_status: string | null;
  created_at: string;
  updated_at: string;
  // Sensitive data indicators (not the actual data)
  tax_id_status?: 'VERIFIED' | 'HIDDEN';
  address_status?: 'PROVIDED' | 'NOT_PROVIDED';
  contact_status?: 'PROVIDED' | 'NOT_PROVIDED';
}

interface SensitiveMerchantData {
  tax_id: string | null;
  business_address: any | null;
  contact_info: any | null;
}

interface CreateMerchantProfileData {
  business_name: string;
  business_type?: string;
  tax_id?: string;
  business_address?: any;
  contact_info?: any;
}

interface UpdateMerchantProfileData {
  business_name?: string;
  business_type?: string;
  tax_id?: string;
  business_address?: any;
  contact_info?: any;
}

export const useMerchantProfile = () => {
  const [profile, setProfile] = useState<MerchantProfile | null>(null);
  const [sensitiveData, setSensitiveData] = useState<SensitiveMerchantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch merchant profile (safe function - no sensitive data)
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .rpc('get_merchant_profile_safe');

      if (error && error.code !== 'PGRST116') { // Not found is OK
        throw error;
      }

      // Get first result since function returns array
      const profileData = data && data.length > 0 ? data[0] : null;
      setProfile(profileData as MerchantProfile);
    } catch (err: any) {
      console.error('Error fetching merchant profile:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch sensitive data (requires special permissions and rate limiting)
  const fetchSensitiveData = async (): Promise<SensitiveMerchantData | null> => {
    try {
      const { data, error } = await supabase.rpc('get_merchant_sensitive_data');

      if (error) {
        if (error.message.includes('Rate limit exceeded')) {
          toast({
            title: "Rate Limit Exceeded",
            description: "Too many sensitive data requests. Please try again later.",
            variant: "destructive",
          });
        }
        throw error;
      }

      // The RPC returns an array, get the first result
      const sensitiveResult = data && data.length > 0 ? data[0] : null;
      setSensitiveData(sensitiveResult);
      return sensitiveResult;
    } catch (err: any) {
      console.error('Error fetching sensitive merchant data:', err);
      toast({
        title: "Access Error",
        description: "Failed to access sensitive business data.",
        variant: "destructive",
      });
      return null;
    }
  };

  // Clear sensitive data from memory for security
  const clearSensitiveData = () => {
    setSensitiveData(null);
    toast({
      title: "Data Cleared",
      description: "Sensitive business data has been cleared from memory.",
    });
  };

  // Create merchant profile with encryption
  const createProfile = async (profileData: CreateMerchantProfileData): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.rpc('insert_encrypted_merchant_profile', {
        business_name_param: profileData.business_name,
        business_type_param: profileData.business_type || null,
        tax_id_param: profileData.tax_id || null,
        business_address_param: profileData.business_address || null,
        contact_info_param: profileData.contact_info || null
      });

      if (error) {
        if (error.message.includes('Rate limit exceeded')) {
          toast({
            title: "Rate Limit Exceeded",
            description: "Too many profile creation attempts. Please try again later.",
            variant: "destructive",
          });
        }
        throw error;
      }

      toast({
        title: "Profile Created",
        description: "Your merchant profile has been created with encrypted sensitive data.",
      });

      // Refresh profile data
      await fetchProfile();
      return true;
    } catch (err: any) {
      console.error('Error creating merchant profile:', err);
      setError(err.message);
      toast({
        title: "Creation Failed",
        description: err.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update merchant profile with encryption
  const updateProfile = async (
    profileId: string,
    updates: UpdateMerchantProfileData
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.rpc('update_encrypted_merchant_profile', {
        profile_id_param: profileId,
        business_name_param: updates.business_name || null,
        business_type_param: updates.business_type || null,
        tax_id_param: updates.tax_id || null,
        business_address_param: updates.business_address || null,
        contact_info_param: updates.contact_info || null
      });

      if (error) {
        if (error.message.includes('Rate limit exceeded')) {
          toast({
            title: "Rate Limit Exceeded",
            description: "Too many profile updates. Please try again later.",
            variant: "destructive",
          });
        }
        throw error;
      }

      toast({
        title: "Profile Updated",
        description: "Your merchant profile has been updated with encrypted sensitive data.",
      });

      // Refresh profile data
      await fetchProfile();
      return true;
    } catch (err: any) {
      console.error('Error updating merchant profile:', err);
      setError(err.message);
      toast({
        title: "Update Failed",
        description: err.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Delete merchant profile (only for non-verified profiles)
  const deleteProfile = async (profileId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('merchant_profiles')
        .delete()
        .eq('id', profileId)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;

      toast({
        title: "Profile Deleted",
        description: "Your merchant profile has been deleted.",
      });

      setProfile(null);
      return true;
    } catch (err: any) {
      console.error('Error deleting merchant profile:', err);
      setError(err.message);
      toast({
        title: "Deletion Failed",
        description: err.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Load profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    sensitiveData,
    loading,
    error,
    fetchProfile,
    fetchSensitiveData,
    clearSensitiveData,
    createProfile,
    updateProfile,
    deleteProfile,
    refetch: fetchProfile
  };
};

export default useMerchantProfile;