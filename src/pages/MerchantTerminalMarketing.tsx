import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { usePromotions } from '@/hooks/usePromotions';
import { useEvents, MerchantEvent } from '@/hooks/useEvents';
import { Plus, Edit, Trash2, Percent, Calendar, Tag, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

const MerchantTerminalMarketing = () => {
  const { promotions, createPromotion, updatePromotion, deletePromotion, isLoading: loadingPromos } = usePromotions();
  const { events, createEvent, updateEvent, deleteEvent, isLoading: loadingEvents } = useEvents();
  
  const [promoDialogOpen, setPromoDialogOpen] = useState(false);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<any>(null);
  const [editingEvent, setEditingEvent] = useState<any>(null);

  const [promoForm, setPromoForm] = useState({
    name: '',
    description: '',
    type: 'percentage' as 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'free_shipping',
    discount_value: 0,
    code: '',
    min_purchase_amount: 0,
    start_date: '',
    end_date: '',
    is_active: true
  });

  const [eventForm, setEventForm] = useState({
    name: '',
    description: '',
    event_type: 'sale' as MerchantEvent['event_type'],
    start_date: '',
    end_date: '',
    location: '',
    is_online: false,
    banner_image: '',
    registration_link: '',
    max_attendees: 0,
    is_active: true
  });

  const handlePromoSubmit = () => {
    if (editingPromo) {
      updatePromotion({ id: editingPromo.id, ...promoForm });
    } else {
      createPromotion(promoForm as any);
    }
    setPromoDialogOpen(false);
    resetPromoForm();
  };

  const handleEventSubmit = () => {
    if (editingEvent) {
      updateEvent({ id: editingEvent.id, ...eventForm });
    } else {
      createEvent(eventForm as any);
    }
    setEventDialogOpen(false);
    resetEventForm();
  };

  const resetPromoForm = () => {
    setPromoForm({
      name: '', description: '', type: 'percentage', discount_value: 0,
      code: '', min_purchase_amount: 0, start_date: '', end_date: '', is_active: true
    });
    setEditingPromo(null);
  };

  const resetEventForm = () => {
    setEventForm({
      name: '', description: '', event_type: 'sale', start_date: '', end_date: '',
      location: '', is_online: false, banner_image: '', registration_link: '',
      max_attendees: 0, is_active: true
    });
    setEditingEvent(null);
  };

  const activePromos = promotions?.filter(p => p.is_active) || [];
  const upcomingEvents = events?.filter(e => new Date(e.start_date) > new Date()) || [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Marketing Hub</h1>
        <p className="text-muted-foreground">Manage promotions, events, and campaigns</p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Percent className="h-4 w-4" />
              Active Promotions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePromos.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingEvents.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Total Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(promotions?.length || 0) + (events?.length || 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+24%</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="promotions">
        <TabsList>
          <TabsTrigger value="promotions">Promotions & Discounts</TabsTrigger>
          <TabsTrigger value="events">Events & Campaigns</TabsTrigger>
        </TabsList>

        {/* Promotions Tab */}
        <TabsContent value="promotions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Promotions</h2>
            <Button onClick={() => { resetPromoForm(); setPromoDialogOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Create Promotion
            </Button>
          </div>

          <div className="grid gap-4">
            {promotions?.map((promo) => (
              <Card key={promo.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{promo.name}</h3>
                        <Badge variant={promo.is_active ? 'default' : 'secondary'}>
                          {promo.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline">{promo.type.replace('_', ' ')}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{promo.description}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Discount:</span>
                          <p className="font-medium">
                            {promo.type === 'percentage' ? `${promo.discount_value}%` : `$${promo.discount_value}`}
                          </p>
                        </div>
                        {promo.code && (
                          <div>
                            <span className="text-muted-foreground">Code:</span>
                            <p className="font-medium font-mono">{promo.code}</p>
                          </div>
                        )}
                        <div>
                          <span className="text-muted-foreground">Valid:</span>
                          <p className="font-medium">
                            {format(new Date(promo.start_date), 'MMM d')} - {format(new Date(promo.end_date), 'MMM d')}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Uses:</span>
                          <p className="font-medium">{promo.usage_count} / {promo.usage_limit || '∞'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button variant="outline" size="icon" onClick={() => {
                        setEditingPromo(promo);
                        setPromoForm({
                          name: promo.name,
                          description: promo.description || '',
                          type: promo.type,
                          discount_value: promo.discount_value,
                          code: promo.code || '',
                          min_purchase_amount: promo.min_purchase_amount,
                          start_date: promo.start_date,
                          end_date: promo.end_date,
                          is_active: promo.is_active
                        });
                        setPromoDialogOpen(true);
                      }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deletePromotion(promo.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Events & Campaigns</h2>
            <Button onClick={() => { resetEventForm(); setEventDialogOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {events?.map((event) => (
              <Card key={event.id}>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{event.name}</h3>
                          <Badge variant={event.is_active ? 'default' : 'secondary'}>
                            {event.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {event.event_type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={() => {
                          setEditingEvent(event);
                          setEventForm(event as any);
                          setEventDialogOpen(true);
                        }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteEvent(event.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(new Date(event.start_date), 'MMM d, yyyy')} - 
                          {format(new Date(event.end_date), 'MMM d, yyyy')}
                        </span>
                      </div>
                      {event.location && (
                        <p className="text-muted-foreground">📍 {event.location}</p>
                      )}
                      {event.max_attendees && (
                        <p className="text-muted-foreground">
                          👥 {event.current_attendees}/{event.max_attendees} attendees
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Promotion Dialog */}
      <Dialog open={promoDialogOpen} onOpenChange={setPromoDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingPromo ? 'Edit Promotion' : 'Create Promotion'}</DialogTitle>
            <DialogDescription>Configure your promotional campaign</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input value={promoForm.name} onChange={(e) => setPromoForm({...promoForm, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Type *</Label>
                <Select value={promoForm.type} onValueChange={(value: any) => setPromoForm({...promoForm, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage Discount</SelectItem>
                    <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                    <SelectItem value="buy_x_get_y">Buy X Get Y</SelectItem>
                    <SelectItem value="free_shipping">Free Shipping</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={promoForm.description} onChange={(e) => setPromoForm({...promoForm, description: e.target.value})} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Discount Value *</Label>
                <Input type="number" value={promoForm.discount_value} onChange={(e) => setPromoForm({...promoForm, discount_value: parseFloat(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <Label>Promo Code</Label>
                <Input value={promoForm.code} onChange={(e) => setPromoForm({...promoForm, code: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Min Purchase</Label>
                <Input type="number" value={promoForm.min_purchase_amount} onChange={(e) => setPromoForm({...promoForm, min_purchase_amount: parseFloat(e.target.value)})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Input type="datetime-local" value={promoForm.start_date} onChange={(e) => setPromoForm({...promoForm, start_date: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>End Date *</Label>
                <Input type="datetime-local" value={promoForm.end_date} onChange={(e) => setPromoForm({...promoForm, end_date: e.target.value})} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={promoForm.is_active} onCheckedChange={(checked) => setPromoForm({...promoForm, is_active: checked})} />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPromoDialogOpen(false)}>Cancel</Button>
            <Button onClick={handlePromoSubmit}>{editingPromo ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Event Dialog */}
      <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingEvent ? 'Edit Event' : 'Create Event'}</DialogTitle>
            <DialogDescription>Configure your event or campaign</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Event Name *</Label>
                <Input value={eventForm.name} onChange={(e) => setEventForm({...eventForm, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Event Type *</Label>
                <Select value={eventForm.event_type} onValueChange={(value: any) => setEventForm({...eventForm, event_type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sale">Sale Event</SelectItem>
                    <SelectItem value="launch">Product Launch</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="fashion_show">Fashion Show</SelectItem>
                    <SelectItem value="popup">Pop-up Store</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={eventForm.description} onChange={(e) => setEventForm({...eventForm, description: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Input type="datetime-local" value={eventForm.start_date} onChange={(e) => setEventForm({...eventForm, start_date: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>End Date *</Label>
                <Input type="datetime-local" value={eventForm.end_date} onChange={(e) => setEventForm({...eventForm, end_date: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Location</Label>
                <Input value={eventForm.location} onChange={(e) => setEventForm({...eventForm, location: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Max Attendees</Label>
                <Input type="number" value={eventForm.max_attendees} onChange={(e) => setEventForm({...eventForm, max_attendees: parseInt(e.target.value)})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Registration Link</Label>
              <Input value={eventForm.registration_link} onChange={(e) => setEventForm({...eventForm, registration_link: e.target.value})} />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={eventForm.is_online} onCheckedChange={(checked) => setEventForm({...eventForm, is_online: checked})} />
                <Label>Online Event</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={eventForm.is_active} onCheckedChange={(checked) => setEventForm({...eventForm, is_active: checked})} />
                <Label>Active</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEventDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEventSubmit}>{editingEvent ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MerchantTerminalMarketing;