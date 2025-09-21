import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useMerchantProfile } from '@/hooks/useMerchantProfile';
import { FileUpload } from '@/components/FileUpload';
import { 
  Plus, X, Upload, Eye, Save, Palette, Layout,
  Instagram, Facebook, Twitter, Globe, 
  Clock, MapPin, Phone, Mail, Settings,
  Smartphone, Monitor, Tablet, Code, Zap
} from 'lucide-react';

interface MerchantPageSettings {
  business_name: string;
  brand_story: string;
  theme_color: string;
  secondary_color: string;
  accent_color: string;
  logo: string;
  hero_image: string;
  gallery_images: string[];
  specialties: string[];
  featured_collections: string[];
  social_links: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    website?: string;
    tiktok?: string;
    linkedin?: string;
  };
  contact_info: {
    phone?: string;
    email?: string;
    address?: string;
    website?: string;
  };
  business_hours: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  layout_style: string;
  font_family: string;
  show_reviews: boolean;
  show_social_proof: boolean;
  enable_chat: boolean;
  enable_wishlist: boolean;
  show_stock_count: boolean;
  enable_quick_view: boolean;
  custom_css: string;
  meta_description: string;
  keywords: string;
  google_analytics: string;
  is_published: boolean;
}

interface EnhancedMerchantPageEditorProps {
  onSave?: (settings: MerchantPageSettings) => void;
  onPreview?: (settings: MerchantPageSettings) => void;
}

export const EnhancedMerchantPageEditor: React.FC<EnhancedMerchantPageEditorProps> = ({
  onSave,
  onPreview
}) => {
  const { profile: merchantProfile } = useMerchantProfile();
  const { toast } = useToast();
  const [activePreview, setActivePreview] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const [settings, setSettings] = useState<MerchantPageSettings>({
    business_name: '',
    brand_story: '',
    theme_color: '#000000',
    secondary_color: '#666666',
    accent_color: '#ff6b35',
    logo: '',
    hero_image: '',
    gallery_images: [],
    specialties: [],
    featured_collections: [],
    social_links: {},
    contact_info: {},
    business_hours: {},
    layout_style: 'modern',
    font_family: 'Inter',
    show_reviews: true,
    show_social_proof: true,
    enable_chat: false,
    enable_wishlist: true,
    show_stock_count: false,
    enable_quick_view: true,
    custom_css: '',
    meta_description: '',
    keywords: '',
    google_analytics: '',
    is_published: true
  });

  useEffect(() => {
    if (merchantProfile) {
      loadPageSettings();
    }
  }, [merchantProfile]);

  const loadPageSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('merchant_pages')
        .select('*')
        .eq('merchant_id', merchantProfile?.user_id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading page settings:', error);
        return;
      }

      if (data) {
        setSettings({
          business_name: data.business_name || merchantProfile?.business_name || '',
          brand_story: data.brand_story || '',
          theme_color: data.theme_color || '#000000',
          secondary_color: (data as any).secondary_color || '#666666',
          accent_color: (data as any).accent_color || '#ff6b35',
          logo: data.logo || '',
          hero_image: data.hero_image || '',
          gallery_images: (data as any).gallery_images || [],
          specialties: data.specialties || [],
          featured_collections: data.featured_collections || [],
          social_links: (data.social_links as any) || {},
          contact_info: (data.contact_info as any) || {},
          business_hours: (data.business_hours as any) || {},
          layout_style: (data as any).layout_style || 'modern',
          font_family: (data as any).font_family || 'Inter',
          show_reviews: (data as any).show_reviews !== false,
          show_social_proof: (data as any).show_social_proof !== false,
          enable_chat: (data as any).enable_chat || false,
          enable_wishlist: (data as any).enable_wishlist !== false,
          show_stock_count: (data as any).show_stock_count || false,
          enable_quick_view: (data as any).enable_quick_view !== false,
          custom_css: (data as any).custom_css || '',
          meta_description: (data as any).meta_description || '',
          keywords: (data as any).keywords || '',
          google_analytics: (data as any).google_analytics || '',
          is_published: data.is_published !== false
        });
      } else {
        setSettings(prev => ({
          ...prev,
          business_name: merchantProfile?.business_name || ''
        }));
      }
    } catch (error) {
      console.error('Error in loadPageSettings:', error);
    }
  };

  const savePageSettings = async () => {
    if (!merchantProfile) return;

    try {
      const { error } = await supabase
        .from('merchant_pages')
        .upsert({
          merchant_id: merchantProfile.user_id,
          ...settings
        });

      if (error) throw error;

      if (settings.business_name !== merchantProfile.business_name) {
        await supabase
          .from('merchant_profiles')
          .update({ business_name: settings.business_name })
          .eq('user_id', merchantProfile.user_id);
      }

      toast({
        title: "Success",
        description: "Page settings saved successfully"
      });

      onSave?.(settings);
    } catch (error) {
      console.error('Error saving page settings:', error);
      toast({
        title: "Error",
        description: "Failed to save page settings",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (field: keyof MerchantPageSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof MerchantPageSettings] as any,
        [field]: value
      }
    }));
  };

  const addGalleryImage = (url: string) => {
    setSettings(prev => ({
      ...prev,
      gallery_images: [...prev.gallery_images, url]
    }));
  };

  const removeGalleryImage = (index: number) => {
    setSettings(prev => ({
      ...prev,
      gallery_images: prev.gallery_images.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Enhanced Page Editor</CardTitle>
          <div className="flex gap-2">
            {/* Preview Device Toggles */}
            <div className="flex border rounded-md">
              <Button
                variant={activePreview === 'desktop' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActivePreview('desktop')}
              >
                <Monitor className="h-4 w-4" />
              </Button>
              <Button
                variant={activePreview === 'tablet' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActivePreview('tablet')}
              >
                <Tablet className="h-4 w-4" />
              </Button>
              <Button
                variant={activePreview === 'mobile' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActivePreview('mobile')}
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            </div>
            
            <Button variant="outline" onClick={() => onPreview?.(settings)}>
              <Eye className="h-4 w-4 mr-2" />
              Live Preview
            </Button>
            <Button onClick={savePageSettings}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="design">Design</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input
                      id="businessName"
                      value={settings.business_name}
                      onChange={(e) => handleInputChange('business_name', e.target.value)}
                      placeholder="Your Business Name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="brandStory">Brand Story</Label>
                    <Textarea
                      id="brandStory"
                      value={settings.brand_story}
                      onChange={(e) => handleInputChange('brand_story', e.target.value)}
                      placeholder="Tell your brand's story..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="specialties">Specialties (one per line)</Label>
                    <Textarea
                      id="specialties"
                      value={settings.specialties.join('\n')}
                      onChange={(e) => handleInputChange('specialties', e.target.value.split('\n').filter(s => s.trim()))}
                      placeholder="Luxury Fashion&#10;Sustainable Clothing&#10;Custom Tailoring"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="collections">Featured Collections (one per line)</Label>
                    <Textarea
                      id="collections"
                      value={settings.featured_collections.join('\n')}
                      onChange={(e) => handleInputChange('featured_collections', e.target.value.split('\n').filter(s => s.trim()))}
                      placeholder="Summer Collection 2024&#10;Formal Wear&#10;Casual Essentials"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="layoutStyle">Layout Style</Label>
                    <Select value={settings.layout_style} onValueChange={(value) => handleInputChange('layout_style', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose layout style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="modern">Modern & Clean</SelectItem>
                        <SelectItem value="classic">Classic & Elegant</SelectItem>
                        <SelectItem value="minimal">Minimal & Simple</SelectItem>
                        <SelectItem value="bold">Bold & Dynamic</SelectItem>
                        <SelectItem value="boutique">Boutique Style</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="fontFamily">Font Family</Label>
                    <Select value={settings.font_family} onValueChange={(value) => handleInputChange('font_family', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose font" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inter">Inter (Modern)</SelectItem>
                        <SelectItem value="Playfair Display">Playfair Display (Elegant)</SelectItem>
                        <SelectItem value="Roboto">Roboto (Clean)</SelectItem>
                        <SelectItem value="Montserrat">Montserrat (Stylish)</SelectItem>
                        <SelectItem value="Lora">Lora (Classic)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="published"
                      checked={settings.is_published}
                      onCheckedChange={(checked) => handleInputChange('is_published', checked)}
                    />
                    <Label htmlFor="published">Page Published</Label>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="design" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Color Scheme
                  </h3>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="primaryColor">Primary Color</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="primaryColor"
                          type="color"
                          value={settings.theme_color}
                          onChange={(e) => handleInputChange('theme_color', e.target.value)}
                          className="w-16"
                        />
                        <Input
                          value={settings.theme_color}
                          onChange={(e) => handleInputChange('theme_color', e.target.value)}
                          placeholder="#000000"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="secondaryColor">Secondary Color</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="secondaryColor"
                          type="color"
                          value={settings.secondary_color}
                          onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                          className="w-16"
                        />
                        <Input
                          value={settings.secondary_color}
                          onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                          placeholder="#666666"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="accentColor">Accent Color</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="accentColor"
                          type="color"
                          value={settings.accent_color}
                          onChange={(e) => handleInputChange('accent_color', e.target.value)}
                          className="w-16"
                        />
                        <Input
                          value={settings.accent_color}
                          onChange={(e) => handleInputChange('accent_color', e.target.value)}
                          placeholder="#ff6b35"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-3">Color Preview</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="h-16 rounded" style={{ backgroundColor: settings.theme_color }}>
                        <div className="p-2 text-white text-xs">Primary</div>
                      </div>
                      <div className="h-16 rounded" style={{ backgroundColor: settings.secondary_color }}>
                        <div className="p-2 text-white text-xs">Secondary</div>
                      </div>
                      <div className="h-16 rounded" style={{ backgroundColor: settings.accent_color }}>
                        <div className="p-2 text-white text-xs">Accent</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Layout className="h-5 w-5" />
                    Layout Customization
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Show Customer Reviews</Label>
                      <Switch
                        checked={settings.show_reviews}
                        onCheckedChange={(checked) => handleInputChange('show_reviews', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Show Social Proof</Label>
                      <Switch
                        checked={settings.show_social_proof}
                        onCheckedChange={(checked) => handleInputChange('show_social_proof', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Enable Live Chat</Label>
                      <Switch
                        checked={settings.enable_chat}
                        onCheckedChange={(checked) => handleInputChange('enable_chat', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Enable Wishlist</Label>
                      <Switch
                        checked={settings.enable_wishlist}
                        onCheckedChange={(checked) => handleInputChange('enable_wishlist', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Show Stock Count</Label>
                      <Switch
                        checked={settings.show_stock_count}
                        onCheckedChange={(checked) => handleInputChange('show_stock_count', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Enable Quick View</Label>
                      <Switch
                        checked={settings.enable_quick_view}
                        onCheckedChange={(checked) => handleInputChange('enable_quick_view', checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="media" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="logo">Logo</Label>
                    {settings.logo ? (
                      <div className="space-y-2">
                        <img src={settings.logo} alt="Logo preview" className="w-32 h-32 object-contain border rounded" />
                        <Button variant="outline" onClick={() => handleInputChange('logo', '')}>
                          <X className="w-4 h-4 mr-2" />
                          Remove Logo
                        </Button>
                      </div>
                    ) : (
                      <FileUpload
                        type="image"
                        onUpload={(url) => handleInputChange('logo', url)}
                        maxSize={2}
                        accept="image/*"
                      />
                    )}
                  </div>

                  <div>
                    <Label htmlFor="heroImage">Hero Background Image</Label>
                    {settings.hero_image ? (
                      <div className="space-y-2">
                        <img src={settings.hero_image} alt="Hero preview" className="w-full h-32 object-cover border rounded" />
                        <Button variant="outline" onClick={() => handleInputChange('hero_image', '')}>
                          <X className="w-4 h-4 mr-2" />
                          Remove Hero Image
                        </Button>
                      </div>
                    ) : (
                      <FileUpload
                        type="image"
                        onUpload={(url) => handleInputChange('hero_image', url)}
                        maxSize={5}
                        accept="image/*"
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Gallery Images (Max 10)</Label>
                    <p className="text-sm text-muted-foreground">Add images to showcase your store or products</p>
                    
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {settings.gallery_images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img src={image} alt={`Gallery ${index + 1}`} className="w-full h-24 object-cover rounded border" />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeGalleryImage(index)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    {settings.gallery_images.length < 10 && (
                      <FileUpload
                        type="image"
                        onUpload={addGalleryImage}
                        maxSize={3}
                        accept="image/*"
                      />
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contact" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Contact Information</h3>
                  
                  <div>
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone
                    </Label>
                    <Input
                      id="phone"
                      value={settings.contact_info.phone || ''}
                      onChange={(e) => handleNestedChange('contact_info', 'phone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={settings.contact_info.email || ''}
                      onChange={(e) => handleNestedChange('contact_info', 'email', e.target.value)}
                      placeholder="contact@business.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Business Address
                    </Label>
                    <Textarea
                      id="address"
                      value={settings.contact_info.address || ''}
                      onChange={(e) => handleNestedChange('contact_info', 'address', e.target.value)}
                      placeholder="123 Main Street&#10;City, State 12345&#10;Country"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="website" className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Website URL
                    </Label>
                    <Input
                      id="website"
                      value={settings.contact_info.website || ''}
                      onChange={(e) => handleNestedChange('contact_info', 'website', e.target.value)}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Business Hours
                  </h3>
                  
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                    <div key={day} className="flex items-center gap-2">
                      <Label className="w-24 capitalize">{day}</Label>
                      <Input
                        value={settings.business_hours[day] || ''}
                        onChange={(e) => handleNestedChange('business_hours', day, e.target.value)}
                        placeholder="9:00 AM - 6:00 PM or 'Closed'"
                        className="flex-1"
                      />
                    </div>
                  ))}

                  <div className="mt-6 space-y-4">
                    <h3 className="text-lg font-semibold">Social Media Links</h3>
                    
                    <div>
                      <Label htmlFor="instagram">Instagram</Label>
                      <Input
                        id="instagram"
                        value={settings.social_links.instagram || ''}
                        onChange={(e) => handleNestedChange('social_links', 'instagram', e.target.value)}
                        placeholder="your_instagram_handle"
                      />
                    </div>

                    <div>
                      <Label htmlFor="facebook">Facebook</Label>
                      <Input
                        id="facebook"
                        value={settings.social_links.facebook || ''}
                        onChange={(e) => handleNestedChange('social_links', 'facebook', e.target.value)}
                        placeholder="https://facebook.com/yourpage"
                      />
                    </div>

                    <div>
                      <Label htmlFor="twitter">Twitter</Label>
                      <Input
                        id="twitter"
                        value={settings.social_links.twitter || ''}
                        onChange={(e) => handleNestedChange('social_links', 'twitter', e.target.value)}
                        placeholder="@your_twitter"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="features" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Store Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Customer Reviews & Ratings</Label>
                          <p className="text-sm text-muted-foreground">Show customer feedback on products</p>
                        </div>
                        <Switch
                          checked={settings.show_reviews}
                          onCheckedChange={(checked) => handleInputChange('show_reviews', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Social Proof Indicators</Label>
                          <p className="text-sm text-muted-foreground">Display purchase notifications and popularity</p>
                        </div>
                        <Switch
                          checked={settings.show_social_proof}
                          onCheckedChange={(checked) => handleInputChange('show_social_proof', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Live Chat Support</Label>
                          <p className="text-sm text-muted-foreground">Real-time customer support</p>
                        </div>
                        <Switch
                          checked={settings.enable_chat}
                          onCheckedChange={(checked) => handleInputChange('enable_chat', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Wishlist Functionality</Label>
                          <p className="text-sm text-muted-foreground">Let customers save favorite items</p>
                        </div>
                        <Switch
                          checked={settings.enable_wishlist}
                          onCheckedChange={(checked) => handleInputChange('enable_wishlist', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Stock Count Display</Label>
                          <p className="text-sm text-muted-foreground">Show remaining inventory</p>
                        </div>
                        <Switch
                          checked={settings.show_stock_count}
                          onCheckedChange={(checked) => handleInputChange('show_stock_count', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Quick View Modal</Label>
                          <p className="text-sm text-muted-foreground">Preview products without leaving the page</p>
                        </div>
                        <Switch
                          checked={settings.enable_quick_view}
                          onCheckedChange={(checked) => handleInputChange('enable_quick_view', checked)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="customCSS" className="flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      Custom CSS
                    </Label>
                    <Textarea
                      id="customCSS"
                      value={settings.custom_css}
                      onChange={(e) => handleInputChange('custom_css', e.target.value)}
                      placeholder="/* Add custom CSS styles here */&#10;.my-custom-class {&#10;  color: #333;&#10;}"
                      rows={8}
                      className="font-mono text-sm"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Add custom CSS to personalize your page appearance
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="googleAnalytics">Google Analytics ID</Label>
                    <Input
                      id="googleAnalytics"
                      value={settings.google_analytics}
                      onChange={(e) => handleInputChange('google_analytics', e.target.value)}
                      placeholder="G-XXXXXXXXXX or UA-XXXXXXXXX-X"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Track visitor behavior and performance
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="metaDescription">SEO Meta Description</Label>
                    <Textarea
                      id="metaDescription"
                      value={settings.meta_description}
                      onChange={(e) => handleInputChange('meta_description', e.target.value)}
                      placeholder="A brief description of your business for search engines..."
                      rows={3}
                      maxLength={160}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      {settings.meta_description.length}/160 characters for optimal SEO
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="keywords">SEO Keywords</Label>
                    <Textarea
                      id="keywords"
                      value={settings.keywords}
                      onChange={(e) => handleInputChange('keywords', e.target.value)}
                      placeholder="fashion, clothing, style, boutique, designer"
                      rows={2}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Comma-separated keywords for search optimization
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};