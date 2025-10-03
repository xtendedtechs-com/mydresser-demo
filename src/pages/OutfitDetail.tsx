import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2, Heart, Sparkles } from 'lucide-react';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { SocialShareButton } from '@/components/SocialShareButton';
import { useToast } from '@/hooks/use-toast';
import { useOutfits } from '@/hooks/useOutfits';

const OutfitDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { deleteOutfit, updateOutfit } = useOutfits();

  const { data: outfit, isLoading } = useQuery({
    queryKey: ['outfit', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('outfits')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const handleDelete = async () => {
    if (!id || !confirm('Are you sure you want to delete this outfit?')) return;
    
    try {
      deleteOutfit(id);
      navigate('/wardrobe');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleToggleFavorite = () => {
    if (!outfit) return;
    updateOutfit({
      id: outfit.id,
      is_favorite: !outfit.is_favorite,
    });
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading outfit..." />;
  }

  if (!outfit) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Outfit not found</h1>
          <Button onClick={() => navigate('/wardrobe')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Wardrobe
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container flex h-16 items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate('/wardrobe')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold truncate mx-4">{outfit.name}</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleFavorite}
            >
              <Heart className={`w-5 h-5 ${outfit.is_favorite ? 'fill-current text-red-500' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-6 space-y-6">
        <Card className="p-6">
          {outfit.photos && typeof outfit.photos === 'object' && (outfit.photos as any).main && (
            <div className="mb-6">
              <img
                src={(outfit.photos as any).main}
                alt={outfit.name}
                className="w-full h-96 object-cover rounded-lg"
              />
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">{outfit.name}</h1>
                {outfit.notes && (
                  <p className="text-muted-foreground">{outfit.notes}</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {outfit.occasion && (
                <Badge variant="secondary">{outfit.occasion}</Badge>
              )}
              {outfit.season && (
                <Badge variant="outline">{outfit.season}</Badge>
              )}
              {outfit.is_ai_generated && (
                <Badge variant="outline">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI Generated
                </Badge>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default OutfitDetail;