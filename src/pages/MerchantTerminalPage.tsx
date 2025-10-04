import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useMerchantProfile } from '@/hooks/useMerchantProfile';
import { useMerchantItems } from '@/hooks/useMerchantItems';
import { Save, Palette, Heart, Share2, MapPin, Phone, Mail } from 'lucide-react';

const MerchantTerminalPage = () => {
  const { profile } = useMerchantProfile();
  const { items } = useMerchantItems();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState({
    business_name: '',
    brand_story: '',
    theme_color: '#000000',
    logo: '',
    specialties: [] as string[],
    contact_info: {} as any,
    is_published: true
  });

  const [newSpecialty, setNewSpecialty] = useState('');

  useEffect(() => {
    if (profile) loadPageSettings();
  }, [profile]);

  const loadPageSettings = async () => {
    if (!profile) return;

    const { data } = await supabase
      .from('merchant_pages')
      .select('*')
      .eq('merchant_id', profile.user_id)
      .maybeSingle();

    if (data) {
      setSettings({
        business_name: data.business_name || profile.business_name || '',
        brand_story: data.brand_story || '',
        theme_color: data.theme_color || '#000000',
        logo: data.logo || '',
        specialties: data.specialties || [],
        contact_info: data.contact_info || {},
        is_published: data.is_published !== false
      });
    }
  };

  const savePageSettings = async () => {
    if (!profile) return;

    const { error } = await supabase
      .from('merchant_pages')
      .upsert({
        merchant_id: profile.user_id,
        ...settings
      }, { onConflict: 'merchant_id' });

    if (error) {
      toast({ title: "Error", description: "Failed to save", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Page saved successfully" });
    }
  };

  const displayedItems = items.filter(item => item.status === 'active').slice(0, 6);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Merchant Page</h1>
          <p className="text-muted-foreground">Customize with live preview</p>
        </div>
        <Button onClick={savePageSettings}>
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor */}
        <Card className="p-4 space-y-4">
          <div>
            <Label>Business Name</Label>
            <Input value={settings.business_name} onChange={(e) => setSettings(prev => ({ ...prev, business_name: e.target.value }))} />
          </div>
          <div>
            <Label>Brand Story</Label>
            <Textarea value={settings.brand_story} onChange={(e) => setSettings(prev => ({ ...prev, brand_story: e.target.value }))} rows={3} />
          </div>
          <div>
            <Label>Theme Color</Label>
            <Input type="color" value={settings.theme_color} onChange={(e) => setSettings(prev => ({ ...prev, theme_color: e.target.value }))} />
          </div>
          <div>
            <Label>Specialties</Label>
            <div className="flex gap-2 mb-2">
              <Input value={newSpecialty} onChange={(e) => setNewSpecialty(e.target.value)} placeholder="Add specialty" />
              <Button onClick={() => {
                if (newSpecialty.trim()) {
                  setSettings(prev => ({ ...prev, specialties: [...prev.specialties, newSpecialty.trim()] }));
                  setNewSpecialty('');
                }
              }}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {settings.specialties.map((s, i) => (
                <Badge key={i} onClick={() => setSettings(prev => ({ ...prev, specialties: prev.specialties.filter((_, idx) => idx !== i) }))}>{s} ×</Badge>
              ))}
            </div>
          </div>
        </Card>

        {/* Live Preview */}
        <Card className="overflow-hidden">
          <div style={{ backgroundColor: settings.theme_color }} className="h-40 relative">
            <div className="absolute inset-0 bg-black/20" />
            <div className="relative h-full flex items-end p-4">
              <div className="text-white">
                <h1 className="text-2xl font-bold">{settings.business_name || 'Business Name'}</h1>
                <div className="flex gap-2 mt-2">
                  {settings.specialties.slice(0, 3).map((s, i) => (
                    <Badge key={i} variant="secondary" className="bg-white/20 text-white text-xs">{s}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex gap-2">
              <Button size="sm" variant="outline"><Heart className="w-3 h-3 mr-1" />Follow</Button>
              <Button size="sm" variant="outline"><Share2 className="w-3 h-3 mr-1" />Share</Button>
            </div>
            {settings.brand_story && <p className="text-sm text-muted-foreground">{settings.brand_story}</p>}
            <div className="grid grid-cols-2 gap-2">
              {displayedItems.map(item => (
                <div key={item.id} className="border rounded-lg overflow-hidden">
                  <div className="aspect-square bg-muted" />
                  <div className="p-2">
                    <p className="text-xs font-medium truncate">{item.name}</p>
                    <p className="text-xs font-bold">${item.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MerchantTerminalPage;
