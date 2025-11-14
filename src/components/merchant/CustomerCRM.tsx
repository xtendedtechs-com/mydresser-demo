import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Search, Mail, Phone, ShoppingBag, Star, TrendingUp, Award, Send } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface Customer {
  email: string;
  name: string;
  phone?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrder: string;
  loyaltyPoints: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export const CustomerCRM = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [emailContent, setEmailContent] = useState('');
  const { orders } = useOrders();
  const { toast } = useToast();

  // Aggregate customer data from orders
  const customers: Customer[] = Object.values(
    orders.reduce((acc, order) => {
      const key = order.customer_email;
      if (!acc[key]) {
        acc[key] = {
          email: order.customer_email,
          name: order.customer_name,
          phone: order.customer_phone,
          totalOrders: 0,
          totalSpent: 0,
          lastOrder: order.created_at,
          loyaltyPoints: 0,
          tier: 'bronze' as const
        };
      }
      acc[key].totalOrders += 1;
      acc[key].totalSpent += order.total_amount;
      acc[key].loyaltyPoints += Math.floor(order.total_amount * 10); // 10 points per dollar
      if (new Date(order.created_at) > new Date(acc[key].lastOrder)) {
        acc[key].lastOrder = order.created_at;
      }
      
      // Determine tier
      if (acc[key].totalSpent >= 5000) acc[key].tier = 'platinum';
      else if (acc[key].totalSpent >= 2000) acc[key].tier = 'gold';
      else if (acc[key].totalSpent >= 500) acc[key].tier = 'silver';
      
      return acc;
    }, {} as Record<string, Customer>)
  );

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'gold': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'silver': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default: return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    }
  };

  const handleSendEmail = () => {
    if (!selectedCustomer || !emailContent) return;
    
    toast({
      title: 'Email Sent',
      description: `Message sent to ${selectedCustomer.name}`,
    });
    setEmailContent('');
  };

  const stats = {
    totalCustomers: customers.length,
    avgOrderValue: customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length || 0,
    topTier: customers.filter(c => c.tier === 'platinum' || c.tier === 'gold').length,
    activeThisMonth: customers.filter(c => {
      const lastOrder = new Date(c.lastOrder);
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return lastOrder > monthAgo;
    }).length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Users className="w-8 h-8" />
            Customer Relationship Management
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage customers, track loyalty, and drive engagement
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Lifetime Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.avgOrderValue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">VIP Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">{stats.topTier}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.activeThisMonth}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Customer Directory</CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer.email}
                  className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => setSelectedCustomer(customer)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{customer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-sm text-muted-foreground">{customer.email}</div>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge className={getTierColor(customer.tier)}>{customer.tier}</Badge>
                    <div className="text-sm font-medium">${customer.totalSpent.toFixed(0)}</div>
                    <div className="text-xs text-muted-foreground">{customer.totalOrders} orders</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedCustomer ? (
              <Tabs defaultValue="info">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="info">Info</TabsTrigger>
                  <TabsTrigger value="message">Message</TabsTrigger>
                </TabsList>
                
                <TabsContent value="info" className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-16 h-16">
                      <AvatarFallback className="text-lg">
                        {selectedCustomer.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-bold text-lg">{selectedCustomer.name}</div>
                      <Badge className={getTierColor(selectedCustomer.tier)}>
                        {selectedCustomer.tier.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedCustomer.email}</span>
                    </div>
                    {selectedCustomer.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{selectedCustomer.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedCustomer.totalOrders} total orders</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="w-4 h-4 text-muted-foreground" />
                      <span>${selectedCustomer.totalSpent.toFixed(2)} lifetime value</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Award className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedCustomer.loyaltyPoints.toLocaleString()} loyalty points</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Star className="w-4 h-4 text-muted-foreground" />
                      <span>Last order: {format(new Date(selectedCustomer.lastOrder), 'MMM dd, yyyy')}</span>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="message" className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Send Message</label>
                    <Textarea
                      placeholder="Write your message..."
                      value={emailContent}
                      onChange={(e) => setEmailContent(e.target.value)}
                      rows={6}
                    />
                  </div>
                  <Button onClick={handleSendEmail} className="w-full">
                    <Send className="mr-2 h-4 w-4" />
                    Send Email
                  </Button>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Select a customer to view details
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
