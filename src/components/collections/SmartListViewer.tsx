import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, RefreshCw, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SmartListItem {
  item_id: string;
  item_name: string;
  item_category: string;
  item_color: string;
  match_score: number;
}

interface SmartListViewerProps {
  listId: string;
  listName: string;
  autoUpdate: boolean;
  onDelete?: () => void;
}

export function SmartListViewer({ listId, listName, autoUpdate, onDelete }: SmartListViewerProps) {
  const [items, setItems] = useState<SmartListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    evaluateList();
  }, [listId]);

  const evaluateList = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('evaluate_smart_list', {
          list_id_param: listId
        });

      if (error) throw error;

      setItems(data || []);
    } catch (error: any) {
      console.error('Error evaluating smart list:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to evaluate smart list',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('smart_lists')
        .delete()
        .eq('id', listId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Smart list deleted'
      });

      onDelete?.();
    } catch (error: any) {
      console.error('Error deleting smart list:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete smart list',
        variant: 'destructive'
      });
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-lg">{listName}</h3>
            {autoUpdate && (
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="h-3 w-3" />
                Auto-update
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {items.length} {items.length === 1 ? 'item' : 'items'} match
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={evaluateList}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>

      {items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-4">
          {items.slice(0, 6).map((item) => (
            <div
              key={item.item_id}
              className="flex items-center gap-2 p-2 bg-muted rounded-lg"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.item_name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.item_category} • {item.item_color}
                </p>
              </div>
              <Badge variant="secondary" className="text-xs">
                {item.match_score}%
              </Badge>
            </div>
          ))}
          {items.length > 6 && (
            <div className="flex items-center justify-center p-2 text-sm text-muted-foreground">
              +{items.length - 6} more
            </div>
          )}
        </div>
      )}
    </Card>
  );
}