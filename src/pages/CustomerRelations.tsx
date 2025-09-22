import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, Mail, MessageSquare, Phone, Star, 
  Search, Filter, Send, Gift, Heart,
  TrendingUp, UserPlus, Calendar, Target,
  Award, Clock, CheckCircle, AlertCircle
} from 'lucide-react';

const CustomerRelations = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCustomer, setSelectedCustomer] = React.useState<any>(null);

  const customers = [
    {
      id: '001',
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      phone: '+1 (555) 123-4567',
      avatar: '/api/placeholder/40/40',
      totalOrders: 23,
      totalSpent: '$2,450.80',
      lastOrder: '2024-01-15',
      status: 'vip',
      rating: 5,
      joinDate: '2023-06-15',
      tags: ['Frequent Buyer', 'VIP', 'Fashion Forward']
    },
    {
      id: '002',
      name: 'Mike Chen',
      email: 'mike.chen@example.com',
      phone: '+1 (555) 987-6543',
      avatar: '/api/placeholder/40/40',
      totalOrders: 8,
      totalSpent: '$680.50',
      lastOrder: '2024-01-12',
      status: 'regular',
      rating: 4,
      joinDate: '2023-09-22',
      tags: ['Regular', 'Casual Style']
    },
    {
      id: '003',
      name: 'Emma Davis',
      email: 'emma.d@example.com',
      phone: '+1 (555) 456-7890',
      avatar: '/api/placeholder/40/40',
      totalOrders: 45,
      totalSpent: '$4,320.90',
      lastOrder: '2024-01-14',
      status: 'vip',
      rating: 5,
      joinDate: '2022-12-08',
      tags: ['Top Spender', 'VIP', 'Luxury']
    }
  ];

  const communications = [
    {
      id: '001',
      customer: 'Sarah Johnson',
      type: 'email',
      subject: 'Thank you for your recent purchase!',
      date: '2024-01-15',
      status: 'sent',
      content: 'Welcome email for new VIP status'
    },
    {
      id: '002',
      customer: 'Mike Chen',
      type: 'sms',
      subject: 'Your order has shipped',
      date: '2024-01-14',
      status: 'delivered',
      content: 'Shipping notification'
    },
    {
      id: '003',
      customer: 'Emma Davis',
      type: 'email',
      subject: 'Exclusive preview: New Collection',
      date: '2024-01-13',
      status: 'opened',
      content: 'VIP early access email'
    }
  ];

  const campaigns = [
    {
      id: '001',
      name: 'Spring Collection Launch',
      type: 'Email Campaign',
      status: 'active',
      sent: 1250,
      opened: 687,
      clicked: 234,
      startDate: '2024-01-10'
    },
    {
      id: '002',
      name: 'VIP Exclusive Offer',
      type: 'SMS Campaign',
      status: 'completed',
      sent: 89,
      opened: 76,
      clicked: 42,
      startDate: '2024-01-05'
    },
    {
      id: '003',
      name: 'Win-back Campaign',
      type: 'Email Campaign',
      status: 'scheduled',
      sent: 0,
      opened: 0,
      clicked: 0,
      startDate: '2024-01-20'
    }
  ];

  const loyaltyProgram = {
    totalMembers: 2847,
    activeMembers: 1923,
    pointsIssued: 45789,
    pointsRedeemed: 23456,
    averagePoints: 167
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Customer Relations</h1>
        <div className="flex items-center gap-4">
          <Button>
            <UserPlus className="w-4 h-4 mr-2" />
            Add Customer
          </Button>
          <Button>
            <Mail className="w-4 h-4 mr-2" />
            Send Campaign
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
                <p className="text-2xl font-bold">2,847</p>
                <p className="text-sm text-green-600">+12.5% this month</p>
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
                <p className="text-2xl font-bold">234</p>
                <p className="text-sm text-green-600">+8.2% this month</p>
              </div>
              <Award className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Satisfaction</p>
                <p className="text-2xl font-bold">4.8/5</p>
                <p className="text-sm text-green-600">+0.3 this month</p>
              </div>
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Repeat Rate</p>
                <p className="text-2xl font-bold">68%</p>
                <p className="text-sm text-green-600">+5.1% this month</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="customers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="loyalty">Loyalty Program</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Customer Database
              </CardTitle>
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

              <div className="space-y-4">
                {customers.map((customer) => (
                  <Card key={customer.id} className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setSelectedCustomer(customer)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={customer.avatar} />
                          <AvatarFallback>{customer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{customer.name}</h3>
                          <p className="text-sm text-muted-foreground">{customer.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {customer.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 mb-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < customer.rating ? 'fill-current text-yellow-400' : 'text-muted-foreground'}`} />
                          ))}
                        </div>
                        <p className="text-sm font-medium">{customer.totalSpent}</p>
                        <p className="text-xs text-muted-foreground">{customer.totalOrders} orders</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Recent Communications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {communications.map((comm) => (
                <div key={comm.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${comm.type === 'email' ? 'bg-blue-100' : 'bg-green-100'}`}>
                      {comm.type === 'email' ? 
                        <Mail className="w-4 h-4 text-blue-600" /> : 
                        <MessageSquare className="w-4 h-4 text-green-600" />
                      }
                    </div>
                    <div>
                      <p className="font-medium">{comm.subject}</p>
                      <p className="text-sm text-muted-foreground">To: {comm.customer}</p>
                      <p className="text-xs text-muted-foreground">{comm.content}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={
                      comm.status === 'sent' ? 'secondary' :
                      comm.status === 'delivered' ? 'default' :
                      comm.status === 'opened' ? 'default' : 'secondary'
                    }>
                      {comm.status === 'sent' && <Clock className="w-3 h-3 mr-1" />}
                      {comm.status === 'delivered' && <CheckCircle className="w-3 h-3 mr-1" />}
                      {comm.status === 'opened' && <CheckCircle className="w-3 h-3 mr-1" />}
                      {comm.status}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">{comm.date}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Send New Message</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Recipient</label>
                  <Input placeholder="Select customer or enter email" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <select className="w-full p-2 border rounded-md">
                    <option>Email</option>
                    <option>SMS</option>
                    <option>Push Notification</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Input placeholder="Message subject" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <Textarea placeholder="Your message..." rows={4} />
              </div>
              <Button>
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Marketing Campaigns
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {campaigns.map((campaign) => (
                <Card key={campaign.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="font-medium">{campaign.name}</h3>
                        <p className="text-sm text-muted-foreground">{campaign.type} • Started {campaign.startDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={
                        campaign.status === 'active' ? 'default' :
                        campaign.status === 'completed' ? 'secondary' :
                        'outline'
                      }>
                        {campaign.status}
                      </Badge>
                      <div className="text-right text-sm">
                        <p>Sent: {campaign.sent}</p>
                        <p>Opened: {campaign.opened}</p>
                        <p>Clicked: {campaign.clicked}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="loyalty" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Members</p>
                    <p className="text-2xl font-bold">{loyaltyProgram.totalMembers.toLocaleString()}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Members</p>
                    <p className="text-2xl font-bold">{loyaltyProgram.activeMembers.toLocaleString()}</p>
                  </div>
                  <Heart className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg. Points</p>
                    <p className="text-2xl font-bold">{loyaltyProgram.averagePoints}</p>
                  </div>
                  <Gift className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Loyalty Program Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/20 rounded-lg">
                  <p className="text-sm text-muted-foreground">Points Issued</p>
                  <p className="text-xl font-bold">{loyaltyProgram.pointsIssued.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-muted/20 rounded-lg">
                  <p className="text-sm text-muted-foreground">Points Redeemed</p>
                  <p className="text-xl font-bold">{loyaltyProgram.pointsRedeemed.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Button>Issue Points</Button>
                <Button variant="outline">Create Reward</Button>
                <Button variant="outline">View Redemptions</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Customer Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">4.8</div>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">Average Rating</p>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">92%</div>
                  <p className="text-sm text-muted-foreground">Satisfaction Rate</p>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">1,247</div>
                  <p className="text-sm text-muted-foreground">Total Reviews</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerRelations;