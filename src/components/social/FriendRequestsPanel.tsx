import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, X, UserPlus, Clock, Users } from 'lucide-react';
import { useFriendRequests } from '@/hooks/useFriendRequests';

export const FriendRequestsPanel = () => {
  const {
    receivedRequests,
    sentRequests,
    friends,
    loading,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest
  } = useFriendRequests();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Friend Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          Friend Requests
          {receivedRequests.length > 0 && (
            <Badge variant="destructive" className="ml-auto">
              {receivedRequests.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="received" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="received">
              Received ({receivedRequests.length})
            </TabsTrigger>
            <TabsTrigger value="sent">
              Sent ({sentRequests.length})
            </TabsTrigger>
            <TabsTrigger value="friends">
              Friends ({friends.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="received" className="space-y-3 mt-4">
            {receivedRequests.length === 0 ? (
              <div className="text-center py-6">
                <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  No pending friend requests
                </p>
              </div>
            ) : (
              receivedRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <Avatar>
                    <AvatarImage src={request.sender_profile?.avatar_url} />
                    <AvatarFallback>
                      {request.sender_profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {request.sender_profile?.full_name}
                    </p>
                    {request.sender_profile?.bio && (
                      <p className="text-xs text-muted-foreground truncate">
                        {request.sender_profile.bio}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => acceptFriendRequest(request.id)}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => rejectFriendRequest(request.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="sent" className="space-y-3 mt-4">
            {sentRequests.length === 0 ? (
              <div className="text-center py-6">
                <UserPlus className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  No sent friend requests
                </p>
              </div>
            ) : (
              sentRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <Avatar>
                    <AvatarImage src={request.receiver_profile?.avatar_url} />
                    <AvatarFallback>
                      {request.receiver_profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {request.receiver_profile?.full_name}
                    </p>
                    <Badge variant="outline" className="text-xs mt-1">
                      {request.status === 'pending' ? 'Pending' : request.status}
                    </Badge>
                  </div>

                  {request.status === 'pending' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => cancelFriendRequest(request.id)}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="friends" className="space-y-3 mt-4">
            {friends.length === 0 ? (
              <div className="text-center py-6">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  No friends yet. Start by sending friend requests!
                </p>
              </div>
            ) : (
              <div className="text-center py-6">
                <Users className="w-12 h-12 mx-auto text-primary mb-3" />
                <p className="text-lg font-semibold">{friends.length}</p>
                <p className="text-sm text-muted-foreground">Friends</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
