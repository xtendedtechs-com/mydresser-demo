import { useState } from 'react';
import { MyMirror } from '@/components/MyMirror';
import { useWardrobe } from '@/hooks/useWardrobe';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, Sparkles, TrendingUp } from 'lucide-react';

const MyMirrorPage = () => {
  const { items } = useWardrobe();
  const [selectedItem, setSelectedItem] = useState(items[0]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="px-4 py-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
              <Camera className="h-5 w-5 text-white" />
            </div>
            MyMirror
          </h1>
          <p className="text-muted-foreground mt-2">
            Virtual try-on with AI-powered style recommendations
          </p>
        </div>

        <Tabs defaultValue="tryon" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tryon">Try-On</TabsTrigger>
            <TabsTrigger value="recommendations">AI Suggestions</TabsTrigger>
            <TabsTrigger value="saved">Saved Looks</TabsTrigger>
          </TabsList>

          <TabsContent value="tryon" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <MyMirror selectedItem={selectedItem} />
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Wardrobe</CardTitle>
                    <CardDescription>Select items to try on</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3 max-h-[600px] overflow-y-auto">
                      {items.slice(0, 12).map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSelectedItem(item)}
                          className={`p-3 rounded-lg border-2 transition-all text-left ${
                            selectedItem?.id === item.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <p className="font-medium text-sm truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{item.brand}</p>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {item.category}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="mt-6">
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <Sparkles className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-2">Style Match Score</h3>
                  <p className="text-2xl font-bold text-primary">92%</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    This outfit matches your style perfectly
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <TrendingUp className="h-8 w-8 text-green-600 mb-3" />
                  <h3 className="font-semibold mb-2">Trending Style</h3>
                  <p className="text-2xl font-bold text-green-600">Top 5%</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Similar looks are trending this week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <Camera className="h-8 w-8 text-blue-600 mb-3" />
                  <h3 className="font-semibold mb-2">Try-On Sessions</h3>
                  <p className="text-2xl font-bold text-blue-600">28</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total virtual try-ons this month
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>AI Style Recommendations</CardTitle>
                <CardDescription>
                  Based on your current look and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <p className="font-medium">✨ Add a statement accessory</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      A bold necklace or scarf would elevate this outfit
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="font-medium">👟 Footwear suggestion</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      White sneakers would create a perfect casual balance
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="font-medium">🎨 Color harmony tip</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Consider adding earth tones to complement this look
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="saved" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Saved Virtual Try-Ons</CardTitle>
                <CardDescription>Your favorite looks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No saved looks yet. Capture your first virtual try-on!
                  </p>
                  <Button className="mt-4" onClick={() => {}}>
                    Start Try-On
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyMirrorPage;
