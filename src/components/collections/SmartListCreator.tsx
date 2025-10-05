import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

interface SmartListCriteria {
  category?: string;
  color?: string;
  brand?: string;
  season?: string;
  condition?: string;
  minWears?: number;
  maxWears?: number;
}

interface SmartListCreatorProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function SmartListCreator({ onSuccess, onCancel }: SmartListCreatorProps) {
  const [listName, setListName] = useState('');
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [criteria, setCriteria] = useState<SmartListCriteria>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateList = async () => {
    if (!listName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a list name',
        variant: 'destructive'
      });
      return;
    }

    // Validate at least one criteria is set
    if (Object.keys(criteria).filter(key => criteria[key as keyof SmartListCriteria]).length === 0) {
      toast({
        title: 'Error',
        description: 'Please set at least one criteria',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check rate limit
      const { data: rateLimitData, error: rateLimitError } = await supabase
        .rpc('check_collection_rate_limit', {
          action_type: 'create',
          max_attempts: 10,
          window_minutes: 60
        });

      if (rateLimitError) throw rateLimitError;
      
      const rateLimitResult = rateLimitData as { allowed: boolean } | null;
      if (!rateLimitResult?.allowed) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      const { error } = await supabase
        .from('smart_lists')
        .insert([{
          user_id: user.id,
          name: listName,
          criteria: criteria as any,
          auto_update: autoUpdate
        }]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Smart list created successfully'
      });

      onSuccess?.();
    } catch (error: any) {
      console.error('Error creating smart list:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create smart list',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateCriteria = (key: keyof SmartListCriteria, value: any) => {
    setCriteria(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Create Smart List</h3>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="listName">List Name</Label>
          <Input
            id="listName"
            placeholder="e.g., Summer Favorites"
            value={listName}
            onChange={(e) => setListName(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="autoUpdate">Auto-Update</Label>
            <p className="text-sm text-muted-foreground">
              Automatically update when items match criteria
            </p>
          </div>
          <Switch
            id="autoUpdate"
            checked={autoUpdate}
            onCheckedChange={setAutoUpdate}
          />
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium mb-4">Criteria</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select onValueChange={(value) => updateCriteria('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Any category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any category</SelectItem>
                  <SelectItem value="tops">Tops</SelectItem>
                  <SelectItem value="bottoms">Bottoms</SelectItem>
                  <SelectItem value="dresses">Dresses</SelectItem>
                  <SelectItem value="outerwear">Outerwear</SelectItem>
                  <SelectItem value="shoes">Shoes</SelectItem>
                  <SelectItem value="accessories">Accessories</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="season">Season</Label>
              <Select onValueChange={(value) => updateCriteria('season', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Any season" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any season</SelectItem>
                  <SelectItem value="spring">Spring</SelectItem>
                  <SelectItem value="summer">Summer</SelectItem>
                  <SelectItem value="fall">Fall</SelectItem>
                  <SelectItem value="winter">Winter</SelectItem>
                  <SelectItem value="all-season">All Season</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                placeholder="e.g., Blue, Red"
                onChange={(e) => updateCriteria('color', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                placeholder="e.g., Nike, Zara"
                onChange={(e) => updateCriteria('brand', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="condition">Condition</Label>
              <Select onValueChange={(value) => updateCriteria('condition', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Any condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any condition</SelectItem>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button 
            onClick={handleCreateList} 
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Creating...' : 'Create Smart List'}
          </Button>
          {onCancel && (
            <Button 
              variant="outline" 
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}