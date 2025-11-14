import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Award, Plus, Users, TrendingUp, Gift, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const LoyaltyProgram = () => {
  const { toast } = useToast();
  const [programDialogOpen, setProgramDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Loyalty Program</h2>
          <p className="text-muted-foreground">Reward customers and drive repeat business</p>
        </div>
        <Dialog open={programDialogOpen} onOpenChange={setProgramDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Program
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Loyalty Program</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Program Name</Label>
                <Input placeholder="VIP Rewards Program" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea placeholder="Earn points on every purchase..." rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Points Per Dollar</Label>
                  <Input type="number" defaultValue="1" step="0.1" />
                </div>
                <div>
                  <Label>Minimum Purchase</Label>
                  <Input type="number" placeholder="0" />
                </div>
              </div>
              <Button className="w-full" onClick={() => {
                toast({ title: "Program Created", description: "Your loyalty program is now active" });
                setProgramDialogOpen(false);
              }}>
                Create Program
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Members</p>
                <p className="text-2xl font-bold">2,847</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Points Issued</p>
                <p className="text-2xl font-bold">45.2K</p>
              </div>
              <Award className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Redemption Rate</p>
                <p className="text-2xl font-bold">68%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenue Impact</p>
                <p className="text-2xl font-bold">+24%</p>
              </div>
              <Gift className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tiers">Reward Tiers</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>MyDresser Rewards</CardTitle>
              <CardDescription>Your active loyalty program</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Points Per Dollar Spent</span>
                <Badge>1.0 points</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Status</span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Member Enrollment</span>
                <span className="text-sm font-medium">2,847 customers</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tiers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reward Tiers</CardTitle>
              <CardDescription>Define reward levels based on spending</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {['Bronze', 'Silver', 'Gold', 'Platinum'].map((tier, idx) => (
                <div key={tier} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Award className="w-6 h-6" />
                    <div>
                      <p className="font-medium">{tier} Tier</p>
                      <p className="text-sm text-muted-foreground">{idx * 500}+ points</p>
                    </div>
                  </div>
                  <Badge>{(idx + 1) * 5}% discount</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Members</CardTitle>
              <CardDescription>Customers with highest loyalty points</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Customer {idx + 1}</p>
                    <p className="text-sm text-muted-foreground">Platinum Member</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{(5 - idx) * 1000} pts</p>
                    <p className="text-sm text-muted-foreground">$${(5 - idx) * 2500} lifetime</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Program Settings</CardTitle>
              <CardDescription>Configure loyalty program rules</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Points Expiration (days)</Label>
                <Input type="number" defaultValue="365" />
              </div>
              <div>
                <Label>Minimum Points to Redeem</Label>
                <Input type="number" defaultValue="100" />
              </div>
              <div>
                <Label>Welcome Bonus Points</Label>
                <Input type="number" defaultValue="50" />
              </div>
              <Button>
                <Settings className="w-4 h-4 mr-2" />
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
