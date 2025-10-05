import { useState, useEffect } from 'react';
import { Plus, Grid, List, Sparkles, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Collection {
  id: string;
  name: string;
  description: string;
  cover_image?: string;
  item_count: number;
  created_at: string;
  is_public: boolean;
}

interface DynamicList {
  id: string;
  name: string;
  criteria: any;
  auto_update: boolean;
  item_count: number;
  created_at: string;
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [dynamicLists, setDynamicLists] = useState<DynamicList[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCollection, setNewCollection] = useState({ name: '', description: '' });
  const { toast } = useToast();

  useEffect(() => {
    loadCollections();
    loadDynamicLists();
  }, []);

  const loadCollections = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('wardrobe_collections')
        .select(`
          *,
          collection_items:wardrobe_collection_items(count)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formatted = (data as any)?.map((col: any) => ({
        id: col.id,
        name: col.name,
        description: col.description || '',
        cover_image: col.cover_image,
        item_count: col.collection_items?.[0]?.count || 0,
        created_at: col.created_at,
        is_public: col.is_public || false
      })) || [];

      setCollections(formatted);
    } catch (error) {
      console.error('Error loading collections:', error);
      toast({
        title: 'Error',
        description: 'Failed to load collections',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadDynamicLists = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('smart_lists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formatted = (data as any)?.map((list: any) => ({
        id: list.id,
        name: list.name,
        criteria: list.criteria,
        auto_update: list.auto_update || false,
        item_count: 0, // Will be calculated dynamically
        created_at: list.created_at
      })) || [];

      setDynamicLists(formatted);
    } catch (error) {
      console.error('Error loading dynamic lists:', error);
    }
  };

  const handleCreateCollection = async () => {
    if (!newCollection.name.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a collection name',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('wardrobe_collections')
        .insert({
          user_id: user.id,
          name: newCollection.name,
          description: newCollection.description,
          is_public: false
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Collection created successfully'
      });

      setIsCreateDialogOpen(false);
      setNewCollection({ name: '', description: '' });
      loadCollections();
    } catch (error) {
      console.error('Error creating collection:', error);
      toast({
        title: 'Error',
        description: 'Failed to create collection',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteCollection = async (id: string) => {
    try {
      const { error } = await supabase
        .from('wardrobe_collections')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Collection deleted'
      });

      loadCollections();
    } catch (error) {
      console.error('Error deleting collection:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete collection',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24 pt-4 px-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Collections & Lists</h1>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="text-muted-foreground">
          Organize your wardrobe into custom collections and smart lists
        </p>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto">
        <Tabs defaultValue="collections">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="collections">Collections</TabsTrigger>
            <TabsTrigger value="smart-lists">
              <Sparkles className="h-4 w-4 mr-2" />
              Smart Lists
            </TabsTrigger>
          </TabsList>

          {/* Collections Tab */}
          <TabsContent value="collections">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">My Collections</h2>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Collection
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Collection</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Name</label>
                      <Input
                        placeholder="e.g., Summer Outfits"
                        value={newCollection.name}
                        onChange={(e) => setNewCollection({ ...newCollection, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Description</label>
                      <Textarea
                        placeholder="Describe your collection..."
                        value={newCollection.description}
                        onChange={(e) => setNewCollection({ ...newCollection, description: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <Button onClick={handleCreateCollection} className="w-full">
                      Create Collection
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : collections.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground mb-4">No collections yet</p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Collection
                </Button>
              </Card>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
                {collections.map((collection) => (
                  <Card key={collection.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    {collection.cover_image && (
                      <div className="aspect-video bg-muted overflow-hidden">
                        <img
                          src={collection.cover_image}
                          alt={collection.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg">{collection.name}</h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCollection(collection.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      {collection.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {collection.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">
                          {collection.item_count} {collection.item_count === 1 ? 'item' : 'items'}
                        </Badge>
                        {collection.is_public && (
                          <Badge variant="outline">Public</Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Smart Lists Tab */}
          <TabsContent value="smart-lists">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Smart Lists</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Smart List
              </Button>
            </div>

            {dynamicLists.length === 0 ? (
              <Card className="p-12 text-center">
                <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  Smart Lists automatically organize your wardrobe based on rules you define
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Smart List
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {dynamicLists.map((list) => (
                  <Card key={list.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{list.name}</h3>
                          {list.auto_update && (
                            <Badge variant="secondary" className="gap-1">
                              <Sparkles className="h-3 w-3" />
                              Auto-update
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {list.item_count} items
                        </p>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
