import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'private' | 'professional' | 'merchant' | 'admin';
  auth_level: 'base' | 'intermediate' | 'advanced';
  bio: string | null;
  location: string | null;
  is_profile_public: boolean;
  privacy_settings: any;
  style_score: number;
  created_at: string;
  updated_at: string;
}

export interface UserContactInfo {
  email: string | null;
  social_instagram: string | null;
  social_facebook: string | null;
  social_tiktok: string | null;
}

export const useProfile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      // Validate session before fetching profile data
      const { data: sessionValid, error: validationError } = await supabase.rpc('validate_user_session_robust');
      
      if (validationError || !sessionValid) {
        console.warn('Session validation failed:', validationError);
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;

    try {
      // Validate session before updating
      const { data: sessionValid, error: validationError } = await supabase.rpc('validate_user_session_robust');
      
      if (validationError || !sessionValid) {
        throw new Error('Session validation failed - please log in again');
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;

      // Log admin actions for audit trail
      if (updates.role && profile?.role !== updates.role) {
        try {
          await supabase.rpc('log_admin_action', {
            action_type: 'user_role_changed',
            resource_name: 'profiles',
            details: { 
              user_id: user.id, 
              old_role: profile?.role, 
              new_role: updates.role 
            }
          });
        } catch (logError) {
          // Don't fail update if logging fails
          console.warn('Admin action logging failed:', logError);
        }
      }

      // Refresh profile data
      await fetchProfile(user.id);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  return {
    user,
    profile,
    loading,
    updateProfile,
    isAuthenticated: !!user,
  };
};