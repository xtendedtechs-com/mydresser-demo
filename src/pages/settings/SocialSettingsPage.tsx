import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Users, Eye, MessageCircle, Heart, Share2, Bell } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const SocialSettingsPage = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    profileVisibility: 'public',
    showFollowers: true,
    showFollowing: true,
    allowComments: true,
    allowLikes: true,
    allowShares: true,
    showActivity: true,
    notifyFollows: true,
    notifyLikes: true,
    notifyComments: true,
    notifyShares: true
  });

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your social settings have been updated successfully."
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto p-6 max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Social & Community Settings</h1>
          <p className="text-muted-foreground">
            Manage your social presence and community interactions
          </p>
        </div>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Privacy Settings
            </CardTitle>
            <CardDescription>
              Control who can see your profile and content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Profile Visibility</Label>
              <Select
                value={settings.profileVisibility}
                onValueChange={(value) => setSettings({ ...settings, profileVisibility: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public - Anyone can view</SelectItem>
                  <SelectItem value="followers">Followers Only</SelectItem>
                  <SelectItem value="private">Private - Invite only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Followers</Label>
                <p className="text-sm text-muted-foreground">Display your follower count</p>
              </div>
              <Switch
                checked={settings.showFollowers}
                onCheckedChange={(checked) => setSettings({ ...settings, showFollowers: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Following</Label>
                <p className="text-sm text-muted-foreground">Display who you follow</p>
              </div>
              <Switch
                checked={settings.showFollowing}
                onCheckedChange={(checked) => setSettings({ ...settings, showFollowing: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Activity</Label>
                <p className="text-sm text-muted-foreground">Display your recent activity</p>
              </div>
              <Switch
                checked={settings.showActivity}
                onCheckedChange={(checked) => setSettings({ ...settings, showActivity: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Interaction Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Interaction Settings
            </CardTitle>
            <CardDescription>
              Control how others can interact with your content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 flex items-center gap-2">
                <Heart className="w-4 h-4" />
                <div>
                  <Label>Allow Likes</Label>
                  <p className="text-sm text-muted-foreground">Let others like your posts</p>
                </div>
              </div>
              <Switch
                checked={settings.allowLikes}
                onCheckedChange={(checked) => setSettings({ ...settings, allowLikes: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5 flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                <div>
                  <Label>Allow Comments</Label>
                  <p className="text-sm text-muted-foreground">Let others comment on your posts</p>
                </div>
              </div>
              <Switch
                checked={settings.allowComments}
                onCheckedChange={(checked) => setSettings({ ...settings, allowComments: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5 flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                <div>
                  <Label>Allow Shares</Label>
                  <p className="text-sm text-muted-foreground">Let others share your posts</p>
                </div>
              </div>
              <Switch
                checked={settings.allowShares}
                onCheckedChange={(checked) => setSettings({ ...settings, allowShares: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Social Notifications
            </CardTitle>
            <CardDescription>
              Choose what social activities notify you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>New Followers</Label>
                <p className="text-sm text-muted-foreground">When someone follows you</p>
              </div>
              <Switch
                checked={settings.notifyFollows}
                onCheckedChange={(checked) => setSettings({ ...settings, notifyFollows: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Post Likes</Label>
                <p className="text-sm text-muted-foreground">When someone likes your post</p>
              </div>
              <Switch
                checked={settings.notifyLikes}
                onCheckedChange={(checked) => setSettings({ ...settings, notifyLikes: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Post Comments</Label>
                <p className="text-sm text-muted-foreground">When someone comments on your post</p>
              </div>
              <Switch
                checked={settings.notifyComments}
                onCheckedChange={(checked) => setSettings({ ...settings, notifyComments: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Post Shares</Label>
                <p className="text-sm text-muted-foreground">When someone shares your post</p>
              </div>
              <Switch
                checked={settings.notifyShares}
                onCheckedChange={(checked) => setSettings({ ...settings, notifyShares: checked })}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline">Reset to Defaults</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
};

export default SocialSettingsPage;