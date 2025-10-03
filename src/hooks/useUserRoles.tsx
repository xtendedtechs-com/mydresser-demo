import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type AppRole = 'admin' | 'merchant' | 'professional' | 'user';

export const useUserRoles = (userId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user roles
  const { data: roles = [], isLoading } = useQuery({
    queryKey: ['user-roles', userId],
    queryFn: async () => {
      const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;
      if (!targetUserId) return [];
      
      const { data, error } = await supabase
        .from('user_roles' as any)
        .select('*')
        .eq('user_id', targetUserId);
      
      if (error) throw error;
      return (data || []) as any[];
    },
    enabled: !!userId || true,
  });

  // Check if user has a specific role
  const hasRole = (role: AppRole): boolean => {
    return roles.some(r => r.role === role);
  };

  // Get primary role (highest priority)
  const getPrimaryRole = (): AppRole => {
    if (hasRole('admin')) return 'admin';
    if (hasRole('merchant')) return 'merchant';
    if (hasRole('professional')) return 'professional';
    return 'user';
  };

  // Add role to user (admin only)
  const addRole = useMutation({
    mutationFn: async ({ targetUserId, role }: { targetUserId: string; role: AppRole }) => {
      const { data, error } = await supabase
        .from('user_roles' as any)
        .insert({ user_id: targetUserId, role })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      toast({
        title: 'Role Added',
        description: 'User role has been successfully added.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Remove role from user (admin only)
  const removeRole = useMutation({
    mutationFn: async ({ targetUserId, role }: { targetUserId: string; role: AppRole }) => {
      const { error } = await supabase
        .from('user_roles' as any)
        .delete()
        .eq('user_id', targetUserId)
        .eq('role', role);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      toast({
        title: 'Role Removed',
        description: 'User role has been successfully removed.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    roles,
    isLoading,
    hasRole,
    getPrimaryRole,
    addRole: addRole.mutate,
    removeRole: removeRole.mutate,
    isAdmin: hasRole('admin'),
    isMerchant: hasRole('merchant'),
    isProfessional: hasRole('professional'),
  };
};
