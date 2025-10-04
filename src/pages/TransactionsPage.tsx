import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMarketplaceTransactions } from '@/hooks/useMarketplaceTransactions';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { Package, ShoppingBag, TrendingUp, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TransactionsPage() {
  const [userId, setUserId] = useState<string>('');
  const { transactions, isLoading, updateTransaction } = useMarketplaceTransactions();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  const purchases = transactions?.filter(t => t.buyer_id === userId) || [];
  const sales = transactions?.filter(t => t.seller_id === userId) || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'shipped': return <Truck className="w-4 h-4 text-blue-500" />;
      default: return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      pending: 'secondary',
      confirmed: 'default',
      shipped: 'default',
      delivered: 'default',
      completed: 'default',
      cancelled: 'destructive',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Transactions</h1>
          <p className="text-muted-foreground">
            Manage your purchases and sales on the MyDresser marketplace
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
              <ShoppingBag className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{purchases.length}</div>
              <p className="text-xs text-muted-foreground">
                ${purchases.reduce((sum, t) => sum + t.total_amount, 0).toFixed(2)} spent
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <Package className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sales.length}</div>
              <p className="text-xs text-muted-foreground">
                ${sales.reduce((sum, t) => sum + t.total_amount, 0).toFixed(2)} earned
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {transactions?.filter(t => !['completed', 'cancelled'].includes(t.status)).length || 0}
              </div>
              <p className="text-xs text-muted-foreground">In progress</p>
            </CardContent>
          </Card>
        </div>

        {/* Transactions List */}
        <Tabs defaultValue="purchases" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="purchases">My Purchases</TabsTrigger>
            <TabsTrigger value="sales">My Sales</TabsTrigger>
          </TabsList>

          <TabsContent value="purchases" className="space-y-4">
            {purchases.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No purchases yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start shopping in the MyDresser marketplace
                  </p>
                  <Button onClick={() => navigate('/market')}>Browse Market</Button>
                </CardContent>
              </Card>
            ) : (
              purchases.map((transaction) => (
                <Card key={transaction.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4 flex-1">
                        <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                          <Package className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getStatusIcon(transaction.status)}
                            <h3 className="font-semibold">Order #{transaction.id.slice(0, 8)}</h3>
                            {getStatusBadge(transaction.status)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {transaction.payment_status === 'completed' ? 'Paid' : 'Payment pending'}
                          </p>
                          <div className="flex gap-4 text-sm">
                            <span className="text-muted-foreground">
                              Total: <span className="font-medium text-foreground">${transaction.total_amount.toFixed(2)}</span>
                            </span>
                            <span className="text-muted-foreground">
                              {new Date(transaction.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          {transaction.tracking_number && (
                            <p className="text-sm mt-2">
                              Tracking: <span className="font-mono">{transaction.tracking_number}</span>
                            </p>
                          )}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="sales" className="space-y-4">
            {sales.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No sales yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start selling items from your wardrobe
                  </p>
                  <Button onClick={() => navigate('/2nddresser')}>List an Item</Button>
                </CardContent>
              </Card>
            ) : (
              sales.map((transaction) => (
                <Card key={transaction.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4 flex-1">
                        <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getStatusIcon(transaction.status)}
                            <h3 className="font-semibold">Sale #{transaction.id.slice(0, 8)}</h3>
                            {getStatusBadge(transaction.status)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {transaction.payment_status === 'completed' ? 'Payment received' : 'Payment pending'}
                          </p>
                          <div className="flex gap-4 text-sm">
                            <span className="text-muted-foreground">
                              Total: <span className="font-medium text-foreground">${transaction.total_amount.toFixed(2)}</span>
                            </span>
                            <span className="text-muted-foreground">
                              {new Date(transaction.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          {transaction.status === 'confirmed' && !transaction.shipped_at && (
                            <Button
                              size="sm"
                              className="mt-2"
                              onClick={() => updateTransaction({
                                id: transaction.id,
                                status: 'shipped',
                                shipped_at: new Date().toISOString(),
                              })}
                            >
                              Mark as Shipped
                            </Button>
                          )}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
