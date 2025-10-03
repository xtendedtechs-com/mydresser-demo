import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, MessageCircle, Share2, MoreHorizontal, Bookmark } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Comment {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  user?: {
    full_name: string;
    avatar_url: string;
  };
}

interface EnhancedSocialFeedCardProps {
  post: {
    id: string;
    user_id: string;
    content: string;
    image_url?: string;
    created_at: string;
    likes_count: number;
    comments_count: number;
    user?: {
      full_name: string;
      avatar_url: string;
    };
  };
  currentUserId: string;
  onDelete?: () => void;
}

export const EnhancedSocialFeedCard = ({
  post,
  currentUserId,
  onDelete,
}: EnhancedSocialFeedCardProps) => {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [commentsCount, setCommentsCount] = useState(post.comments_count);
  const { toast } = useToast();

  const handleLike = async () => {
    try {
      if (liked) {
        await supabase
          .from("post_reactions" as any)
          .delete()
          .eq("target_id", post.id)
          .eq("user_id", currentUserId);
        setLikesCount((prev) => prev - 1);
      } else {
        await supabase.from("post_reactions" as any).insert({
          target_id: post.id,
          target_type: "social_post",
          user_id: currentUserId,
          reaction_type: "like",
        });
        setLikesCount((prev) => prev + 1);
      }
      setLiked(!liked);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update reaction",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    setSaved(!saved);
    toast({
      title: saved ? "Post unsaved" : "Post saved",
      description: saved ? "Removed from your saved posts" : "Added to your saved posts",
    });
  };

  const loadComments = async () => {
    if (!showComments) {
      const { data } = await supabase
        .from("post_comments" as any)
        .select(`
          id,
          content,
          user_id,
          created_at,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `)
        .eq("post_id", post.id)
        .order("created_at", { ascending: false });

      if (data) {
        setComments(
          data.map((c: any) => ({
            ...c,
            user: c.profiles,
          }))
        );
      }
    }
    setShowComments(!showComments);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const { error } = await supabase.from("post_comments" as any).insert({
        post_id: post.id,
        user_id: currentUserId,
        content: newComment,
      });

      if (error) throw error;

      setNewComment("");
      setCommentsCount((prev) => prev + 1);
      await loadComments();

      toast({
        title: "Comment posted",
        description: "Your comment has been added",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "Check out this post",
        text: post.content,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Post link copied to clipboard",
      });
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={post.user?.avatar_url} />
            <AvatarFallback>
              {post.user?.full_name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{post.user?.full_name || "User"}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>

        {post.user_id === currentUserId && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="text-destructive" onClick={onDelete}>
                Delete Post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm">{post.content}</p>
        {post.image_url && (
          <img
            src={post.image_url}
            alt="Post"
            className="rounded-lg w-full object-cover max-h-96"
          />
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        <div className="flex items-center justify-between w-full">
          <div className="flex gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={handleLike}
            >
              <Heart
                className={`h-5 w-5 ${liked ? "fill-red-500 text-red-500" : ""}`}
              />
              <span className="text-sm">{likesCount}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={loadComments}
            >
              <MessageCircle className="h-5 w-5" />
              <span className="text-sm">{commentsCount}</span>
            </Button>

            <Button variant="ghost" size="sm" className="gap-2" onClick={handleShare}>
              <Share2 className="h-5 w-5" />
            </Button>
          </div>

          <Button variant="ghost" size="icon" onClick={handleSave}>
            <Bookmark className={`h-5 w-5 ${saved ? "fill-current" : ""}`} />
          </Button>
        </div>

        {showComments && (
          <div className="w-full space-y-3 pt-3 border-t">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.user?.avatar_url} />
                  <AvatarFallback>
                    {comment.user?.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 bg-muted rounded-lg p-2">
                  <p className="font-semibold text-sm">
                    {comment.user?.full_name || "User"}
                  </p>
                  <p className="text-sm">{comment.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(comment.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            ))}

            <div className="flex gap-2">
              <Input
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
              />
              <Button onClick={handleAddComment}>Post</Button>
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};
