import { useState } from 'react';
import { Package, AlertCircle, TrendingDown, ArrowUpDown, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  totalStock: number;
  locations: {
    store: string;
    quantity: number;
    status: 'in-stock' | 'low-stock' | 'out-of-stock';
  }[];
  price: number;
  reorderPoint: number;
}

export const CentralizedInventory = () => {
  const [items] = useState<InventoryItem[]>([
    {
      id: '1',
      name: 'Classic Leather Jacket',
      sku: 'CLJ-001',
      category: 'Outerwear',
      totalStock: 47,
      locations: [
        { store: 'Downtown Flagship', quantity: 23, status: 'in-stock' },
        { store: 'West Side Branch', quantity: 15, status: 'in-stock' },
        { store: 'East Mall Store', quantity: 9, status: 'low-stock' },
      ],
      price: 299.99,
      reorderPoint: 20,
    },
    {
      id: '2',
      name: 'Slim Fit Jeans',
      sku: 'SFJ-002',
      category: 'Bottoms',
      totalStock: 12,
      locations: [
        { store: 'Downtown Flagship', quantity: 8, status: 'low-stock' },
        { store: 'West Side Branch', quantity: 4, status: 'low-stock' },
        { store: 'East Mall Store', quantity: 0, status: 'out-of-stock' },
      ],
      price: 89.99,
      reorderPoint: 30,
    },
    {
      id: '3',
      name: 'Summer Floral Dress',
      sku: 'SFD-003',
      category: 'Dresses',
      totalStock: 65,
      locations: [
        { store: 'Downtown Flagship', quantity: 30, status: 'in-stock' },
        { store: 'West Side Branch', quantity: 20, status: 'in-stock' },
        { store: 'East Mall Store', quantity: 15, status: 'in-stock' },
      ],
      price: 79.99,
      reorderPoint: 25,
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const getLowStockItems = () => items.filter(item => item.totalStock < item.reorderPoint);
  const getOutOfStockItems = () => items.filter(item => 
    item.locations.some(loc => loc.status === 'out-of-stock')
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-stock': return 'bg-green-500/10 text-green-600';
      case 'low-stock': return 'bg-orange-500/10 text-orange-600';
      case 'out-of-stock': return 'bg-red-500/10 text-red-600';
      default: return 'bg-gray-500/10 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Centralized Inventory</h2>
        <p className="text-muted-foreground">
          Monitor and manage inventory across all store locations
        </p>
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4" />
              Total Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{items.length}</span>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-orange-600">
              <TrendingDown className="h-4 w-4" />
              Low Stock Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-orange-600">{getLowStockItems().length}</span>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              Out of Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-red-600">{getOutOfStockItems().length}</span>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Outerwear">Outerwear</SelectItem>
            <SelectItem value="Bottoms">Bottoms</SelectItem>
            <SelectItem value="Dresses">Dresses</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="in-stock">In Stock</SelectItem>
            <SelectItem value="low-stock">Low Stock</SelectItem>
            <SelectItem value="out-of-stock">Out of Stock</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
          <CardDescription>
            View stock levels across all locations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Total Stock</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Locations</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{item.totalStock}</span>
                      {item.totalStock < item.reorderPoint && (
                        <Badge className="bg-orange-500/10 text-orange-600">
                          Low
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>${item.price}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {item.locations.map((loc, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-2 text-sm">
                          <span className="text-muted-foreground">{loc.store}:</span>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">{loc.quantity}</span>
                            <Badge variant="outline" className={getStatusColor(loc.status)}>
                              {loc.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
