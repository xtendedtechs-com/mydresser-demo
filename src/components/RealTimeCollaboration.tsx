import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  Share2, 
  UserPlus, 
  Eye, 
  MessageSquare, 
  ThumbsUp,
  Copy,
  Link as LinkIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Collaborator {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url?: string;
  status: 'active' | 'idle' | 'offline';
  role: 'owner' | 'editor' | 'viewer';
  joined_at: string;
}

interface CollaborationSession {
  id: string;
  name: string;
  type: 'outfit' | 'collection' | 'wardrobe';
  collaborators: Collaborator[];
  share_link: string;
  is_public: boolean;
}

const RealTimeCollaboration = () => {
  const [sessions, setSessions] = useState<CollaborationSession[]>([]);
  const [activeSession, setActiveSession] = useState<CollaborationSession | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSessions();
    setupRealtimeSubscription();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    try {
      // Mock data - in production, fetch from database
      const mockSessions: CollaborationSession[] = [
        {
          id: '1',
          name: 'Summer Outfit Planning',
          type: 'outfit',
          collaborators: [
            {
              id: '1',
              user_id: 'user1',
              full_name: 'You',
              status: 'active',
              role: 'owner',
              joined_at: new Date().toISOString()
            },
            {
              id: '2',
              user_id: 'user2',
              full_name: 'Sarah Johnson',
              avatar_url: undefined,
              status: 'active',
              role: 'editor',
              joined_at: new Date(Date.now() - 3600000).toISOString()
            }
          ],
          share_link: 'mydresser.app/collab/abc123',
          is_public: false
        }
      ];
      setSessions(mockSessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    // In production, subscribe to collaboration changes
    const channel = supabase
      .channel('collaboration')
      .on('presence', { event: 'sync' }, () => {
        // Handle presence sync
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        toast({
          title: "Someone joined!",
          description: "A collaborator has joined the session",
        });
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        toast({
          title: "Someone left",
          description: "A collaborator has left the session",
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const createSession = async (type: 'outfit' | 'collection' | 'wardrobe') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      toast({
        title: "Session created!",
        description: "You can now invite collaborators",
      });

      loadSessions();
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const inviteCollaborator = async () => {
    if (!inviteEmail || !activeSession) return;

    try {
      toast({
        title: "Invitation sent!",
        description: `Invited ${inviteEmail} to collaborate`,
      });
      setInviteEmail("");
    } catch (error) {
      console.error('Error inviting collaborator:', error);
    }
  };

  const copyShareLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copied!",
      description: "Share link copied to clipboard",
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-primary/10 text-primary border-primary/20';
      case 'editor': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'viewer': return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      default: return 'bg-muted';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Real-Time Collaboration
          </h2>
          <p className="text-muted-foreground">Work together on outfits and collections</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => createSession('outfit')}>
            <Share2 className="w-4 h-4 mr-2" />
            New Session
          </Button>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sessions.map((session) => (
          <Card key={session.id} className="p-4 hover:shadow-lg transition-shadow">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{session.name}</h3>
                  <Badge variant="outline" className="mt-1 capitalize">
                    {session.type}
                  </Badge>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setActiveSession(session)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
              </div>

              {/* Collaborators */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Collaborators ({session.collaborators.length})</p>
                <div className="flex flex-wrap gap-2">
                  {session.collaborators.slice(0, 5).map((collab) => (
                    <div key={collab.id} className="relative">
                      <Avatar className="w-8 h-8 border-2 border-background">
                        <AvatarImage src={collab.avatar_url} />
                        <AvatarFallback>{collab.full_name[0]}</AvatarFallback>
                      </Avatar>
                      <div 
                        className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-background ${getStatusColor(collab.status)}`}
                      />
                    </div>
                  ))}
                  {session.collaborators.length > 5 && (
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs">
                      +{session.collaborators.length - 5}
                    </div>
                  )}
                </div>
              </div>

              {/* Share Link */}
              <div className="flex items-center gap-2">
                <Input 
                  value={session.share_link} 
                  readOnly 
                  className="flex-1 text-sm"
                />
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => copyShareLink(session.share_link)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Active Session Details */}
      {activeSession && (
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{activeSession.name}</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setActiveSession(null)}
              >
                Close
              </Button>
            </div>

            {/* Invite Collaborators */}
            <div className="space-y-3">
              <h4 className="font-medium">Invite Collaborators</h4>
              <div className="flex gap-2">
                <Input 
                  placeholder="Enter email address"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && inviteCollaborator()}
                />
                <Button onClick={inviteCollaborator}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite
                </Button>
              </div>
            </div>

            {/* Collaborator List */}
            <div className="space-y-3">
              <h4 className="font-medium">Active Collaborators</h4>
              <div className="space-y-2">
                {activeSession.collaborators.map((collab) => (
                  <div 
                    key={collab.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar>
                          <AvatarImage src={collab.avatar_url} />
                          <AvatarFallback>{collab.full_name[0]}</AvatarFallback>
                        </Avatar>
                        <div 
                          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(collab.status)}`}
                        />
                      </div>
                      <div>
                        <p className="font-medium">{collab.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                          Joined {new Date(collab.joined_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge className={getRoleColor(collab.role)}>
                      {collab.role}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Feed */}
            <div className="space-y-3">
              <h4 className="font-medium">Recent Activity</h4>
              <div className="space-y-2">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1 text-sm">
                    <span className="font-medium">Sarah</span> added a comment
                    <p className="text-xs text-muted-foreground">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <ThumbsUp className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1 text-sm">
                    <span className="font-medium">Sarah</span> liked an outfit
                    <p className="text-xs text-muted-foreground">5 minutes ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {sessions.length === 0 && !loading && (
        <Card className="p-12 text-center">
          <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">No Active Sessions</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create a collaboration session to work with friends
          </p>
          <Button onClick={() => createSession('outfit')}>
            <Share2 className="w-4 h-4 mr-2" />
            Start Collaborating
          </Button>
        </Card>
      )}
    </div>
  );
};

export default RealTimeCollaboration;
