import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Upload, Folder, Layers, ChevronRight } from "lucide-react";
import { useWardrobe } from "@/hooks/useWardrobe";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Collection {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  cover_image?: string;
  type?: string;
  is_public?: boolean;
  created_at: string;
  updated_at: string;
}

interface CollectionsListsProps {
  className?: string;
}

const CollectionsLists = ({ className }: CollectionsListsProps) => {
  const { items } = useWardrobe();
  const { toast } = useToast();

  const [collections, setCollections] = useState<Collection[]>([]);
  const [loadingCollections, setLoadingCollections] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [collectionItems, setCollectionItems] = useState<any[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      setLoadingCollections(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setCollections(data || []);
    } catch (err: any) {
      toast({ title: 'Error loading collections', description: err.message, variant: 'destructive' });
    } finally {
      setLoadingCollections(false);
    }
  };

  const createCollection = async () => {
    if (!newName.trim()) {
      toast({ title: 'Name required', description: 'Please enter a collection name', variant: 'destructive' });
      return;
    }

    try {
      setCreating(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('collections')
        .insert({
          user_id: user.id,
          name: newName.trim(),
          description: newDesc || null,
          type: 'custom',
          is_public: false
        })
        .select()
        .single();
      if (error) throw error;
      setCollections(prev => [data as any, ...prev]);
      setNewName("");
      setNewDesc("");
      toast({ title: 'Collection created' });
    } catch (err: any) {
      toast({ title: 'Create failed', description: err.message, variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const loadCollectionItems = async (collectionId: string) => {
    try {
      setSelectedCollection(collectionId);
      setLoadingItems(true);
      const { data: ci, error } = await supabase
        .from('collection_items')
        .select('*')
        .eq('collection_id', collectionId);
      if (error) throw error;

      const wardrobeIds = ci.filter(c => c.wardrobe_item_id).map(c => c.wardrobe_item_id);
      const outfitIds = ci.filter(c => c.outfit_id).map(c => c.outfit_id);

      const results: any[] = [];
      if (wardrobeIds.length) {
        const { data: wi } = await supabase
          .from('wardrobe_items')
          .select('*')
          .in('id', wardrobeIds);
        results.push(...(wi || []).map(w => ({ type: 'item', data: w })));
      }
      if (outfitIds.length) {
        const { data: of } = await supabase
          .from('outfits')
          .select('*')
          .in('id', outfitIds);
        results.push(...(of || []).map(o => ({ type: 'outfit', data: o })));
      }

      setCollectionItems(results);
    } catch (err: any) {
      toast({ title: 'Load failed', description: err.message, variant: 'destructive' });
    } finally {
      setLoadingItems(false);
    }
  };

  // Lists
  const lists = useMemo(() => {
    const now = Date.now();
    const byCreated = [...items].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const mostWorn = [...items].sort((a,b) => (b.wear_count||0)-(a.wear_count||0));
    const leastWorn = [...items].sort((a,b) => (a.wear_count||0)-(b.wear_count||0));
    const lastUsed = [...items].filter(i => i.last_worn).sort((a,b) => new Date(b.last_worn!).getTime() - new Date(a.last_worn!).getTime());
    const favorites = items.filter(i => i.is_favorite);
    const wishlist = items.filter(i => i.tags?.map(t=>t.toLowerCase()).includes('wishlist'));
    const shopping = items.filter(i => i.tags?.map(t=>t.toLowerCase()).includes('shopping'));
    const laundry = items.filter(i => i.tags?.map(t=>t.toLowerCase()).includes('laundry'));

    return {
      favorites,
      recentlyAdded: byCreated.slice(0, 12),
      mostWorn: mostWorn.slice(0, 12),
      leastWorn: leastWorn.slice(0, 12),
      lastUsed: lastUsed.slice(0, 12),
      wishlist,
      shopping,
      laundry,
    };
  }, [items]);

  return (
    <Card className={`p-4 ${className || ''}`}>
      <Tabs defaultValue="collections" className="w-full">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="collections" className="flex items-center gap-2">
            <Folder className="w-4 h-4" /> Collections
          </TabsTrigger>
          <TabsTrigger value="lists" className="flex items-center gap-2">
            <Layers className="w-4 h-4" /> Lists
          </TabsTrigger>
        </TabsList>

        <TabsContent value="collections" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Card className="p-3">
              <div className="space-y-2">
                <Input placeholder="New collection name" value={newName} onChange={e=>setNewName(e.target.value)} />
                <Input placeholder="Description (optional)" value={newDesc} onChange={e=>setNewDesc(e.target.value)} />
                <Button onClick={createCollection} disabled={creating} className="w-full">
                  {creating ? 'Creating...' : (<span className="flex items-center gap-2"><Plus className="w-4 h-4"/>Create</span>)}
                </Button>
              </div>
            </Card>

            {(loadingCollections ? Array.from({length:3}) : collections).map((col: any, idx: number) => (
              <Card key={col?.id || idx} className="p-3 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-sm">{col?.name || 'Loading...'}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">{col?.description}</p>
                </div>
                {col?.id && (
                  <Button size="sm" variant="outline" onClick={()=>loadCollectionItems(col.id)}>
                    View <ChevronRight className="w-4 h-4 ml-1"/>
                  </Button>
                )}
              </Card>
            ))}
          </div>

          {selectedCollection && (
            <div className="mt-4">
              <h4 className="font-semibold mb-2 text-sm">Collection Items</h4>
              {loadingItems ? (
                <div className="text-sm text-muted-foreground p-4">Loading items...</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {collectionItems.map((ci, i) => (
                    <Card key={i} className="p-3">
                      {ci.type === 'item' ? (
                        <div>
                          <div className="aspect-square bg-muted rounded mb-2 overflow-hidden">
                            {ci.data?.photos?.main ? (
                              <img src={ci.data.photos.main} alt={ci.data.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">👔</div>
                            )}
                          </div>
                          <div className="text-xs font-medium">{ci.data.name}</div>
                          <div className="text-[10px] text-muted-foreground">{ci.data.brand}</div>
                        </div>
                      ) : (
                        <div>
                          <div className="aspect-square bg-accent/20 rounded mb-2 flex items-center justify-center">
                            <span className="text-xs">Saved Outfit</span>
                          </div>
                          <div className="text-xs font-medium">{ci.data.name}</div>
                          <div className="text-[10px] text-muted-foreground">AI Generated</div>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="lists" className="space-y-6 mt-4">
          {/* Favorites */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-sm">My Favorites</h4>
              <Badge variant="secondary">{lists.favorites.length}</Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {lists.favorites.map(it => (
                <Card key={it.id} className="p-2">
                  <div className="aspect-square bg-muted rounded mb-2 overflow-hidden">
                    {it.photos && (it as any).photos?.main ? (
                      <img src={(it as any).photos.main} alt={it.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">👔</div>
                    )}
                  </div>
                  <div className="text-[11px] font-medium truncate">{it.name}</div>
                </Card>
              ))}
            </div>
          </section>

          {/* Recently Added */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-sm">Recently Added</h4>
              <Badge variant="secondary">{lists.recentlyAdded.length}</Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {lists.recentlyAdded.map(it => (
                <Card key={it.id} className="p-2">
                  <div className="aspect-square bg-muted rounded mb-2 overflow-hidden">
                    {it.photos && (it as any).photos?.main ? (
                      <img src={(it as any).photos.main} alt={it.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">👔</div>
                    )}
                  </div>
                  <div className="text-[11px] font-medium truncate">{it.name}</div>
                </Card>
              ))}
            </div>
          </section>

          {/* Most/Least Worn */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm">Most Worn</h4>
                <Badge variant="secondary">{lists.mostWorn.length}</Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {lists.mostWorn.map(it => (
                  <Card key={it.id} className="p-2"><div className="text-[11px] font-medium truncate">{it.name}</div></Card>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm">Least Worn</h4>
                <Badge variant="secondary">{lists.leastWorn.length}</Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {lists.leastWorn.map(it => (
                  <Card key={it.id} className="p-2"><div className="text-[11px] font-medium truncate">{it.name}</div></Card>
                ))}
              </div>
            </div>
          </section>

          {/* Last Used / Wishlist / Shopping / Laundry */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm">Last Used</h4>
                <Badge variant="secondary">{lists.lastUsed.length}</Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {lists.lastUsed.map(it => (
                  <Card key={it.id} className="p-2"><div className="text-[11px] font-medium truncate">{it.name}</div></Card>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm">Wishlist</h4>
                <Badge variant="secondary">{lists.wishlist.length}</Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {lists.wishlist.map(it => (
                  <Card key={it.id} className="p-2"><div className="text-[11px] font-medium truncate">{it.name}</div></Card>
                ))}
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm">Shopping List</h4>
                <Badge variant="secondary">{lists.shopping.length}</Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {lists.shopping.map(it => (
                  <Card key={it.id} className="p-2"><div className="text-[11px] font-medium truncate">{it.name}</div></Card>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm">Laundry</h4>
                <Badge variant="secondary">{lists.laundry.length}</Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {lists.laundry.map(it => (
                  <Card key={it.id} className="p-2"><div className="text-[11px] font-medium truncate">{it.name}</div></Card>
                ))}
              </div>
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default CollectionsLists;
