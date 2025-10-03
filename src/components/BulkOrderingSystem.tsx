import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  ShoppingCart, Package, Truck, Clock, 
  CheckCircle, AlertCircle, Plus, Minus,
  Trash2, Download, Upload, DollarSign
} from 'lucide-react';

interface BulkOrderItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface BulkOrder {
  id: string;
  orderNumber: string;
  supplier: string;
  status: 'draft' | 'submitted' | 'processing' | 'shipped' | 'delivered';
  items: BulkOrderItem[];
  totalAmount: number;
  orderDate: string;
  expectedDelivery?: string;
}

export const BulkOrderingSystem = () => {
  const { toast } = useToast();
  const [currentOrder, setCurrentOrder] = useState<BulkOrderItem[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState('');

  // Mock data
  const [orders] = useState<BulkOrder[]>([
    {
      id: '1',
      orderNumber: 'BO-2025-001',
      supplier: 'StyleCo Fashion',
      status: 'shipped',
      items: [],
      totalAmount: 12500,
      orderDate: '2025-09-15',
      expectedDelivery: '2025-10-10'
    },
    {
      id: '2',
      orderNumber: 'BO-2025-002',
      supplier: 'TrendSetters Supply',
      status: 'processing',
      items: [],
      totalAmount: 8900,
      orderDate: '2025-09-28',
      expectedDelivery: '2025-10-15'
    }
  ]);

  const suppliers = ['StyleCo Fashion', 'TrendSetters Supply', 'Elite Distributors'];

  const addItemToOrder = () => {
    const newItem: BulkOrderItem = {
      id: Date.now().toString(),
      productId: '',
      productName: '',
      sku: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0
    };
    setCurrentOrder([...currentOrder, newItem]);
  };

  const updateOrderItem = (id: string, field: keyof BulkOrderItem, value: any) => {
    setCurrentOrder(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updated.totalPrice = updated.quantity * updated.unitPrice;
        }
        return updated;
      }
      return item;
    }));
  };

  const removeOrderItem = (id: string) => {
    setCurrentOrder(prev => prev.filter(item => item.id !== id));
  };

  const calculateOrderTotal = () => {
    return currentOrder.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const submitOrder = () => {
    if (!selectedSupplier) {
      toast({
        title: 'Supplier Required',
        description: 'Please select a supplier before submitting.',
        variant: 'destructive'
      });
      return;
    }

    if (currentOrder.length === 0) {
      toast({
        title: 'Empty Order',
        description: 'Please add items to your order.',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Order Submitted',
      description: `Bulk order sent to ${selectedSupplier} for processing.`
    });
    setCurrentOrder([]);
    setSelectedSupplier('');
  };

  const getStatusColor = (status: BulkOrder['status']) => {
    const colors = {
      draft: 'secondary',
      submitted: 'default',
      processing: 'default',
      shipped: 'default',
      delivered: 'default'
    };
    return colors[status];
  };

  const getStatusIcon = (status: BulkOrder['status']) => {
    switch (status) {
      case 'draft': return <Clock className="h-4 w-4" />;
      case 'submitted': return <Package className="h-4 w-4" />;
      case 'processing': return <Package className="h-4 w-4" />;
      case 'shipped': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Bulk Ordering</h2>
          <p className="text-muted-foreground">Create and manage large-scale orders from suppliers</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
        </div>
      </div>

      {/* New Order Section */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Bulk Order</CardTitle>
          <CardDescription>Add items and submit to your chosen supplier</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Select Supplier</Label>
            <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a supplier" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map(supplier => (
                  <SelectItem key={supplier} value={supplier}>{supplier}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Order Items</h3>
              <Button onClick={addItemToOrder} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>

            {currentOrder.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No items added yet. Click "Add Item" to start building your order.
              </div>
            ) : (
              <div className="space-y-3">
                {currentOrder.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                        <div className="md:col-span-2">
                          <Label>Product Name</Label>
                          <Input
                            value={item.productName}
                            onChange={(e) => updateOrderItem(item.id, 'productName', e.target.value)}
                            placeholder="Enter product name"
                          />
                        </div>
                        <div>
                          <Label>SKU</Label>
                          <Input
                            value={item.sku}
                            onChange={(e) => updateOrderItem(item.id, 'sku', e.target.value)}
                            placeholder="SKU"
                          />
                        </div>
                        <div>
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateOrderItem(item.id, 'quantity', Number(e.target.value))}
                            min="1"
                          />
                        </div>
                        <div>
                          <Label>Unit Price ($)</Label>
                          <Input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => updateOrderItem(item.id, 'unitPrice', Number(e.target.value))}
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div className="flex flex-col justify-between">
                          <Label>Total</Label>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-semibold">
                              ${item.totalPrice.toFixed(2)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeOrderItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {currentOrder.length > 0 && (
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-xl font-bold">
                Order Total: ${calculateOrderTotal().toFixed(2)}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setCurrentOrder([])}>
                  Clear Order
                </Button>
                <Button onClick={submitOrder}>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Submit Order
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order History */}
      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>Track your previous bulk orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{order.orderNumber}</h4>
                        <Badge variant={getStatusColor(order.status) as any}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1">{order.status}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Supplier: {order.supplier}</p>
                    </div>
                    <Button variant="outline" size="sm">View Details</Button>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Order Date</p>
                      <p className="font-semibold">{new Date(order.orderDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Expected Delivery</p>
                      <p className="font-semibold">
                        {order.expectedDelivery ? new Date(order.expectedDelivery).toLocaleDateString() : 'TBD'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p className="font-semibold text-lg">${order.totalAmount.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
