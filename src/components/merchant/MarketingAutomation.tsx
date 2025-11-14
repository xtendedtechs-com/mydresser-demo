import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, MessageSquare, TrendingUp, Users, Calendar, Play, Pause, BarChart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Campaign {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'social';
  status: 'active' | 'paused' | 'draft';
  segment: string;
  sent: number;
  opened: number;
  clicked: number;
  converted: number;
}

export function MarketingAutomation() {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: '1',
      name: 'New Arrivals Newsletter',
      type: 'email',
      status: 'active',
      segment: 'All Customers',
      sent: 1250,
      opened: 625,
      clicked: 187,
      converted: 45
    },
    {
      id: '2',
      name: 'Abandoned Cart Recovery',
      type: 'email',
      status: 'active',
      segment: 'Cart Abandoners',
      sent: 340,
      opened: 204,
      clicked: 102,
      converted: 28
    },
    {
      id: '3',
      name: 'VIP Customer Exclusive',
      type: 'sms',
      status: 'active',
      segment: 'VIP Customers',
      sent: 85,
      opened: 80,
      clicked: 45,
      converted: 22
    }
  ]);

  const toggleCampaign = (id: string) => {
    setCampaigns(campaigns.map(c =>
      c.id === id
        ? { ...c, status: c.status === 'active' ? 'paused' : 'active' as const }
        : c
    ));
    toast({
      title: 'Campaign updated',
      description: 'Campaign status changed successfully'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Marketing Automation</h2>
          <p className="text-muted-foreground">Automated campaigns and customer engagement</p>
        </div>
        <Button>Create Campaign</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.filter(c => c.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              +2 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.reduce((sum, c) => sum + c.sent, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              customers reached
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Open Rate</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((campaigns.reduce((sum, c) => sum + (c.opened / c.sent), 0) / campaigns.length) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              +5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.reduce((sum, c) => sum + c.converted, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              $12,450 revenue
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="campaigns" className="space-y-4">
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="segments">Segments</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          {campaigns.map(campaign => (
            <Card key={campaign.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{campaign.name}</CardTitle>
                      <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                        {campaign.status}
                      </Badge>
                      <Badge variant="outline">
                        {campaign.type === 'email' ? <Mail className="w-3 h-3 mr-1" /> : <MessageSquare className="w-3 h-3 mr-1" />}
                        {campaign.type}
                      </Badge>
                    </div>
                    <CardDescription>Target: {campaign.segment}</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleCampaign(campaign.id)}
                  >
                    {campaign.status === 'active' ? (
                      <><Pause className="w-4 h-4 mr-2" /> Pause</>
                    ) : (
                      <><Play className="w-4 h-4 mr-2" /> Resume</>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Sent</Label>
                    <p className="text-xl font-bold">{campaign.sent.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Opened</Label>
                    <p className="text-xl font-bold">{campaign.opened.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      {Math.round((campaign.opened / campaign.sent) * 100)}% rate
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Clicked</Label>
                    <p className="text-xl font-bold">{campaign.clicked.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      {Math.round((campaign.clicked / campaign.opened) * 100)}% rate
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Converted</Label>
                    <p className="text-xl font-bold">{campaign.converted}</p>
                    <p className="text-xs text-muted-foreground">
                      {Math.round((campaign.converted / campaign.clicked) * 100)}% rate
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="segments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Segments</CardTitle>
              <CardDescription>Organize customers for targeted campaigns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {['All Customers', 'VIP Customers', 'Cart Abandoners', 'New Customers', 'Inactive Customers'].map(segment => (
                <div key={segment} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{segment}</p>
                    <p className="text-sm text-muted-foreground">
                      {Math.floor(Math.random() * 500 + 100)} customers
                    </p>
                  </div>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>Pre-designed templates for quick campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {['Welcome Email', 'Product Launch', 'Seasonal Sale', 'Thank You', 'Re-engagement', 'Birthday'].map(template => (
                  <Card key={template} className="cursor-pointer hover:bg-accent transition-colors">
                    <CardContent className="p-4">
                      <div className="aspect-video bg-muted rounded mb-3" />
                      <h3 className="font-medium">{template}</h3>
                      <Button variant="outline" size="sm" className="w-full mt-2">
                        Use Template
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Schedule</CardTitle>
              <CardDescription>Upcoming automated campaigns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { date: '2025-01-15', time: '10:00 AM', campaign: 'Weekly Newsletter' },
                { date: '2025-01-16', time: '2:00 PM', campaign: 'Flash Sale Alert' },
                { date: '2025-01-18', time: '9:00 AM', campaign: 'New Arrivals' }
              ].map((scheduled, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{scheduled.campaign}</p>
                      <p className="text-sm text-muted-foreground">
                        {scheduled.date} at {scheduled.time}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
