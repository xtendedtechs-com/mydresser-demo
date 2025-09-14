import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, UserPlus, Trash2, Copy, Shield } from "lucide-react";
import { format } from "date-fns";

interface Invitation {
  id: string;
  email: string;
  token: string;
  invited_by: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
}

const InvitationManager = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingInvitations, setFetchingInvitations] = useState(true);
  const { toast } = useToast();

  const fetchInvitations = async () => {
    try {
      const { data, error } = await supabase.rpc('list_invitations_admin');
      if (error) throw error;
      setInvitations(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching invitations",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setFetchingInvitations(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const createInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('create_invitation_admin', {
        invitation_email: newEmail.trim()
      });

      if (error) throw error;

      toast({
        title: "Invitation created successfully!",
        description: `Invitation sent to ${newEmail}`,
      });

      setNewEmail("");
      await fetchInvitations();
    } catch (error: any) {
      toast({
        title: "Error creating invitation",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const revokeInvitation = async (token: string, email: string) => {
    try {
      const { data, error } = await supabase.rpc('revoke_invitation_admin', {
        invitation_token: token
      });

      if (error) throw error;

      if (data) {
        toast({
          title: "Invitation revoked",
          description: `Revoked invitation for ${email}`,
        });
        await fetchInvitations();
      }
    } catch (error: any) {
      toast({
        title: "Error revoking invitation",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const copyInvitationLink = (token: string) => {
    const inviteUrl = `${window.location.origin}/auth?invite=${token}`;
    navigator.clipboard.writeText(inviteUrl);
    toast({
      title: "Invitation link copied!",
      description: "Share this link with the invitee",
    });
  };

  const getStatusBadge = (invitation: Invitation) => {
    const now = new Date();
    const expiresAt = new Date(invitation.expires_at);
    
    if (invitation.used_at) {
      return <Badge variant="secondary">Used</Badge>;
    } else if (now > expiresAt) {
      return <Badge variant="destructive">Expired</Badge>;
    } else {
      return <Badge variant="default">Active</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Invitation Management
          </CardTitle>
          <CardDescription>
            Manage user invitations for your secure platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={createInvitation} className="flex gap-2">
            <div className="flex-1">
              <Input
                type="email"
                placeholder="Enter email address to invite"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>Loading...</>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Invitation
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Invitations</CardTitle>
          <CardDescription>
            View and manage all platform invitations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {fetchingInvitations ? (
            <div className="text-center py-8">Loading invitations...</div>
          ) : invitations.length === 0 ? (
            <Alert>
              <AlertDescription>
                No invitations found. Create your first invitation above.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitations.map((invitation) => (
                    <TableRow key={invitation.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {invitation.email}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(invitation)}</TableCell>
                      <TableCell>
                        {format(new Date(invitation.created_at), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        {format(new Date(invitation.expires_at), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyInvitationLink(invitation.token)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          {!invitation.used_at && new Date() < new Date(invitation.expires_at) && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => revokeInvitation(invitation.token, invitation.email)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InvitationManager;