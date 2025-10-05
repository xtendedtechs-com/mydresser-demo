import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, UserPlus, UserCheck, UserX, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useFriendRequests } from '@/hooks/useFriendRequests';
import { useProfile } from '@/hooks/useProfile';

interface SearchResult {
  user_id: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  style_score?: number;
}

export const UserSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const { sendFriendRequest, isFriend, hasPendingRequest } = useFriendRequests();
  const { user } = useProfile();

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url, bio, style_score')
        .neq('user_id', user?.id || '')
        .or(`full_name.ilike.%${query}%,bio.ilike.%${query}%`)
        .eq('is_profile_public', true)
        .limit(20);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleAddFriend = async (userId: string) => {
    await sendFriendRequest(userId);
  };

  const getButtonState = (userId: string) => {
    if (isFriend(userId)) {
      return { icon: UserCheck, text: 'Friends', variant: 'secondary' as const, disabled: true };
    }
    if (hasPendingRequest(userId)) {
      return { icon: UserX, text: 'Pending', variant: 'outline' as const, disabled: true };
    }
    return { icon: UserPlus, text: 'Add Friend', variant: 'default' as const, disabled: false };
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search users by name or bio..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {searching && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Searching...</p>
        </Card>
      )}

      {!searching && searchQuery.length >= 2 && searchResults.length === 0 && (
        <Card className="p-8 text-center">
          <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No users found</p>
        </Card>
      )}

      {searchResults.length > 0 && (
        <div className="space-y-2">
          {searchResults.map((result) => {
            const buttonState = getButtonState(result.user_id);
            const ButtonIcon = buttonState.icon;

            return (
              <Card key={result.user_id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={result.avatar_url} />
                    <AvatarFallback>
                      {result.full_name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold truncate">{result.full_name}</h4>
                      {result.style_score && result.style_score > 70 && (
                        <Badge variant="secondary" className="text-xs">
                          Style Score: {result.style_score}
                        </Badge>
                      )}
                    </div>
                    {result.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {result.bio}
                      </p>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant={buttonState.variant}
                    disabled={buttonState.disabled}
                    onClick={() => !buttonState.disabled && handleAddFriend(result.user_id)}
                  >
                    <ButtonIcon className="w-4 h-4 mr-2" />
                    {buttonState.text}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
