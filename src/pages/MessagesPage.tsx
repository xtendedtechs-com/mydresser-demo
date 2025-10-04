import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Search } from 'lucide-react';
import { useMessages } from '@/hooks/useMessages';
import { MessagingDialog } from '@/components/MessagingDialog';
import { supabase } from '@/integrations/supabase/client';

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userProfiles, setUserProfiles] = useState<Map<string, any>>(new Map());
  const { conversations, loadingConversations } = useMessages();

  useEffect(() => {
    // Fetch profiles for all conversation partners
    const fetchProfiles = async () => {
      if (!conversations) return;
      
      const partnerIds = conversations.map(c => c.partnerId);
      const { data } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', partnerIds);

      const profileMap = new Map();
      data?.forEach(profile => {
        profileMap.set(profile.user_id, profile);
      });
      setUserProfiles(profileMap);
    };

    fetchProfiles();
  }, [conversations]);

  const filteredConversations = conversations?.filter(conv => {
    const profile = userProfiles.get(conv.partnerId);
    const name = profile?.full_name || 'User';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loadingConversations) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Messages</h1>
          <p className="text-muted-foreground">
            Chat with buyers and sellers
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="space-y-2">
          {!filteredConversations || filteredConversations.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
                <p className="text-muted-foreground">
                  Start a conversation by messaging a seller or buyer
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredConversations.map((conversation) => {
              const profile = userProfiles.get(conversation.partnerId);
              const name = profile?.full_name || 'User';
              const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();

              return (
                <Card
                  key={conversation.partnerId}
                  className="cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => setSelectedConversation(conversation.partnerId)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold truncate">{name}</h3>
                          <span className="text-xs text-muted-foreground">
                            {new Date(conversation.lastMessageAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground truncate">
                            {conversation.lastMessage}
                          </p>
                          {conversation.unread && (
                            <Badge variant="default" className="ml-2">New</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Messaging Dialog */}
        {selectedConversation && (
          <MessagingDialog
            open={!!selectedConversation}
            onOpenChange={(open) => !open && setSelectedConversation(null)}
            receiverId={selectedConversation}
            receiverName={userProfiles.get(selectedConversation)?.full_name}
          />
        )}
      </div>
    </div>
  );
}
