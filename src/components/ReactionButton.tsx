import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Star, ThumbsUp } from "lucide-react";
import { useSocial, Reaction } from "@/hooks/useSocial";

interface ReactionButtonProps {
  targetType: string;
  targetId: string;
  reactionType: 'like' | 'love' | 'star';
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

const ReactionButton = ({ 
  targetType, 
  targetId, 
  reactionType, 
  size = 'sm',
  showCount = true 
}: ReactionButtonProps) => {
  const { addReaction, removeReaction, getReactions } = useSocial();
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [userReacted, setUserReacted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReactions();
  }, [targetType, targetId, reactionType]);

  const fetchReactions = async () => {
    const allReactions = await getReactions(targetType, targetId);
    const typeReactions = allReactions.filter(r => r.reaction_type === reactionType);
    setReactions(typeReactions);
    
    // Check if current user has reacted
    // This would need the current user ID from auth context
    // For now, we'll assume false
    setUserReacted(false);
  };

  const handleReaction = async () => {
    if (loading) return;

    setLoading(true);
    try {
      if (userReacted) {
        await removeReaction(targetType, targetId, reactionType);
        setUserReacted(false);
        setReactions(prev => prev.filter(r => r.user_id !== 'current_user_id')); // Would need actual user ID
      } else {
        await addReaction(targetType, targetId, reactionType);
        setUserReacted(true);
        // Add optimistic update
        const newReaction: Reaction = {
          id: 'temp',
          user_id: 'current_user_id', // Would need actual user ID
          post_id: targetId,
          type: reactionType,
          target_type: targetType,
          target_id: targetId,
          reaction_type: reactionType,
          created_at: new Date().toISOString()
        };
        setReactions(prev => [...prev, newReaction]);
      }
    } catch (error) {
      console.error('Error handling reaction:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = () => {
    switch (reactionType) {
      case 'like':
        return <ThumbsUp className="w-4 h-4" />;
      case 'love':
        return <Heart className="w-4 h-4" />;
      case 'star':
        return <Star className="w-4 h-4" />;
      default:
        return <ThumbsUp className="w-4 h-4" />;
    }
  };

  const getLabel = () => {
    switch (reactionType) {
      case 'like':
        return 'Like';
      case 'love':
        return 'Love';
      case 'star':
        return 'Star';
      default:
        return 'React';
    }
  };

  const buttonSize = size === 'lg' ? 'default' : 'sm';
  const iconSize = size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={userReacted ? "default" : "outline"}
        size={buttonSize}
        onClick={handleReaction}
        disabled={loading}
        className={`${userReacted ? 'bg-primary' : ''}`}
      >
        <div className={iconSize}>
          {getIcon()}
        </div>
        {size === 'lg' && <span className="ml-2">{getLabel()}</span>}
      </Button>
      
      {showCount && reactions.length > 0 && (
        <Badge variant="secondary" className="text-xs">
          {reactions.length}
        </Badge>
      )}
    </div>
  );
};

export default ReactionButton;