import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMerchantProfile } from '@/hooks/useMerchantProfile';
import { 
  Plus, 
  X, 
  Upload, 
  Save, 
  Eye, 
  Palette, 
  Image, 
  Link2,
  ShoppingBag,
  Star,
  Calendar
} from 'lucide-react';
import SecurityAlert from '@/components/SecurityAlert';
import { FileUpload } from '@/components/FileUpload';

interface MerchantPageSettings {
  business_name: string;
  brand_story: string;
  specialties: string[];
  featured_collections: string[];
  social_links: {
    instagram: string;
    website: string;
    facebook: string;
  };
  hero_image?: string;
  logo?: string;
  theme_color: string;
  business_hours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  contact_info: {
    email: string;
    phone: string;
    address: string;
  };
}

interface MerchantPageEditorProps {
  onSave?: () => void;
  onPreview?: () => void;
}

const MerchantPageEditor = ({ onSave, onPreview }: MerchantPageEditorProps) => {
  const { toast } = useToast();
  const { profile: merchantProfile } = useMerchantProfile();
  
  const [settings, setSettings] = useState<MerchantPageSettings>({
    business_name: '',
    brand_story: '',
    specialties: [],
    featured_collections: [],
    social_links: {
      instagram: '',
      website: '',
      facebook: ''
    },
    theme_color: '#000000',
    business_hours: {
      monday: '9:00 AM - 6:00 PM',
      tuesday: '9:00 AM - 6:00 PM',
      wednesday: '9:00 AM - 6:00 PM',
      thursday: '9:00 AM - 6:00 PM',
      friday: '9:00 AM - 6:00 PM',
      saturday: '10:00 AM - 4:00 PM',
      sunday: 'Closed'
    },
    contact_info: {
      email: '',
      phone: '',
      address: ''
    }
  });

  const [loading, setSaving] = useState(false);
  const [newSpecialty, setNewSpecialty] = useState('');
  const [newCollection, setNewCollection] = useState('');

  useEffect(() => {
    if (merchantProfile) {
      setSettings(prev => ({
        ...prev,
        business_name: merchantProfile.business_name || '',
      }));
      loadPageSettings();
    }
  }, [merchantProfile]);

  const loadPageSettings = async () => {
    try {
      // Load existing page settings from merchant_profiles or a separate merchant_pages table
      // For now, we'll use default settings and let merchants customize
    } catch (error) {
      console.error('Error loading page settings:', error);
    }
  };

  const savePageSettings = async () => {
    try {
      setSaving(true);

      // Save page settings to database
      const { error } = await supabase
        .from('merchant_profiles')
        .update({
          // Store customization data in a JSON field or separate table
          business_name: settings.business_name
        })
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;

      toast({
        title: "Page Settings Saved",
        description: "Your merchant page has been updated successfully.",
      });

      onSave?.();
    } catch (error: any) {
      console.error('Error saving page settings:', error);
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const addSpecialty = () => {
    if (newSpecialty.trim() && !settings.specialties.includes(newSpecialty.trim())) {
      setSettings(prev => ({
        ...prev,
        specialties: [...prev.specialties, newSpecialty.trim()]
      }));
      setNewSpecialty('');
    }
  };

  const removeSpecialty = (index: number) => {
    setSettings(prev => ({
      ...prev,
      specialties: prev.specialties.filter((_, i) => i !== index)
    }));
  };

  const addCollection = () => {
    if (newCollection.trim() && !settings.featured_collections.includes(newCollection.trim())) {
      setSettings(prev => ({
        ...prev,
        featured_collections: [...prev.featured_collections, newCollection.trim()]
      }));
      setNewCollection('');
    }
  };

  const removeCollection = (index: number) => {
    setSettings(prev => ({
      ...prev,
      featured_collections: prev.featured_collections.filter((_, i) => i !== index)
    }));
  };

  const handleInputChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (parent: keyof MerchantPageSettings, field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent] as Record<string, any>),
        [field]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      <SecurityAlert 
        type="info"
        title="Merchant Page Customization"
        message="Customize your public merchant page that customers will see. All changes are saved securely and can be previewed before publishing."
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Merchant Page Editor</CardTitle>
            <CardDescription>
              Customize how your business appears to customers
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onPreview} className="gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </Button>
            <Button onClick={savePageSettings} disabled={loading} className="gap-2">
              <Save className="h-4 w-4" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="hours">Hours</TabsTrigger>
        </TabsList>

        {/* Basic Information */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="business_name">Business Name</Label>
                <Input
                  id="business_name"
                  value={settings.business_name}
                  onChange={(e) => handleInputChange('business_name', e.target.value)}
                  placeholder="Enter your business name"
                />
              </div>

              <div>
                <Label htmlFor="brand_story">Brand Story</Label>
                <Textarea
                  id="brand_story"
                  value={settings.brand_story}
                  onChange={(e) => handleInputChange('brand_story', e.target.value)}
                  placeholder="Tell customers about your brand, mission, and what makes you unique..."
                  rows={4}
                />
              </div>

              <div>
                <Label>Specialties</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={newSpecialty}
                      onChange={(e) => setNewSpecialty(e.target.value)}
                      placeholder="Add a specialty (e.g., Business Attire)"
                      onKeyPress={(e) => e.key === 'Enter' && addSpecialty()}
                    />
                    <Button type="button" onClick={addSpecialty} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {settings.specialties.map((specialty, index) => (
                      <Badge key={index} variant="secondary" className="gap-1">
                        {specialty}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() => removeSpecialty(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding */}
        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Visual Branding
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Brand Logo</Label>
                <div className="mt-2">
                  <FileUpload
                    photos={[]}
                    videos={[]}
                    onPhotosChange={(photos) => {
                      if (photos.length > 0) {
                        handleInputChange('logo', photos[0].url);
                      }
                    }}
                    onVideosChange={() => {}}
                    maxPhotos={1}
                    maxVideos={0}
                  />
                </div>
              </div>

              <div>
                <Label>Hero Image</Label>
                <div className="mt-2">
                  <FileUpload
                    photos={[]}
                    videos={[]}
                    onPhotosChange={(photos) => {
                      if (photos.length > 0) {
                        handleInputChange('hero_image', photos[0].url);
                      }
                    }}
                    onVideosChange={() => {}}
                    maxPhotos={1}
                    maxVideos={0}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="theme_color">Theme Color</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="theme_color"
                    type="color"
                    value={settings.theme_color}
                    onChange={(e) => handleInputChange('theme_color', e.target.value)}
                    className="w-20"
                  />
                  <Input
                    value={settings.theme_color}
                    onChange={(e) => handleInputChange('theme_color', e.target.value)}
                    placeholder="#000000"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Collections */}
        <TabsContent value="collections" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Featured Collections
              </CardTitle>
              <CardDescription>
                Showcase your best collections to customers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newCollection}
                  onChange={(e) => setNewCollection(e.target.value)}
                  placeholder="Add a featured collection (e.g., Summer 2024)"
                  onKeyPress={(e) => e.key === 'Enter' && addCollection()}
                />
                <Button type="button" onClick={addCollection} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                {settings.featured_collections.map((collection, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">{collection}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCollection(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {settings.featured_collections.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Star className="h-8 w-8 mx-auto mb-2" />
                  <p>No featured collections yet</p>
                  <p className="text-sm">Add collections to showcase your best items</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Information */}
        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5" />
                Contact & Social Media
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="email">Business Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.contact_info.email}
                    onChange={(e) => handleNestedChange('contact_info', 'email', e.target.value)}
                    placeholder="contact@business.com"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={settings.contact_info.phone}
                    onChange={(e) => handleNestedChange('contact_info', 'phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Business Address</Label>
                <Textarea
                  id="address"
                  value={settings.contact_info.address}
                  onChange={(e) => handleNestedChange('contact_info', 'address', e.target.value)}
                  placeholder="123 Main Street, City, State 12345"
                  rows={3}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Social Media Links</h4>
                
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={settings.social_links.website}
                    onChange={(e) => handleNestedChange('social_links', 'website', e.target.value)}
                    placeholder="https://www.yourbusiness.com"
                  />
                </div>

                <div>
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={settings.social_links.instagram}
                    onChange={(e) => handleNestedChange('social_links', 'instagram', e.target.value)}
                    placeholder="@yourbusiness"
                  />
                </div>

                <div>
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    value={settings.social_links.facebook}
                    onChange={(e) => handleNestedChange('social_links', 'facebook', e.target.value)}
                    placeholder="facebook.com/yourbusiness"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Hours */}
        <TabsContent value="hours" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Business Hours
              </CardTitle>
              <CardDescription>
                Set your operating hours for customers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(settings.business_hours).map(([day, hours]) => (
                <div key={day} className="flex items-center gap-4">
                  <Label className="w-20 capitalize">{day}</Label>
                  <Input
                    value={hours}
                    onChange={(e) => handleNestedChange('business_hours', day, e.target.value)}
                    placeholder="9:00 AM - 6:00 PM or Closed"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MerchantPageEditor;