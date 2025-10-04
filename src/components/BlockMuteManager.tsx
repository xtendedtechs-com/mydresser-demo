import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { UserX, VolumeX, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BlockedUser {
  id: string;
  blocked_user_id: string;
  blocked_at: string;
  blocked_user: {
    full_name: string;
    avatar_url: string;
  };
}

interface MutedUser {
  id: string;
  muted_user_id: string;
  muted_at: string;
  muted_until: string | null;
  muted_user: {
    full_name: string;
    avatar_url: string;
  };
}

export const BlockMuteManager = () => {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [mutedUsers, setMutedUsers] = useState<MutedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [unblockUserId, setUnblockUserId] = useState<string | null>(null);
  const [unmuteUserId, setUnmuteUserId] = useState<string | null>(null);

  useEffect(() => {
    loadBlockedAndMutedUsers();
  }, []);

  const loadBlockedAndMutedUsers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load blocked users
      const { data: blocked } = await supabase
        .from('blocked_users')
        .select(`
          id,
          blocked_user_id,
          blocked_at
        `)
        .eq('user_id', user.id)
        .order('blocked_at', { ascending: false });

      // Load muted users  
      const { data: muted } = await supabase
        .from('muted_users')
        .select(`
          id,
          muted_user_id,
          muted_at,
          muted_until
        `)
        .eq('user_id', user.id)
        .order('muted_at', { ascending: false });

      // Fetch profile data for blocked users
      if (blocked && blocked.length > 0) {
        const blockedIds = blocked.map(b => b.blocked_user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', blockedIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
        setBlockedUsers(blocked.map(b => ({
          ...b,
          blocked_user: profileMap.get(b.blocked_user_id) || { full_name: 'Unknown User', avatar_url: '' }
        })));
      } else {
        setBlockedUsers([]);
      }

      // Fetch profile data for muted users
      if (muted && muted.length > 0) {
        const mutedIds = muted.map(m => m.muted_user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', mutedIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
        setMutedUsers(muted.map(m => ({
          ...m,
          muted_user: profileMap.get(m.muted_user_id) || { full_name: 'Unknown User', avatar_url: '' }
        })));
      } else {
        setMutedUsers([]);
      }
    } catch (error) {
      console.error('Error loading blocked/muted users:', error);
      toast.error('Failed to load blocked/muted users');
    } finally {
      setLoading(false);
    }
  };

  const unblockUser = async (blockId: string) => {
    try {
      const { error } = await supabase
        .from('blocked_users')
        .delete()
        .eq('id', blockId);

      if (error) throw error;

      setBlockedUsers(prev => prev.filter(b => b.id !== blockId));
      toast.success('User unblocked successfully');
    } catch (error) {
      console.error('Error unblocking user:', error);
      toast.error('Failed to unblock user');
    }
    setUnblockUserId(null);
  };

  const unmuteUser = async (muteId: string) => {
    try {
      const { error } = await supabase
        .from('muted_users')
        .delete()
        .eq('id', muteId);

      if (error) throw error;

      setMutedUsers(prev => prev.filter(m => m.id !== muteId));
      toast.success('User unmuted successfully');
    } catch (error) {
      console.error('Error unmuting user:', error);
      toast.error('Failed to unmute user');
    }
    setUnmuteUserId(null);
  };

  const isMuteActive = (mutedUntil: string | null) => {
    if (!mutedUntil) return true; // Permanent mute
    return new Date(mutedUntil) > new Date();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Blocked & Muted Users
          </CardTitle>
          <CardDescription>
            Manage users you've blocked or muted
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="blocked">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="blocked">
                <UserX className="w-4 h-4 mr-2" />
                Blocked ({blockedUsers.length})
              </TabsTrigger>
              <TabsTrigger value="muted">
                <VolumeX className="w-4 h-4 mr-2" />
                Muted ({mutedUsers.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="blocked" className="space-y-4 mt-4">
              {blockedUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <UserX className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No blocked users</p>
                </div>
              ) : (
                blockedUsers.map(blocked => (
                  <div key={blocked.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={blocked.blocked_user.avatar_url} />
                        <AvatarFallback>
                          {blocked.blocked_user.full_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{blocked.blocked_user.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Blocked {new Date(blocked.blocked_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUnblockUserId(blocked.id)}
                    >
                      Unblock
                    </Button>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="muted" className="space-y-4 mt-4">
              {mutedUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <VolumeX className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No muted users</p>
                </div>
              ) : (
                mutedUsers.map(muted => (
                  <div key={muted.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={muted.muted_user.avatar_url} />
                        <AvatarFallback>
                          {muted.muted_user.full_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{muted.muted_user.full_name}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-muted-foreground">
                            Muted {new Date(muted.muted_at).toLocaleDateString()}
                          </p>
                          {isMuteActive(muted.muted_until) && (
                            <Badge variant="secondary" className="text-xs">
                              {muted.muted_until ? 
                                `Until ${new Date(muted.muted_until).toLocaleDateString()}` : 
                                'Permanent'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUnmuteUserId(muted.id)}
                    >
                      Unmute
                    </Button>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Unblock Confirmation Dialog */}
      <AlertDialog open={!!unblockUserId} onOpenChange={() => setUnblockUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unblock User?</AlertDialogTitle>
            <AlertDialogDescription>
              This user will be able to interact with you again. You can always block them later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => unblockUserId && unblockUser(unblockUserId)}>
              Unblock
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unmute Confirmation Dialog */}
      <AlertDialog open={!!unmuteUserId} onOpenChange={() => setUnmuteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unmute User?</AlertDialogTitle>
            <AlertDialogDescription>
              You will start seeing content from this user again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => unmuteUserId && unmuteUser(unmuteUserId)}>
              Unmute
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
