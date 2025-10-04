import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Percent, Tag, Gift, Calendar, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePromotions } from '@/hooks/usePromotions';
import { useProfile } from '@/hooks/useProfile';

const MerchantPromotionsManager = () => {
  const { user } = useProfile();
  const { toast } = useToast();
  const { promotions, isLoading, createPromotion, updatePromotion, deletePromotion } = usePromotions();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'percentage',
    discount_value: 0,
    code: '',
    min_purchase_amount: 0,
    usage_limit: 0,
    start_date: '',
    end_date: '',
    is_active: true,
    applicable_categories: []
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'percentage',
      discount_value: 0,
      code: '',
      min_purchase_amount: 0,
      usage_limit: 0,
      start_date: '',
      end_date: '',
      is_active: true,
      applicable_categories: []
    });
    setEditingPromo(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingPromo) {
        await updatePromotion({ id: editingPromo.id, ...formData, type: formData.type as any });
        toast({
          title: 'Promotion Updated',
          description: `${formData.name} has been updated successfully`
        });
      } else {
        await createPromotion({ ...formData, type: formData.type as any });
        toast({
          title: 'Promotion Created',
          description: `${formData.name} has been created successfully`
        });
      }
      
      setDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (promo: any) => {
    setEditingPromo(promo);
    setFormData({
      name: promo.name,
      description: promo.description || '',
      type: promo.type,
      discount_value: promo.discount_value,
      code: promo.code || '',
      min_purchase_amount: promo.min_purchase_amount || 0,
      usage_limit: promo.usage_limit || 0,
      start_date: promo.start_date || '',
      end_date: promo.end_date || '',
      is_active: promo.is_active,
      applicable_categories: promo.applicable_categories || []
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promotion?')) return;
    
    try {
      await deletePromotion(id);
      toast({
        title: 'Promotion Deleted',
        description: 'Promotion has been removed successfully'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const activePromotions = promotions?.filter(p => p.is_active) || [];
  const totalUses = promotions?.reduce((sum, p) => sum + (p.usage_count || 0), 0) || 0;
  const avgDiscount = promotions?.length > 0 
    ? promotions.reduce((sum, p) => sum + p.discount_value, 0) / promotions.length 
    : 0;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Promotions & Discounts</h2>
          <p className="text-muted-foreground mt-1">Create and manage promotional campaigns</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Promotion
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingPromo ? 'Edit Promotion' : 'Create New Promotion'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Promotion Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="e.g., Summer Sale 2024"
                  />
                </div>
                <div>
                  <Label>Promo Code *</Label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    required
                    placeholder="e.g., SUMMER20"
                  />
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe this promotion..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Discount Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed_amount">Fixed Amount ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Discount Value *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Minimum Purchase ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.min_purchase_amount}
                    onChange={(e) => setFormData({ ...formData, min_purchase_amount: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Max Uses (0 = unlimited)</Label>
                  <Input
                    type="number"
                    value={formData.usage_limit}
                    onChange={(e) => setFormData({ ...formData, usage_limit: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Applies To Categories</Label>
                <Select
                  value={formData.applicable_categories?.[0] || 'all'}
                  onValueChange={(value) => setFormData({ ...formData, applicable_categories: value === 'all' ? [] : [value] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Products</SelectItem>
                    <SelectItem value="tops">Tops Only</SelectItem>
                    <SelectItem value="bottoms">Bottoms Only</SelectItem>
                    <SelectItem value="outerwear">Outerwear Only</SelectItem>
                    <SelectItem value="shoes">Shoes Only</SelectItem>
                    <SelectItem value="accessories">Accessories Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingPromo ? 'Update Promotion' : 'Create Promotion'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Tag className="w-4 h-4 text-primary" />
              Total Promotions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{promotions?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Created campaigns</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Gift className="w-4 h-4 text-green-500" />
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activePromotions.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              Total Uses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUses}</div>
            <p className="text-xs text-muted-foreground mt-1">Times redeemed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Percent className="w-4 h-4 text-purple-500" />
              Avg Discount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgDiscount.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">Average discount</p>
          </CardContent>
        </Card>
      </div>

      {/* Promotions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Promotions</CardTitle>
          <CardDescription>Manage your promotional campaigns and discount codes</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center space-y-2">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-sm text-muted-foreground">Loading promotions...</p>
              </div>
            </div>
          ) : promotions && promotions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Valid Period</TableHead>
                  <TableHead>Uses</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promotions.map((promo) => (
                  <TableRow key={promo.id}>
                    <TableCell className="font-medium">{promo.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{promo.code}</Badge>
                    </TableCell>
                    <TableCell>
                      {promo.type === 'percentage' ? `${promo.discount_value}%` : `$${promo.discount_value}`}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {promo.start_date && promo.end_date 
                        ? `${new Date(promo.start_date).toLocaleDateString()} - ${new Date(promo.end_date).toLocaleDateString()}`
                        : 'No expiry'}
                    </TableCell>
                    <TableCell>
                      {promo.usage_count || 0} / {promo.usage_limit || '∞'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={promo.is_active ? 'default' : 'secondary'}>
                        {promo.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(promo)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(promo.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Gift className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-lg font-medium">No promotions yet</p>
              <p className="text-sm text-muted-foreground">Create your first promotion to boost sales</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MerchantPromotionsManager;
