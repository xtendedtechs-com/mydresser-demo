import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VTOStudio } from '@/components/VTOStudio';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, TrendingUp, ShoppingBag, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function VirtualTryOnPage() {
  const [wardrobeItems, setWardrobeItems] = useState<any[]>([]);
  const [marketItems, setMarketItems] = useState<any[]>([]);
  const [vtoSessions, setVtoSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load wardrobe items
      const { data: wardrobe } = await supabase
        .from('wardrobe_items')
        .select('*')
        .eq('user_id', user.id)
        .limit(12);

      // Load market items (featured)
      const { data: market } = await supabase
        .from('market_items')
        .select('*')
        .eq('status', 'available')
        .limit(12);

      // Load recent VTO sessions
      const { data: sessions } = await supabase
        .from('vto_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      setWardrobeItems(wardrobe || []);
      setMarketItems(market || []);
      setVtoSessions(sessions || []);
    } catch (error) {
      console.error('Error loading VTO data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading Virtual Try-On...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Virtual Try-On</h1>
              <p className="text-muted-foreground">See how items look on you before buying</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{vtoSessions.length}</div>
                  <p className="text-xs text-muted-foreground">Try-ons</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {vtoSessions.reduce((sum, s) => sum + (s.fit_score || 0), 0) / (vtoSessions.length || 1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">Avg Fit Score</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {vtoSessions.filter(s => s.fit_score >= 80).length}
                  </div>
                  <p className="text-xs text-muted-foreground">Great Fits</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* VTO Studio or Item Selection */}
        {selectedItem ? (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Try On: {selectedItem.name || selectedItem.title}</CardTitle>
                  <CardDescription>Upload your photo to see how this looks on you</CardDescription>
                </div>
                <Button variant="outline" onClick={() => setSelectedItem(null)}>
                  Change Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <VTOStudio
                itemId={selectedItem.id}
                itemType={selectedItem.type}
                itemName={selectedItem.name || selectedItem.title}
                itemImage={selectedItem.photos?.main || '/placeholder.svg'}
              />
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="wardrobe" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="wardrobe">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Your Wardrobe
              </TabsTrigger>
              <TabsTrigger value="market">
                <TrendingUp className="w-4 h-4 mr-2" />
                Market Items
              </TabsTrigger>
            </TabsList>

            <TabsContent value="wardrobe" className="space-y-4">
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Your Items</h3>
                <p className="text-sm text-muted-foreground">
                  Try on items from your wardrobe to create perfect outfits
                </p>
              </div>
              
              {wardrobeItems.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No wardrobe items</h3>
                    <p className="text-muted-foreground mb-4">Add items to your wardrobe first</p>
                    <Button onClick={() => navigate('/add')}>Add Items</Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {wardrobeItems.map((item) => (
                    <Card
                      key={item.id}
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => setSelectedItem({ ...item, type: 'wardrobe' })}
                    >
                      <CardContent className="p-0">
                        <div className="aspect-square bg-muted rounded-t-lg overflow-hidden">
                          <img
                            src={item.photos?.main || '/placeholder.svg'}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-3">
                          <h4 className="font-semibold text-sm truncate">{item.name}</h4>
                          <p className="text-xs text-muted-foreground">{item.category}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="market" className="space-y-4">
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Market Items</h3>
                <p className="text-sm text-muted-foreground">
                  Try before you buy - see how market items look on you
                </p>
              </div>

              {marketItems.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No market items</h3>
                    <p className="text-muted-foreground mb-4">Browse the market to find items</p>
                    <Button onClick={() => navigate('/market')}>Browse Market</Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {marketItems.map((item) => (
                    <Card
                      key={item.id}
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => setSelectedItem({ ...item, type: 'market' })}
                    >
                      <CardContent className="p-0">
                        <div className="aspect-square bg-muted rounded-t-lg overflow-hidden">
                          <img
                            src={item.photos?.main || '/placeholder.svg'}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-3">
                          <h4 className="font-semibold text-sm truncate">{item.title}</h4>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-muted-foreground">{item.category}</p>
                            <Badge variant="secondary" className="text-xs">${item.price}</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Recent Try-Ons */}
        {vtoSessions.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <div className="flex items-center gap-2">
                <History className="w-5 h-5" />
                <CardTitle>Recent Try-Ons</CardTitle>
              </div>
              <CardDescription>Your virtual try-on history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {vtoSessions.slice(0, 5).map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-background rounded overflow-hidden">
                        {session.result_image_url && (
                          <img
                            src={session.result_image_url}
                            alt="Try-on result"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">Try-on Session</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(session.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={session.fit_score >= 80 ? 'default' : 'secondary'}>
                        {session.fit_score}% Fit
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
