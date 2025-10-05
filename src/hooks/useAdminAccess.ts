import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useAdminAccess() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to access this page",
          variant: "destructive"
        });
        navigate('/auth');
        return;
      }

      // Check admin role using server-side function
      const { data: hasAdminRole, error } = await supabase
        .rpc('is_admin' as any, { _user_id: user.id }) as any;

      if (error) {
        console.error('Admin check error:', error);
        toast({
          title: "Access Check Failed",
          description: "Could not verify admin status",
          variant: "destructive"
        });
        navigate('/');
        return;
      }

      if (!hasAdminRole) {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges",
          variant: "destructive"
        });
        navigate('/');
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error('Admin access error:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  return { isAdmin, loading };
}