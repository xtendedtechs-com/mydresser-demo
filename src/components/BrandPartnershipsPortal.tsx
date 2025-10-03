import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Handshake, TrendingUp, Package, DollarSign, 
  Users, Calendar, Clock, CheckCircle, 
  AlertCircle, Plus, Search, Filter 
} from 'lucide-react';

interface BrandPartner {
  id: string;
  name: string;
  status: 'active' | 'pending' | 'inactive';
  type: 'supplier' | 'brand' | 'distributor';
  contactEmail: string;
  commissionRate: number;
  totalOrders: number;
  totalRevenue: number;
  joinedDate: string;
}

export const BrandPartnershipsPortal = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  // Mock data - would come from database
  const [partners] = useState<BrandPartner[]>([
    {
      id: '1',
      name: 'StyleCo Fashion',
      status: 'active',
      type: 'brand',
      contactEmail: 'contact@styleco.com',
      commissionRate: 15,
      totalOrders: 234,
      totalRevenue: 45230,
      joinedDate: '2025-01-15'
    },
    {
      id: '2',
      name: 'TrendSetters Supply',
      status: 'active',
      type: 'supplier',
      contactEmail: 'sales@trendsetters.com',
      commissionRate: 12,
      totalOrders: 156,
      totalRevenue: 32100,
      joinedDate: '2025-02-20'
    },
    {
      id: '3',
      name: 'Elite Distributors',
      status: 'pending',
      type: 'distributor',
      contactEmail: 'info@elitedist.com',
      commissionRate: 10,
      totalOrders: 0,
      totalRevenue: 0,
      joinedDate: '2025-09-28'
    }
  ]);

  const [newPartnerDialog, setNewPartnerDialog] = useState(false);
  const [newPartner, setNewPartner] = useState({
    name: '',
    type: 'brand' as const,
    contactEmail: '',
    commissionRate: 15,
    notes: ''
  });

  const filteredPartners = partners.filter(partner => {
    const matchesSearch = partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         partner.contactEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || partner.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAddPartner = () => {
    toast({
      title: 'Partner Added',
      description: `${newPartner.name} has been added as a partner.`
    });
    setNewPartnerDialog(false);
    setNewPartner({ name: '', type: 'brand', contactEmail: '', commissionRate: 15, notes: '' });
  };

  const stats = {
    totalPartners: partners.length,
    activePartners: partners.filter(p => p.status === 'active').length,
    totalRevenue: partners.reduce((sum, p) => sum + p.totalRevenue, 0),
    avgCommission: partners.reduce((sum, p) => sum + p.commissionRate, 0) / partners.length || 0
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Brand Partnerships</h2>
          <p className="text-muted-foreground">Manage your brand partners and supplier relationships</p>
        </div>
        <Button onClick={() => setNewPartnerDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Partner
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Partners</CardTitle>
            <Handshake className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPartners}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activePartners} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Partnership Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Commission</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgCommission.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Across all partners
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {partners.reduce((sum, p) => sum + p.totalOrders, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Via partnerships
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search partners..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="list">
            <TabsList className="mb-4">
              <TabsTrigger value="list">Partner List</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-4">
              {filteredPartners.map((partner) => (
                <Card key={partner.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CardTitle>{partner.name}</CardTitle>
                          <Badge variant={partner.status === 'active' ? 'default' : 'secondary'}>
                            {partner.status}
                          </Badge>
                          <Badge variant="outline">{partner.type}</Badge>
                        </div>
                        <CardDescription>{partner.contactEmail}</CardDescription>
                      </div>
                      <Button variant="outline" size="sm">Manage</Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Commission Rate</p>
                        <p className="text-lg font-semibold">{partner.commissionRate}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Orders</p>
                        <p className="text-lg font-semibold">{partner.totalOrders}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Revenue</p>
                        <p className="text-lg font-semibold">${partner.totalRevenue.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Joined</p>
                        <p className="text-lg font-semibold">
                          {new Date(partner.joinedDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Partnership Analytics</CardTitle>
                  <CardDescription>Performance metrics and trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Analytics dashboard coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Add Partner Dialog */}
      {newPartnerDialog && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Add New Partner</CardTitle>
              <CardDescription>Enter partner details to create a new partnership</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="partnerName">Partner Name</Label>
                <Input
                  id="partnerName"
                  value={newPartner.name}
                  onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
                  placeholder="Enter partner name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="partnerType">Partner Type</Label>
                <Select
                  value={newPartner.type}
                  onValueChange={(value: any) => setNewPartner({ ...newPartner, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brand">Brand</SelectItem>
                    <SelectItem value="supplier">Supplier</SelectItem>
                    <SelectItem value="distributor">Distributor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={newPartner.contactEmail}
                  onChange={(e) => setNewPartner({ ...newPartner, contactEmail: e.target.value })}
                  placeholder="partner@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="commission">Commission Rate (%)</Label>
                <Input
                  id="commission"
                  type="number"
                  value={newPartner.commissionRate}
                  onChange={(e) => setNewPartner({ ...newPartner, commissionRate: Number(e.target.value) })}
                  min="0"
                  max="100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newPartner.notes}
                  onChange={(e) => setNewPartner({ ...newPartner, notes: e.target.value })}
                  placeholder="Additional notes about this partnership..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setNewPartnerDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddPartner}>
                  Add Partner
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
