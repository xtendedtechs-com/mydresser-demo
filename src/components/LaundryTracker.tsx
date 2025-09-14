import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shirt, 
  Clock, 
  Droplets, 
  Thermometer, 
  RotateCcw, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Timer,
  Play,
  Pause,
  Square
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LaundryItem {
  id: string;
  name: string;
  category: string;
  color: string;
  fabric: string;
  washTemp: 'cold' | 'warm' | 'hot';
  dryMethod: 'air' | 'low' | 'medium' | 'high';
  lastWashed: Date;
  timesWorn: number;
  maxWears: number;
  status: 'clean' | 'dirty' | 'washing' | 'drying';
  careInstructions: string[];
}

interface LaundryLoad {
  id: string;
  items: LaundryItem[];
  type: 'wash' | 'dry';
  status: 'pending' | 'running' | 'completed';
  startTime?: Date;
  duration: number; // in minutes
  temperature: string;
  cycle: string;
}

const LaundryTracker = () => {
  const [laundryItems, setLaundryItems] = useState<LaundryItem[]>([]);
  const [loads, setLoads] = useState<LaundryLoad[]>([]);
  const [activeTab, setActiveTab] = useState('items');
  const [runningTimers, setRunningTimers] = useState<{ [key: string]: number }>({});
  const { toast } = useToast();

  useEffect(() => {
    // Load mock data
    const mockItems: LaundryItem[] = [
      {
        id: '1',
        name: 'White Cotton Shirt',
        category: 'shirts',
        color: 'white',
        fabric: 'cotton',
        washTemp: 'warm',
        dryMethod: 'medium',
        lastWashed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        timesWorn: 2,
        maxWears: 3,
        status: 'dirty',
        careInstructions: ['Machine wash warm', 'Tumble dry medium', 'Iron if needed']
      },
      {
        id: '2',
        name: 'Blue Jeans',
        category: 'pants',
        color: 'blue',
        fabric: 'denim',
        washTemp: 'cold',
        dryMethod: 'air',
        lastWashed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        timesWorn: 1,
        maxWears: 5,
        status: 'clean',
        careInstructions: ['Machine wash cold', 'Air dry', 'Do not bleach']
      }
    ];
    setLaundryItems(mockItems);
  }, []);

  useEffect(() => {
    // Update timers every second
    const interval = setInterval(() => {
      setRunningTimers(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(loadId => {
          if (updated[loadId] > 0) {
            updated[loadId] -= 1;
          } else {
            delete updated[loadId];
            // Load completed
            setLoads(currentLoads => 
              currentLoads.map(load => 
                load.id === loadId 
                  ? { ...load, status: 'completed' as const }
                  : load
              )
            );
            toast({
              title: 'Laundry Complete!',
              description: 'Your laundry cycle has finished.',
            });
          }
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [toast]);

  const needsWashing = laundryItems.filter(item => 
    item.status === 'dirty' || item.timesWorn >= item.maxWears
  );

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const startLoad = (load: LaundryLoad) => {
    const updatedLoad = {
      ...load,
      status: 'running' as const,
      startTime: new Date()
    };
    
    setLoads(prev => prev.map(l => l.id === load.id ? updatedLoad : l));
    setRunningTimers(prev => ({ ...prev, [load.id]: load.duration * 60 }));
    
    toast({
      title: 'Load Started',
      description: `${load.type === 'wash' ? 'Washing' : 'Drying'} cycle started`
    });
  };

  const createNewLoad = () => {
    const newLoad: LaundryLoad = {
      id: Date.now().toString(),
      items: needsWashing.slice(0, 5), // Take first 5 items
      type: 'wash',
      status: 'pending',
      duration: 45, // 45 minutes
      temperature: 'warm',
      cycle: 'normal'
    };
    
    setLoads(prev => [...prev, newLoad]);
    toast({
      title: 'Load Created',
      description: 'New wash load ready to start'
    });
  };

  const getStatusColor = (status: LaundryItem['status']) => {
    switch (status) {
      case 'clean': return 'bg-green-500';
      case 'dirty': return 'bg-red-500';
      case 'washing': return 'bg-blue-500';
      case 'drying': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getWearProgress = (item: LaundryItem) => {
    return (item.timesWorn / item.maxWears) * 100;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Laundry Tracker</h2>
          <p className="text-muted-foreground">Keep track of your laundry and care schedules</p>
        </div>
        <Button onClick={createNewLoad} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Load
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <Shirt className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{needsWashing.length}</p>
              <p className="text-sm text-muted-foreground">Need Washing</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Droplets className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{loads.filter(l => l.status === 'running').length}</p>
              <p className="text-sm text-muted-foreground">Running</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {laundryItems.filter(i => i.status === 'clean').length}
              </p>
              <p className="text-sm text-muted-foreground">Clean Items</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Timer className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{Object.keys(runningTimers).length}</p>
              <p className="text-sm text-muted-foreground">Active Timers</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="loads">Active Loads</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-4">
          <div className="grid gap-4">
            {laundryItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(item.status)}`} />
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-muted-foreground capitalize">
                          {item.category} • {item.fabric} • {item.color}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={item.status === 'clean' ? 'default' : 'secondary'}>
                        {item.status}
                      </Badge>
                      <div className="mt-1 space-y-1">
                        <p className="text-xs text-muted-foreground">
                          Worn {item.timesWorn}/{item.maxWears} times
                        </p>
                        <Progress 
                          value={getWearProgress(item)} 
                          className="w-20 h-1"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Thermometer className="w-3 h-3" />
                      <span className="capitalize">{item.washTemp}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <RotateCcw className="w-3 h-3" />
                      <span className="capitalize">{item.dryMethod} dry</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>
                        Last washed {Math.floor((Date.now() - item.lastWashed.getTime()) / (1000 * 60 * 60 * 24))} days ago
                      </span>
                    </div>
                  </div>
                  
                  {item.careInstructions.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Care Instructions:</p>
                      <div className="flex flex-wrap gap-1">
                        {item.careInstructions.map((instruction, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {instruction}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="loads" className="space-y-4">
          {loads.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Droplets className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">No Active Loads</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create a new load to start tracking your laundry
                </p>
                <Button onClick={createNewLoad}>Create Load</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {loads.map((load) => (
                <Card key={load.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {load.type === 'wash' ? <Droplets className="w-5 h-5" /> : <Thermometer className="w-5 h-5" />}
                        {load.type === 'wash' ? 'Wash' : 'Dry'} Load
                      </CardTitle>
                      <Badge 
                        variant={
                          load.status === 'running' ? 'default' : 
                          load.status === 'completed' ? 'secondary' : 'outline'
                        }
                      >
                        {load.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          {load.items.length} items • {load.cycle} cycle • {load.temperature}
                        </div>
                        {runningTimers[load.id] && (
                          <div className="text-lg font-mono">
                            {formatTime(runningTimers[load.id])}
                          </div>
                        )}
                      </div>

                      {load.status === 'running' && runningTimers[load.id] && (
                        <Progress 
                          value={((load.duration * 60 - runningTimers[load.id]) / (load.duration * 60)) * 100}
                        />
                      )}

                      <div className="flex flex-wrap gap-2">
                        {load.items.slice(0, 3).map((item) => (
                          <Badge key={item.id} variant="outline" className="text-xs">
                            {item.name}
                          </Badge>
                        ))}
                        {load.items.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{load.items.length - 3} more
                          </Badge>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {load.status === 'pending' && (
                          <Button size="sm" onClick={() => startLoad(load)}>
                            <Play className="w-4 h-4 mr-1" />
                            Start
                          </Button>
                        )}
                        {load.status === 'running' && (
                          <Button size="sm" variant="outline">
                            <Pause className="w-4 h-4 mr-1" />
                            Pause
                          </Button>
                        )}
                        {load.status === 'completed' && (
                          <Button size="sm" variant="outline">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Mark Items Clean
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Laundry Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="font-medium">Laundry Day Reminder</p>
                    <p className="text-sm text-muted-foreground">Every Sunday at 9:00 AM</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Upcoming Items to Wash</h4>
                  {needsWashing.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{item.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {item.timesWorn >= item.maxWears ? 'Needs wash' : 'Almost due'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LaundryTracker;