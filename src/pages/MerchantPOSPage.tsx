import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedMerchantPOSTerminal } from '@/components/EnhancedMerchantPOSTerminal';
import { useToast } from '@/hooks/use-toast';

const MerchantPOSPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkMerchantStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: 'Authentication Required',
          description: 'Please sign in to access the POS terminal',
          variant: 'destructive',
        });
        navigate('/auth');
        return;
      }

      // Check if user is a merchant
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (profile?.role !== 'merchant') {
        toast({
          title: 'Access Denied',
          description: 'Only merchants can access the POS terminal',
          variant: 'destructive',
        });
        navigate('/');
      }
    };

    checkMerchantStatus();
  }, [navigate, toast]);

  return <EnhancedMerchantPOSTerminal />;
};

export default MerchantPOSPage;
