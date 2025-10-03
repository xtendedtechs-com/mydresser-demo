import { useState } from 'react';
import SecondDresserMarket from '@/components/SecondDresserMarket';
import { SustainabilityImpactCard } from '@/components/SustainabilityImpactCard';
import { CheckoutFlow } from '@/components/CheckoutFlow';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Recycle, ShoppingBag, Star, MessageSquare } from 'lucide-react';

const SecondDresserPage = () => {
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Recycle className="w-8 h-8 text-green-600" />
              2ndDresser
            </h1>
            <p className="text-muted-foreground">Circular Fashion Marketplace</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Tabs defaultValue="browse" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="browse" className="gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  Browse
                </TabsTrigger>
                <TabsTrigger value="purchases" className="gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  My Purchases
                </TabsTrigger>
                <TabsTrigger value="sales" className="gap-2">
                  <Star className="w-4 h-4" />
                  My Sales
                </TabsTrigger>
                <TabsTrigger value="messages" className="gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Messages
                </TabsTrigger>
              </TabsList>

              <TabsContent value="browse">
                <SecondDresserMarket />
              </TabsContent>

              <TabsContent value="purchases">
                <div className="text-center p-8 text-muted-foreground">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Your purchase history will appear here</p>
                </div>
              </TabsContent>

              <TabsContent value="sales">
                <div className="text-center p-8 text-muted-foreground">
                  <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Your sales history will appear here</p>
                </div>
              </TabsContent>

              <TabsContent value="messages">
                <div className="text-center p-8 text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Your marketplace messages will appear here</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-4">
            <SustainabilityImpactCard />
          </div>
        </div>
      </div>

      {/* Checkout Dialog */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Complete Purchase</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <CheckoutFlow
              amount={selectedItem.price}
              itemId={selectedItem.id}
              sellerId={selectedItem.seller_id}
              type="marketplace"
              onSuccess={() => {
                setShowCheckout(false);
                setSelectedItem(null);
              }}
              onCancel={() => {
                setShowCheckout(false);
                setSelectedItem(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SecondDresserPage;
