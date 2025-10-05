import { useState } from 'react';
import { SocialFeed } from '@/components/SocialFeed';
import { ActivityFeed } from '@/components/ActivityFeed';
import { UserSearch } from '@/components/social/UserSearch';
import { FriendRequestsPanel } from '@/components/social/FriendRequestsPanel';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, Image as ImageIcon, Users, Search } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useSocial } from '@/hooks/useSocial';
import { useToast } from '@/hooks/use-toast';

const SocialPage = () => {
  const [postContent, setPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const { profile } = useProfile();
  const { createPost, refreshSocialData } = useSocial();
  const { toast } = useToast();

  const handleCreatePost = async () => {
    if (!postContent.trim() || isPosting) return;

    setIsPosting(true);
    try {
      await createPost(postContent);
      setPostContent('');
      toast({
        title: 'Post created',
        description: 'Your post has been shared with your community',
      });
      // Refresh feed to show new post
      await refreshSocialData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create post',
        variant: 'destructive',
      });
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Social Hub</h1>
        
        <Tabs defaultValue="feed" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="feed">Feed</TabsTrigger>
            <TabsTrigger value="friends">
              <Users className="w-4 h-4 mr-2" />
              Friends
            </TabsTrigger>
            <TabsTrigger value="search">
              <Search className="w-4 h-4 mr-2" />
              Search
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Main Feed */}
              <div className="lg:col-span-2 space-y-6">
                {/* Create Post Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Share your style</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="What's on your mind?"
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      className="min-h-[100px]"
                    />
                    
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Camera className="w-4 h-4 mr-2" />
                          Photo
                        </Button>
                        <Button variant="outline" size="sm">
                          <ImageIcon className="w-4 h-4 mr-2" />
                          Gallery
                        </Button>
                      </div>
                      
                      <Button 
                        onClick={handleCreatePost}
                        disabled={!postContent.trim() || isPosting}
                      >
                        {isPosting ? 'Posting...' : 'Post'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Social Feed */}
                <SocialFeed />
              </div>

              {/* Right Column - Activity */}
              <div className="space-y-6">
                <ActivityFeed />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="friends" className="mt-6">
            <div className="max-w-4xl mx-auto">
              <FriendRequestsPanel />
            </div>
          </TabsContent>

          <TabsContent value="search" className="mt-6">
            <div className="max-w-4xl mx-auto">
              <UserSearch />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SocialPage;
