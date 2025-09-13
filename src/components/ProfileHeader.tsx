import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Share2, Users, UserPlus } from "lucide-react";
import { UserProfile } from "@/hooks/useProfile";

interface ProfileHeaderProps {
  profile: UserProfile;
}

const ProfileHeader = ({ profile }: ProfileHeaderProps) => {
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'professional':
        return 'bg-accent text-accent-foreground';
      case 'merchant':
        return 'bg-primary text-primary-foreground';
      case 'admin':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const getAuthLevelText = (level: string) => {
    switch (level) {
      case 'intermediate':
        return 'Verified Professional';
      case 'advanced':
        return 'Verified Merchant';
      default:
        return 'Basic User';
    }
  };

  return (
    <div className="flex flex-col space-y-4 p-6 bg-card rounded-2xl border">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback className="text-lg font-semibold">
              {profile.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{profile.full_name || 'User'}</h1>
              <Badge className={getRoleBadgeColor(profile.role)}>
                {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{getAuthLevelText(profile.auth_level)}</p>
          </div>
        </div>
        
        <Button variant="ghost" size="icon">
          <Share2 className="w-5 h-5" />
        </Button>
      </div>

      {profile.bio && (
        <p className="text-sm text-muted-foreground">{profile.bio}</p>
      )}

      {profile.location && (
        <p className="text-sm text-muted-foreground">📍 {profile.location}</p>
      )}

      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span className="font-medium">0</span>
            <span className="text-muted-foreground">followers</span>
          </div>
          <div className="flex items-center gap-1">
            <UserPlus className="w-4 h-4" />
            <span className="font-medium">0</span>
            <span className="text-muted-foreground">following</span>
          </div>
        </div>
        
        <div className="text-right">
          <div className="font-semibold text-primary">Style Score: {profile.style_score}</div>
          <div className="text-xs text-muted-foreground">
            Joined {new Date(profile.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;