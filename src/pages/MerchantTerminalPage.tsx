import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
import { Save, Eye, Settings, Layout, Palette, Heart, Share2, MapPin, Phone, Mail, Image, Video, Star, Grid3x3, ChevronUp, ChevronDown } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const MerchantTerminalPage = () => {
  const { profile } = useMerchantProfile();
  const { items } = useMerchantItems();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('design');
  
  const [settings, setSettings] = useState({
    business_name: '',
    brand_story: '',
    theme_color: '#000000',
    secondary_color: '#666666',
    background_color: '#ffffff',
    text_color: '#000000',
    logo: '',
    profile_photo: '',
    hero_image: '',
    cover_video: '',
    specialties: [] as string[],
    featured_collections: [] as string[],
    contact_info: {} as any,
    gallery_images: [] as string[],
    is_published: true,
    active_sections: {
      hero: true,
      about: true,
      featured: true,
      collections: true,
      gallery: true,
      contact: true
    },
    section_order: ['hero', 'about', 'featured', 'collections', 'gallery', 'contact']
  });

  const [newSpecialty, setNewSpecialty] = useState('');
  const [newCollection, setNewCollection] = useState('');
  const [newGalleryImage, setNewGalleryImage] = useState('');

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
        secondary_color: data.secondary_color || '#666666',
        background_color: data.background_color || '#ffffff',
        text_color: data.text_color || '#000000',
        logo: data.logo || '',
        profile_photo: data.profile_photo || '',
        hero_image: data.hero_image || '',
        cover_video: data.cover_video || '',
        specialties: (data.specialties as string[]) || [],
        featured_collections: (data.featured_collections as string[]) || [],
        contact_info: (data.contact_info as any) || {},
        gallery_images: (data.gallery_images as string[]) || [],
        is_published: data.is_published !== false,
        active_sections: (data.active_sections as any) || {
          hero: true,
          about: true,
          featured: true,
          collections: true,
          gallery: true,
          contact: true
        },
        section_order: (data.section_order as string[]) || ['hero', 'about', 'featured', 'collections', 'gallery', 'contact']
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

  const moveSectionUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...settings.section_order];
    [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
    setSettings(prev => ({ ...prev, section_order: newOrder }));
  };

  const moveSectionDown = (index: number) => {
    if (index === settings.section_order.length - 1) return;
    const newOrder = [...settings.section_order];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    setSettings(prev => ({ ...prev, section_order: newOrder }));
  };

  const toggleSection = (section: string) => {
    setSettings(prev => ({
      ...prev,
      active_sections: {
        ...prev.active_sections,
        [section]: !prev.active_sections[section as keyof typeof prev.active_sections]
      }
    }));
  };

  const displayedItems = items.filter(item => item.status === 'available').slice(0, 6);
  const featuredItems = items.filter(item => item.is_featured && item.status === 'available').slice(0, 4);

  const sectionLabels: Record<string, string> = {
    hero: 'Hero Banner',
    about: 'About Section',
    featured: 'Featured Items',
    collections: 'Collections',
    gallery: 'Gallery',
    contact: 'Contact Info'
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold">Merchant Page Builder</h1>
          <p className="text-muted-foreground">Customize your storefront with live preview</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.open(`/merchant/${profile?.user_id}`, '_blank')}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button onClick={savePageSettings}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="design"><Palette className="w-4 h-4 mr-2" />Design</TabsTrigger>
          <TabsTrigger value="content"><Settings className="w-4 h-4 mr-2" />Content</TabsTrigger>
          <TabsTrigger value="sections"><Layout className="w-4 h-4 mr-2" />Sections</TabsTrigger>
          <TabsTrigger value="preview"><Eye className="w-4 h-4 mr-2" />Preview</TabsTrigger>
        </TabsList>

        {/* Design Tab */}
        <TabsContent value="design" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Colors & Branding</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Theme Color</Label>
                <div className="flex gap-2">
                  <Input type="color" value={settings.theme_color} onChange={(e) => setSettings(prev => ({ ...prev, theme_color: e.target.value }))} className="w-20" />
                  <Input value={settings.theme_color} onChange={(e) => setSettings(prev => ({ ...prev, theme_color: e.target.value }))} />
                </div>
              </div>
              <div>
                <Label>Secondary Color</Label>
                <div className="flex gap-2">
                  <Input type="color" value={settings.secondary_color} onChange={(e) => setSettings(prev => ({ ...prev, secondary_color: e.target.value }))} className="w-20" />
                  <Input value={settings.secondary_color} onChange={(e) => setSettings(prev => ({ ...prev, secondary_color: e.target.value }))} />
                </div>
              </div>
              <div>
                <Label>Background Color</Label>
                <div className="flex gap-2">
                  <Input type="color" value={settings.background_color} onChange={(e) => setSettings(prev => ({ ...prev, background_color: e.target.value }))} className="w-20" />
                  <Input value={settings.background_color} onChange={(e) => setSettings(prev => ({ ...prev, background_color: e.target.value }))} />
                </div>
              </div>
              <div>
                <Label>Text Color</Label>
                <div className="flex gap-2">
                  <Input type="color" value={settings.text_color} onChange={(e) => setSettings(prev => ({ ...prev, text_color: e.target.value }))} className="w-20" />
                  <Input value={settings.text_color} onChange={(e) => setSettings(prev => ({ ...prev, text_color: e.target.value }))} />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Media Assets</h3>
            <div className="space-y-4">
              <div>
                <Label>Profile Photo URL</Label>
                <Input 
                  value={settings.profile_photo} 
                  onChange={(e) => setSettings(prev => ({ ...prev, profile_photo: e.target.value }))} 
                  placeholder="https://example.com/profile.jpg"
                />
              </div>
              <div>
                <Label>Hero Image URL</Label>
                <Input 
                  value={settings.hero_image} 
                  onChange={(e) => setSettings(prev => ({ ...prev, hero_image: e.target.value }))} 
                  placeholder="https://example.com/hero.jpg"
                />
              </div>
              <div>
                <Label>Cover Video URL (Optional)</Label>
                <Input 
                  value={settings.cover_video} 
                  onChange={(e) => setSettings(prev => ({ ...prev, cover_video: e.target.value }))} 
                  placeholder="https://example.com/video.mp4"
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Business Information</h3>
            <div className="space-y-4">
              <div>
                <Label>Business Name</Label>
                <Input 
                  value={settings.business_name} 
                  onChange={(e) => setSettings(prev => ({ ...prev, business_name: e.target.value }))} 
                  placeholder="Your Business Name"
                />
              </div>
              <div>
                <Label>Brand Story</Label>
                <Textarea 
                  value={settings.brand_story} 
                  onChange={(e) => setSettings(prev => ({ ...prev, brand_story: e.target.value }))} 
                  rows={4}
                  placeholder="Tell your brand's story..."
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Specialties</h3>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input 
                  value={newSpecialty} 
                  onChange={(e) => setNewSpecialty(e.target.value)} 
                  placeholder="Add specialty (e.g., 'Sustainable Fashion')"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newSpecialty.trim()) {
                      setSettings(prev => ({ ...prev, specialties: [...prev.specialties, newSpecialty.trim()] }));
                      setNewSpecialty('');
                    }
                  }}
                />
                <Button onClick={() => {
                  if (newSpecialty.trim()) {
                    setSettings(prev => ({ ...prev, specialties: [...prev.specialties, newSpecialty.trim()] }));
                    setNewSpecialty('');
                  }
                }}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {settings.specialties.map((s, i) => (
                  <Badge 
                    key={i} 
                    variant="secondary" 
                    className="cursor-pointer hover:bg-destructive"
                    onClick={() => setSettings(prev => ({ ...prev, specialties: prev.specialties.filter((_, idx) => idx !== i) }))}
                  >
                    {s} ×
                  </Badge>
                ))}
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Featured Collections</h3>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input 
                  value={newCollection} 
                  onChange={(e) => setNewCollection(e.target.value)} 
                  placeholder="Add collection name"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newCollection.trim()) {
                      setSettings(prev => ({ ...prev, featured_collections: [...prev.featured_collections, newCollection.trim()] }));
                      setNewCollection('');
                    }
                  }}
                />
                <Button onClick={() => {
                  if (newCollection.trim()) {
                    setSettings(prev => ({ ...prev, featured_collections: [...prev.featured_collections, newCollection.trim()] }));
                    setNewCollection('');
                  }
                }}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {settings.featured_collections.map((c, i) => (
                  <Badge 
                    key={i} 
                    variant="outline"
                    className="cursor-pointer hover:bg-destructive"
                    onClick={() => setSettings(prev => ({ ...prev, featured_collections: prev.featured_collections.filter((_, idx) => idx !== i) }))}
                  >
                    {c} ×
                  </Badge>
                ))}
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Gallery Images</h3>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input 
                  value={newGalleryImage} 
                  onChange={(e) => setNewGalleryImage(e.target.value)} 
                  placeholder="Image URL"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newGalleryImage.trim()) {
                      setSettings(prev => ({ ...prev, gallery_images: [...prev.gallery_images, newGalleryImage.trim()] }));
                      setNewGalleryImage('');
                    }
                  }}
                />
                <Button onClick={() => {
                  if (newGalleryImage.trim()) {
                    setSettings(prev => ({ ...prev, gallery_images: [...prev.gallery_images, newGalleryImage.trim()] }));
                    setNewGalleryImage('');
                  }
                }}>Add</Button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {settings.gallery_images.map((img, i) => (
                  <div key={i} className="relative aspect-square bg-muted rounded-lg overflow-hidden group">
                    {img.startsWith('http') ? (
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Image className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                      onClick={() => setSettings(prev => ({ ...prev, gallery_images: prev.gallery_images.filter((_, idx) => idx !== i) }))}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Sections Tab */}
        <TabsContent value="sections" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Manage Page Sections</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Toggle sections on/off and reorder them to customize your page layout
            </p>
            <div className="space-y-2">
              {settings.section_order.map((section, index) => (
                <div key={section} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Switch
                    checked={settings.active_sections[section as keyof typeof settings.active_sections]}
                    onCheckedChange={() => toggleSection(section)}
                  />
                  <span className="flex-1 font-medium">{sectionLabels[section] || section}</span>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => moveSectionUp(index)}
                      disabled={index === 0}
                    >
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => moveSectionDown(index)}
                      disabled={index === settings.section_order.length - 1}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Publishing</h3>
            <div className="flex items-center gap-3">
              <Switch
                checked={settings.is_published}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, is_published: checked }))}
              />
              <div>
                <Label>Publish Page</Label>
                <p className="text-sm text-muted-foreground">
                  {settings.is_published ? 'Your page is live and visible to customers' : 'Your page is hidden from customers'}
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview">
          <Card style={{ backgroundColor: settings.background_color, color: settings.text_color }}>
            {settings.section_order.map((section) => {
              if (!settings.active_sections[section as keyof typeof settings.active_sections]) return null;

              switch (section) {
                case 'hero':
                  return (
                    <div key="hero" className="relative h-80 overflow-hidden">
                      {settings.cover_video ? (
                        <video src={settings.cover_video} className="absolute inset-0 w-full h-full object-cover" autoPlay loop muted />
                      ) : settings.hero_image ? (
                        <img src={settings.hero_image} alt="Hero" className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <div style={{ backgroundColor: settings.theme_color }} className="absolute inset-0" />
                      )}
                      <div className="absolute inset-0 bg-black/30" />
                      <div className="relative h-full flex flex-col justify-center items-center text-center p-6">
                        {settings.profile_photo && (
                          <img src={settings.profile_photo} alt="Profile" className="w-24 h-24 rounded-full border-4 border-white mb-4 object-cover" />
                        )}
                        <h1 className="text-4xl font-bold text-white mb-2">{settings.business_name || 'Business Name'}</h1>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {settings.specialties.slice(0, 3).map((s, i) => (
                            <Badge key={i} variant="secondary" className="bg-white/20 text-white backdrop-blur">{s}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  );

                case 'about':
                  return settings.brand_story ? (
                    <CardContent key="about" className="p-8">
                      <h2 className="text-2xl font-bold mb-4">About Us</h2>
                      <p className="text-lg leading-relaxed">{settings.brand_story}</p>
                    </CardContent>
                  ) : null;

                case 'featured':
                  return featuredItems.length > 0 ? (
                    <CardContent key="featured" className="p-8">
                      <h2 className="text-2xl font-bold mb-6">Featured Items</h2>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {featuredItems.map(item => (
                          <div key={item.id} className="border rounded-lg overflow-hidden">
                            <div className="aspect-square bg-muted relative">
                              {item.photos && (
                                <img src={typeof item.photos === 'string' ? item.photos : item.photos[0]} alt={item.name} className="w-full h-full object-cover" />
                              )}
                              <Badge className="absolute top-2 right-2"><Star className="w-3 h-3 mr-1" />Featured</Badge>
                            </div>
                            <div className="p-3">
                              <p className="font-medium truncate">{item.name}</p>
                              <p className="font-bold" style={{ color: settings.theme_color }}>${item.price}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  ) : null;

                case 'collections':
                  return settings.featured_collections.length > 0 ? (
                    <CardContent key="collections" className="p-8" style={{ backgroundColor: `${settings.secondary_color}10` }}>
                      <h2 className="text-2xl font-bold mb-6">Collections</h2>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {settings.featured_collections.map((collection, i) => (
                          <div key={i} className="border rounded-lg p-6 text-center hover:shadow-lg transition-shadow cursor-pointer" style={{ borderColor: settings.theme_color }}>
                            <Grid3x3 className="w-12 h-12 mx-auto mb-3" style={{ color: settings.theme_color }} />
                            <p className="font-semibold">{collection}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  ) : null;

                case 'gallery':
                  return settings.gallery_images.length > 0 ? (
                    <CardContent key="gallery" className="p-8">
                      <h2 className="text-2xl font-bold mb-6">Gallery</h2>
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                        {settings.gallery_images.map((img, i) => (
                          <div key={i} className="aspect-square bg-muted rounded-lg overflow-hidden">
                            <img src={img} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  ) : null;

                case 'contact':
                  return (
                    <CardContent key="contact" className="p-8 border-t">
                      <h2 className="text-2xl font-bold mb-6">Contact Us</h2>
                      <div className="grid md:grid-cols-3 gap-6">
                        {settings.contact_info?.phone && (
                          <div className="flex items-center gap-3">
                            <Phone className="w-5 h-5" style={{ color: settings.theme_color }} />
                            <div>
                              <p className="text-sm text-muted-foreground">Phone</p>
                              <p className="font-medium">{settings.contact_info.phone}</p>
                            </div>
                          </div>
                        )}
                        {settings.contact_info?.email && (
                          <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5" style={{ color: settings.theme_color }} />
                            <div>
                              <p className="text-sm text-muted-foreground">Email</p>
                              <p className="font-medium">{settings.contact_info.email}</p>
                            </div>
                          </div>
                        )}
                        {settings.contact_info?.address && (
                          <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5" style={{ color: settings.theme_color }} />
                            <div>
                              <p className="text-sm text-muted-foreground">Address</p>
                              <p className="font-medium">{settings.contact_info.address}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  );

                default:
                  return null;
              }
            })}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MerchantTerminalPage;
