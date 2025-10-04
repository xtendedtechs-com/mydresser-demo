import { useState } from 'react';
import { SocialFeed } from '@/components/SocialFeed';
import { ActivityFeed } from '@/components/ActivityFeed';
import { UserConnectionsCard } from '@/components/UserConnectionsCard';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Image as ImageIcon } from 'lucide-react';
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

          {/* Right Column - Activity & Connections */}
          <div className="space-y-6">
            <UserConnectionsCard />
            <ActivityFeed />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialPage;
