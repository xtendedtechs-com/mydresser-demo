import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, Package, TrendingUp, AlertCircle, CheckCircle, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReorderRule {
  id: string;
  productId: string;
  productName: string;
  minStock: number;
  reorderQuantity: number;
  supplierId: string;
  supplierName: string;
  enabled: boolean;
  lastReordered?: string;
}

export function AutoReorderSystem() {
  const { toast } = useToast();
  const [rules, setRules] = useState<ReorderRule[]>([
    {
      id: '1',
      productId: 'p1',
      productName: 'Classic T-Shirt',
      minStock: 10,
      reorderQuantity: 50,
      supplierId: 's1',
      supplierName: 'Fashion Wholesale Co',
      enabled: true,
      lastReordered: '2025-01-10'
    },
    {
      id: '2',
      productId: 'p2',
      productName: 'Denim Jeans',
      minStock: 5,
      reorderQuantity: 30,
      supplierId: 's2',
      supplierName: 'Denim Direct',
      enabled: true
    }
  ]);

  const [pendingOrders, setPendingOrders] = useState([
    {
      id: 'po1',
      productName: 'Classic T-Shirt',
      quantity: 50,
      supplier: 'Fashion Wholesale Co',
      status: 'pending',
      estimatedArrival: '2025-01-20'
    }
  ]);

  const toggleRule = (ruleId: string) => {
    setRules(rules.map(r => 
      r.id === ruleId ? { ...r, enabled: !r.enabled } : r
    ));
    toast({
      title: 'Auto-reorder updated',
      description: 'Rule status changed successfully'
    });
  };

  const triggerManualReorder = (rule: ReorderRule) => {
    setPendingOrders([...pendingOrders, {
      id: `po${Date.now()}`,
      productName: rule.productName,
      quantity: rule.reorderQuantity,
      supplier: rule.supplierName,
      status: 'pending',
      estimatedArrival: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }]);
    toast({
      title: 'Reorder initiated',
      description: `${rule.reorderQuantity} units of ${rule.productName} ordered`
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Auto-Reorder System</h2>
          <p className="text-muted-foreground">Automated inventory replenishment</p>
        </div>
        <Button variant="outline">
          <Settings className="w-4 h-4 mr-2" />
          Configure
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rules.filter(r => r.enabled).length}</div>
            <p className="text-xs text-muted-foreground">of {rules.length} total rules</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders.length}</div>
            <p className="text-xs text-muted-foreground">awaiting delivery</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto-Reorders This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">$4,250 total value</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="rules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rules">Reorder Rules</TabsTrigger>
          <TabsTrigger value="pending">Pending Orders</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          {rules.map(rule => (
            <Card key={rule.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{rule.productName}</CardTitle>
                    <CardDescription>
                      Supplier: {rule.supplierName}
                    </CardDescription>
                  </div>
                  <Switch
                    checked={rule.enabled}
                    onCheckedChange={() => toggleRule(rule.id)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Min Stock Level</Label>
                    <p className="text-sm font-medium">{rule.minStock} units</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Reorder Quantity</Label>
                    <p className="text-sm font-medium">{rule.reorderQuantity} units</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Last Reordered</Label>
                    <p className="text-sm font-medium">{rule.lastReordered || 'Never'}</p>
                  </div>
                  <div className="flex items-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => triggerManualReorder(rule)}
                    >
                      Manual Reorder
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {pendingOrders.map(order => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{order.productName}</CardTitle>
                    <CardDescription>{order.supplier}</CardDescription>
                  </div>
                  <Badge variant="secondary">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {order.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Quantity</Label>
                    <p className="text-sm font-medium">{order.quantity} units</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Estimated Arrival</Label>
                    <p className="text-sm font-medium">{order.estimatedArrival}</p>
                  </div>
                  <div className="flex items-end gap-2">
                    <Button variant="outline" size="sm">Track</Button>
                    <Button variant="outline" size="sm">Cancel</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fashion Wholesale Co</CardTitle>
              <CardDescription>Primary clothing supplier</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>Contact:</strong> orders@fashionwholesale.com</p>
                <p><strong>Lead Time:</strong> 7-10 days</p>
                <p><strong>Min Order:</strong> $500</p>
                <Badge variant="outline" className="mt-2">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Denim Direct</CardTitle>
              <CardDescription>Specialized denim supplier</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>Contact:</strong> sales@denimdirect.com</p>
                <p><strong>Lead Time:</strong> 5-7 days</p>
                <p><strong>Min Order:</strong> $300</p>
                <Badge variant="outline" className="mt-2">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
