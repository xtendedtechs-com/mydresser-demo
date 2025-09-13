import { useState, useEffect } from 'react';
import { Calendar, Plus, Shirt, Droplets, Clock, Settings, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useWardrobe } from '@/hooks/useWardrobe';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface LaundryBatch {
  id: string;
  user_id: string;
  name: string;
  status: 'dirty' | 'washing' | 'drying' | 'clean' | 'completed';
  started_at: string;
  completed_at?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

interface LaundrySchedule {
  id: string;
  schedule_name: string;
  frequency_days: number;
  next_due_date: string;
  auto_schedule: boolean;
}

const LaundryTracker = () => {
  const { items } = useWardrobe();
  const { toast } = useToast();
  const [batches, setBatches] = useState<LaundryBatch[]>([]);
  const [schedules, setSchedules] = useState<LaundrySchedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLaundryData();
  }, []);

  const fetchLaundryData = async () => {
    try {
      setLoading(true);
      
      // Fetch laundry batches
      const { data: batchData, error: batchError } = await supabase
        .from('laundry_batches')
        .select('*')
        .order('created_at', { ascending: false });

      if (batchError) throw batchError;

      // Fetch laundry schedules
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('laundry_schedules')
        .select('*')
        .order('created_at', { ascending: false });

      if (scheduleError) throw scheduleError;

      setBatches((batchData || []) as LaundryBatch[]);
      setSchedules(scheduleData || []);
    } catch (error) {
      console.error('Error fetching laundry data:', error);
      toast({
        title: "Error loading laundry data",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createNewBatch = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newBatch = {
        user_id: user.id,
        name: `Laundry Batch ${new Date().toLocaleDateString()}`,
        status: 'dirty'
      };

      const { data, error } = await supabase
        .from('laundry_batches')
        .insert(newBatch)
        .select()
        .single();

      if (error) throw error;

      setBatches(prev => [data as LaundryBatch, ...prev]);
      toast({
        title: "New laundry batch created",
        description: "You can now add items to this batch.",
      });
    } catch (error) {
      console.error('Error creating batch:', error);
      toast({
        title: "Error creating batch",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateBatchStatus = async (batchId: string, status: string) => {
    try {
      const updates: any = { status };
      if (status === 'completed') {
        updates.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('laundry_batches')
        .update(updates)
        .eq('id', batchId);

      if (error) throw error;

      setBatches(prev => 
        prev.map(batch => 
          batch.id === batchId 
            ? { ...batch, status: status as LaundryBatch['status'], completed_at: updates.completed_at }
            : batch
        )
      );

      toast({
        title: "Batch status updated",
        description: `Batch marked as ${status}.`,
      });
    } catch (error) {
      console.error('Error updating batch:', error);
      toast({
        title: "Error updating batch",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'dirty': return 'bg-red-500';
      case 'washing': return 'bg-blue-500';
      case 'drying': return 'bg-yellow-500';
      case 'clean': return 'bg-green-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-muted';
    }
  };

  const getStatusProgress = (status: string) => {
    switch (status) {
      case 'dirty': return 10;
      case 'washing': return 40;
      case 'drying': return 70;
      case 'clean': return 90;
      case 'completed': return 100;
      default: return 0;
    }
  };

  const dirtyItems = items.filter(item => 
    item.tags && item.tags.includes('dirty')
  );

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading laundry data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Laundry Tracker</h1>
          <p className="text-muted-foreground">Manage your laundry batches and schedules</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button onClick={createNewBatch}>
            <Plus className="mr-2 h-4 w-4" />
            New Batch
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <Shirt className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dirty Items</p>
                <p className="text-2xl font-bold">{dirtyItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Droplets className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Batches</p>
                <p className="text-2xl font-bold">
                  {batches.filter(b => b.status !== 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed Today</p>
                <p className="text-2xl font-bold">
                  {batches.filter(b => 
                    b.status === 'completed' && 
                    b.completed_at && 
                    new Date(b.completed_at).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Next Schedule</p>
                <p className="text-sm font-medium">
                  {schedules.length > 0 
                    ? new Date(schedules[0].next_due_date).toLocaleDateString()
                    : 'None set'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Batches */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Active Batches</h2>
        
        {batches.filter(batch => batch.status !== 'completed').length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Shirt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Active Batches</h3>
              <p className="text-muted-foreground mb-4">
                Create a new laundry batch to get started
              </p>
              <Button onClick={createNewBatch}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Batch
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {batches.filter(batch => batch.status !== 'completed').map((batch) => (
              <Card key={batch.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{batch.name}</CardTitle>
                    <Badge className={getStatusColor(batch.status)}>
                      {batch.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{getStatusProgress(batch.status)}%</span>
                    </div>
                    <Progress value={getStatusProgress(batch.status)} />
                  </div>
                  
                  <div className="flex gap-2">
                    {batch.status === 'dirty' && (
                      <Button 
                        size="sm" 
                        onClick={() => updateBatchStatus(batch.id, 'washing')}
                      >
                        Start Washing
                      </Button>
                    )}
                    {batch.status === 'washing' && (
                      <Button 
                        size="sm" 
                        onClick={() => updateBatchStatus(batch.id, 'drying')}
                      >
                        Start Drying
                      </Button>
                    )}
                    {batch.status === 'drying' && (
                      <Button 
                        size="sm" 
                        onClick={() => updateBatchStatus(batch.id, 'clean')}
                      >
                        Mark Clean
                      </Button>
                    )}
                    {batch.status === 'clean' && (
                      <Button 
                        size="sm" 
                        onClick={() => updateBatchStatus(batch.id, 'completed')}
                      >
                        Complete
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dirty Items Queue */}
      {dirtyItems.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Items Needing Wash</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {dirtyItems.slice(0, 12).map((item) => (
              <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <div className="aspect-square bg-muted overflow-hidden">
                  {item.photos && typeof item.photos === 'object' && item.photos.main ? (
                    <img
                      src={item.photos.main}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Shirt className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <h3 className="text-sm font-medium truncate">{item.name}</h3>
                  <p className="text-xs text-muted-foreground truncate">{item.brand}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LaundryTracker;