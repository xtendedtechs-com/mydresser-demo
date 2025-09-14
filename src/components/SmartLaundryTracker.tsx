import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Shirt, 
  Plus, 
  PlayCircle, 
  CheckCircle, 
  Clock, 
  Droplets,
  Thermometer,
  AlertTriangle,
  Calendar,
  Zap
} from 'lucide-react';
import { useWardrobe } from '@/hooks/useWardrobe';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const SmartLaundryTracker = () => {
  const { items: wardrobeItems } = useWardrobe();
  const { user } = useProfile();
  
  const [batches, setBatches] = useState<any[]>([]);
  const [currentBatch, setCurrentBatch] = useState<any>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLaundryBatches();
  }, []);

  const loadLaundryBatches = async () => {
    try {
      const { data, error } = await supabase
        .from('laundry_batches')
        .select(`
          *,
          laundry_items (
            wardrobe_item_id,
            wardrobe_items (*)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBatches(data || []);
      
      // Set current active batch
      const activeBatch = data?.find((batch: any) => 
        batch.status === 'dirty' || batch.status === 'washing' || batch.status === 'drying'
      );
      setCurrentBatch(activeBatch);
    } catch (error) {
      console.error('Error loading laundry batches:', error);
    }
  };

  const createNewBatch = async () => {
    if (selectedItems.length === 0) {
      toast.error('Please select items to add to laundry');
      return;
    }

    try {
      setLoading(true);
      
      // Create new batch
      const { data: batch, error: batchError } = await supabase
        .from('laundry_batches')
        .insert({
          user_id: user?.id,
          name: `Laundry Batch ${new Date().toLocaleDateString()}`,
          status: 'dirty'
        })
        .select()
        .single();

      if (batchError) throw batchError;

      // Add items to batch
      const laundryItems = selectedItems.map(itemId => ({
        batch_id: batch.id,
        wardrobe_item_id: itemId
      }));

      const { error: itemsError } = await supabase
        .from('laundry_items')
        .insert(laundryItems);

      if (itemsError) throw itemsError;

      setSelectedItems([]);
      await loadLaundryBatches();
      toast.success('Laundry batch created!');
    } catch (error) {
      console.error('Error creating laundry batch:', error);
      toast.error('Failed to create laundry batch');
    } finally {
      setLoading(false);
    }
  };

  const updateBatchStatus = async (batchId: string, status: string) => {
    try {
      const updateData: any = { status };
      
      if (status === 'washing') {
        updateData.started_at = new Date().toISOString();
      } else if (status === 'clean') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('laundry_batches')
        .update(updateData)
        .eq('id', batchId);

      if (error) throw error;

      await loadLaundryBatches();
      toast.success(`Batch updated to ${status}`);
    } catch (error) {
      console.error('Error updating batch status:', error);
      toast.error('Failed to update batch status');
    }
  };

  const addItemToBatch = async (batchId: string, itemId: string) => {
    try {
      const { error } = await supabase
        .from('laundry_items')
        .insert({
          batch_id: batchId,
          wardrobe_item_id: itemId
        });

      if (error) throw error;
      
      await loadLaundryBatches();
      toast.success('Item added to laundry batch');
    } catch (error) {
      console.error('Error adding item to batch:', error);
      toast.error('Failed to add item to batch');
    }
  };

  const getDirtyItems = () => {
    // Get items that are not in any active laundry batch
    const itemsInLaundry = batches
      .filter(batch => batch.status !== 'clean')
      .flatMap(batch => batch.laundry_items?.map((li: any) => li.wardrobe_item_id) || []);
    
    return wardrobeItems.filter(item => 
      !itemsInLaundry.includes(item.id) && 
      (item.wear_count > 0 || item.condition === 'needs_cleaning')
    );
  };

  const getCareInstructions = (item: any) => {
    // Smart care instructions based on material and item type
    const instructions = [];
    
    if (item.material?.toLowerCase().includes('wool')) {
      instructions.push('Cold water only');
      instructions.push('Gentle cycle');
      instructions.push('Air dry');
    } else if (item.material?.toLowerCase().includes('silk')) {
      instructions.push('Hand wash or delicate');
      instructions.push('Cold water');
      instructions.push('No wringing');
    } else if (item.material?.toLowerCase().includes('cotton')) {
      instructions.push('Warm water OK');
      instructions.push('Normal cycle');
      instructions.push('Can tumble dry');
    }
    
    if (item.color?.toLowerCase().includes('white')) {
      instructions.push('Separate from colors');
    }
    
    return instructions;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'dirty': return <Shirt className="w-4 h-4" />;
      case 'washing': return <Droplets className="w-4 h-4 text-blue-500" />;
      case 'drying': return <Thermometer className="w-4 h-4 text-orange-500" />;
      case 'clean': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const dirtyItems = getDirtyItems();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Droplets className="w-5 h-5 text-blue-500" />
            <span>Smart Laundry Tracker</span>
          </CardTitle>
          <CardDescription>
            Automatically track and organize your laundry with smart suggestions
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="current" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="current">Current Batch</TabsTrigger>
          <TabsTrigger value="dirty">Items to Wash</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="current">
          {currentBatch ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      {getStatusIcon(currentBatch.status)}
                      <span>{currentBatch.name}</span>
                    </CardTitle>
                    <CardDescription>
                      Status: {currentBatch.status.charAt(0).toUpperCase() + currentBatch.status.slice(1)}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    {currentBatch.status === 'dirty' && (
                      <Button onClick={() => updateBatchStatus(currentBatch.id, 'washing')}>
                        <PlayCircle className="w-4 h-4 mr-2" />
                        Start Washing
                      </Button>
                    )}
                    {currentBatch.status === 'washing' && (
                      <Button onClick={() => updateBatchStatus(currentBatch.id, 'drying')}>
                        <Thermometer className="w-4 h-4 mr-2" />
                        Move to Drying
                      </Button>
                    )}
                    {currentBatch.status === 'drying' && (
                      <Button onClick={() => updateBatchStatus(currentBatch.id, 'clean')}>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark Clean
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentBatch.laundry_items?.map((laundryItem: any) => {
                    const item = laundryItem.wardrobe_items;
                    const careInstructions = getCareInstructions(item);
                    
                    return (
                      <Card key={item.id} className="p-4">
                        <div className="flex items-center space-x-3 mb-3">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={item.photos?.main || '/placeholder.svg'} />
                            <AvatarFallback>{item.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.brand}</p>
                            <Badge variant="outline" className="text-xs">
                              {item.material || 'Unknown material'}
                            </Badge>
                          </div>
                        </div>
                        
                        {careInstructions.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-xs font-medium flex items-center">
                              <AlertTriangle className="w-3 h-3 mr-1 text-amber-500" />
                              Care Instructions:
                            </p>
                            {careInstructions.map((instruction, index) => (
                              <p key={index} className="text-xs text-muted-foreground pl-4">
                                • {instruction}
                              </p>
                            ))}
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Droplets className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">No active laundry batch</p>
                <p className="text-sm text-muted-foreground">
                  Start by adding items to wash from the "Items to Wash" tab
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="dirty">
          <Card>
            <CardHeader>
              <CardTitle>Items Ready for Laundry</CardTitle>
              <CardDescription>
                {dirtyItems.length} items need washing
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dirtyItems.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {dirtyItems.map((item: any) => (
                      <Card key={item.id} className="p-4">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            checked={selectedItems.includes(item.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedItems([...selectedItems, item.id]);
                              } else {
                                setSelectedItems(selectedItems.filter(id => id !== item.id));
                              }
                            }}
                          />
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={item.photos?.main || '/placeholder.svg'} />
                            <AvatarFallback>{item.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.brand}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {item.wear_count || 0} wears
                              </Badge>
                              {item.material && (
                                <Badge variant="outline" className="text-xs">
                                  {item.material}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                  
                  {selectedItems.length > 0 && (
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <p className="text-sm">
                        {selectedItems.length} items selected for laundry
                      </p>
                      <Button onClick={createNewBatch} disabled={loading}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Laundry Batch
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                  <p className="text-muted-foreground">All items are clean!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <div className="space-y-4">
            {batches.map((batch: any) => (
              <Card key={batch.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        {getStatusIcon(batch.status)}
                        <span>{batch.name}</span>
                      </CardTitle>
                      <CardDescription className="flex items-center space-x-4">
                        <span>Status: {batch.status}</span>
                        <span>Items: {batch.laundry_items?.length || 0}</span>
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(batch.created_at).toLocaleDateString()}
                        </span>
                      </CardDescription>
                    </div>
                    {batch.status !== 'clean' && batch.status !== 'cancelled' && (
                      <Badge variant={batch.status === 'washing' ? 'default' : 'secondary'}>
                        {batch.status}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                {batch.laundry_items && batch.laundry_items.length > 0 && (
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {batch.laundry_items.map((laundryItem: any) => (
                        <Badge key={laundryItem.wardrobe_item_id} variant="outline">
                          {laundryItem.wardrobe_items?.name || 'Unknown Item'}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
            
            {batches.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <Droplets className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No laundry history yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};