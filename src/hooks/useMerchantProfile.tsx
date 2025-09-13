import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MerchantProfile {
  id: string;
  user_id: string;
  business_name: string;
  business_type?: string;
  verification_status?: string;
  created_at: string;
  updated_at: string;
}

interface MerchantSensitiveData {
  tax_id?: string;
  business_address?: any;
  contact_info?: any;
}

interface MerchantProfileInput {
  business_name: string;
  business_type?: string;
  tax_id?: string;
  business_address?: any;
  contact_info?: any;
}

export const useMerchantProfile = () => {
  const [profile, setProfile] = useState<MerchantProfile | null>(null);
  const [sensitiveData, setSensitiveData] = useState<MerchantSensitiveData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch public merchant profile data using secure function
      const { data: profileData, error: profileError } = await supabase
        .rpc('get_merchant_profile_safe');

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          // No merchant profile found
          setProfile(null);
          return;
        }
        throw profileError;
      }

      if (profileData && profileData.length > 0) {
        setProfile(profileData[0]);
      }
    } catch (err: any) {
      console.error('Error fetching merchant profile:', err);
      setError(err.message || 'Failed to fetch merchant profile');
      toast({
        title: "Error",
        description: "Failed to load merchant profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSensitiveData = async () => {
    if (!profile) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch encrypted sensitive data using secure function
      const { data: sensitiveDataResult, error: sensitiveError } = await supabase
        .rpc('get_merchant_sensitive_data');

      if (sensitiveError) {
        throw sensitiveError;
      }

      if (sensitiveDataResult && sensitiveDataResult.length > 0) {
        setSensitiveData(sensitiveDataResult[0]);
      }
    } catch (err: any) {
      console.error('Error fetching sensitive merchant data:', err);
      setError(err.message || 'Failed to fetch sensitive data');
      toast({
        title: "Error",
        description: "Failed to load sensitive business data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async (profileData: MerchantProfileInput) => {
    setLoading(true);
    setError(null);
    
    try {
      // Use secure encrypted insertion function
      const { data: profileId, error: createError } = await supabase
        .rpc('insert_encrypted_merchant_profile', {
          business_name_param: profileData.business_name,
          business_type_param: profileData.business_type,
          tax_id_param: profileData.tax_id,
          business_address_param: profileData.business_address,
          contact_info_param: profileData.contact_info
        });

      if (createError) {
        throw createError;
      }

      toast({
        title: "Success",
        description: "Merchant profile created successfully with encrypted sensitive data",
      });

      // Refresh profile data
      await fetchProfile();
      
      return profileId;
    } catch (err: any) {
      console.error('Error creating merchant profile:', err);
      setError(err.message || 'Failed to create merchant profile');
      toast({
        title: "Error", 
        description: "Failed to create merchant profile",
        variant: "destructive"
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData: Partial<MerchantProfileInput>) => {
    if (!profile?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Use secure encrypted update function
      const { data: success, error: updateError } = await supabase
        .rpc('update_encrypted_merchant_profile', {
          profile_id_param: profile.id,
          business_name_param: profileData.business_name,
          business_type_param: profileData.business_type,
          tax_id_param: profileData.tax_id,
          business_address_param: profileData.business_address,
          contact_info_param: profileData.contact_info
        });

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Success",
        description: "Merchant profile updated successfully with encrypted sensitive data",
      });

      // Refresh profile data
      await fetchProfile();
      
      // Clear sensitive data from memory for security
      setSensitiveData(null);
      
      return success;
    } catch (err: any) {
      console.error('Error updating merchant profile:', err);
      setError(err.message || 'Failed to update merchant profile');
      toast({
        title: "Error",
        description: "Failed to update merchant profile", 
        variant: "destructive"
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearSensitiveData = () => {
    setSensitiveData(null);
  };

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
    createProfile,
    updateProfile,
    clearSensitiveData,
  };
};