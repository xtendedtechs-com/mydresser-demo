import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOrders } from '@/hooks/useOrders';
import { 
  Users, Mail, MessageSquare, Search, 
  TrendingUp, UserPlus, Star, Award, Send, Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const MerchantTerminalCustomers = () => {
  const { orders } = useOrders();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);

  const customerData = useMemo(() => {
    const customers: { [key: string]: { 
      email: string; 
      name: string;
      orders: number; 
      spent: number; 
      lastOrder: Date;
    }} = {};

    orders?.forEach(order => {
      const email = order.customer_email || 'unknown@example.com';
      if (!customers[email]) {
        customers[email] = {
          email,
          name: order.customer_name || 'Guest Customer',
          orders: 0,
          spent: 0,
          lastOrder: new Date(order.created_at)
        };
      }
      customers[email].orders += 1;
      customers[email].spent += order.total_amount || 0;
      const orderDate = new Date(order.created_at);
      if (orderDate > customers[email].lastOrder) {
        customers[email].lastOrder = orderDate;
      }
    });

    return Object.values(customers).sort((a, b) => b.spent - a.spent);
  }, [orders]);

  const totalCustomers = customerData.length;
  const vipCustomers = customerData.filter(c => c.spent > 500).length;
  const avgSpent = totalCustomers > 0 ? customerData.reduce((sum, c) => sum + c.spent, 0) / totalCustomers : 0;

  const filteredCustomers = customerData.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Customer Relations</h1>
          <p className="text-muted-foreground">Manage customer relationships and communications</p>
        </div>
        <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Mail className="w-4 h-4 mr-2" />
              Send Message
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Customer Message</DialogTitle>
              <DialogDescription>
                Communicate with your customers via email
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Recipient</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customerData.slice(0, 10).map((customer) => (
                      <SelectItem key={customer.email} value={customer.email}>
                        {customer.name} ({customer.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Subject</label>
                <Input placeholder="Message subject" />
              </div>
              <div>
                <label className="text-sm font-medium">Message</label>
                <Textarea placeholder="Your message..." rows={4} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setMessageDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => {
                toast({ title: "Message Sent", description: "Your message has been sent successfully" });
                setMessageDialogOpen(false);
              }}>
                <Send className="w-4 h-4 mr-2" />
                Send
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
                <p className="text-2xl font-bold">{totalCustomers}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">VIP Customers</p>
                <p className="text-2xl font-bold">{vipCustomers}</p>
                <p className="text-xs text-muted-foreground">Spent $500+</p>
              </div>
              <Award className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Customer Value</p>
                <p className="text-2xl font-bold">${avgSpent.toFixed(2)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Repeat Rate</p>
                <p className="text-2xl font-bold">
                  {totalCustomers > 0 
                    ? ((customerData.filter(c => c.orders > 1).length / totalCustomers) * 100).toFixed(0)
                    : '0'}%
                </p>
              </div>
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="customers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="customers">Customer List</TabsTrigger>
          <TabsTrigger value="segments">Segments</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Database</CardTitle>
              <CardDescription>{filteredCustomers.length} total customers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input 
                    placeholder="Search customers..." 
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>

              {filteredCustomers.length > 0 ? (
                <div className="space-y-3">
                  {filteredCustomers.slice(0, 20).map((customer) => (
                    <Card key={customer.email} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{customer.name}</h3>
                          <p className="text-sm text-muted-foreground">{customer.email}</p>
                          <div className="flex items-center gap-2 mt-2">
                            {customer.spent > 500 && (
                              <Badge variant="default" className="text-xs">
                                <Award className="w-3 h-3 mr-1" />
                                VIP
                              </Badge>
                            )}
                            {customer.orders > 5 && (
                              <Badge variant="secondary" className="text-xs">
                                Frequent Buyer
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">${customer.spent.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">{customer.orders} orders</p>
                          <p className="text-xs text-muted-foreground">
                            Last: {format(customer.lastOrder, 'MMM dd')}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No customers found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="segments" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">VIP Customers</CardTitle>
                <CardDescription>Spent $500+</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold mb-2">{vipCustomers}</p>
                <p className="text-sm text-muted-foreground">
                  {totalCustomers > 0 ? ((vipCustomers / totalCustomers) * 100).toFixed(1) : '0'}% of total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Frequent Buyers</CardTitle>
                <CardDescription>5+ orders</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold mb-2">
                  {customerData.filter(c => c.orders >= 5).length}
                </p>
                <p className="text-sm text-muted-foreground">
                  High engagement rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">New Customers</CardTitle>
                <CardDescription>First purchase</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold mb-2">
                  {customerData.filter(c => c.orders === 1).length}
                </p>
                <p className="text-sm text-muted-foreground">
                  Growth opportunities
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Insights</CardTitle>
              <CardDescription>Key metrics and trends</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted/20 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Average Order Frequency</p>
                  <p className="text-2xl font-bold">
                    {totalCustomers > 0 
                      ? (orders?.length || 0 / totalCustomers).toFixed(1)
                      : '0.0'} orders/customer
                  </p>
                </div>
                <div className="p-4 bg-muted/20 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Customer Lifetime Value</p>
                  <p className="text-2xl font-bold">${avgSpent.toFixed(2)}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Top Customers by Spend</h4>
                <div className="space-y-2">
                  {customerData.slice(0, 5).map((customer, index) => (
                    <div key={customer.email} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{customer.name}</p>
                          <p className="text-xs text-muted-foreground">{customer.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${customer.spent.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">{customer.orders} orders</p>
                      </div>
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

export default MerchantTerminalCustomers;
