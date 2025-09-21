import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useMerchantProfile } from '@/hooks/useMerchantProfile';
import { 
  Plus, X, Upload, Eye, Save, 
  Instagram, Facebook, Twitter, 
  Clock, MapPin, Phone, Mail 
} from 'lucide-react';

interface MerchantPageSettings {
  business_name: string;
  brand_story: string;
  theme_color: string;
  logo: string;
  hero_image: string;
  specialties: string[];
  featured_collections: string[];
  social_links: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    website?: string;
  };
  contact_info: {
    phone?: string;
    email?: string;
    address?: string;
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
  is_published: boolean;
}

interface MerchantPageEditorProps {
  onSave?: (settings: MerchantPageSettings) => void;
  onPreview?: (settings: MerchantPageSettings) => void;
}

export const MerchantPageEditor: React.FC<MerchantPageEditorProps> = ({
  onSave,
  onPreview
}) => {
  const { profile: merchantProfile } = useMerchantProfile();
  const { toast } = useToast();

  const [settings, setSettings] = useState<MerchantPageSettings>({
    business_name: '',
    brand_story: '',
    theme_color: '#000000',
    logo: '',
    hero_image: '',
    specialties: [],
    featured_collections: [],
    social_links: {},
    contact_info: {},
    business_hours: {},
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
          logo: data.logo || '',
          hero_image: data.hero_image || '',
          specialties: data.specialties || [],
          featured_collections: data.featured_collections || [],
          social_links: (data.social_links as any) || {},
          contact_info: (data.contact_info as any) || {},
          business_hours: (data.business_hours as any) || {},
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
        ...prev[parent],
        [field]: value
      }
    }));
  };

  return (
    <div className="space-y-6">      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Merchant Page Editor</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onPreview?.(settings)}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button onClick={savePageSettings}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="branding">Branding</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
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

                <div className="flex items-center space-x-2">
                  <Switch
                    id="published"
                    checked={settings.is_published}
                    onCheckedChange={(checked) => handleInputChange('is_published', checked)}
                  />
                  <Label htmlFor="published">Page Published</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="branding" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="themeColor">Theme Color</Label>
                  <Input
                    id="themeColor"
                    type="color"
                    value={settings.theme_color}
                    onChange={(e) => handleInputChange('theme_color', e.target.value)}
                    className="w-20"
                  />
                </div>

                <div>
                  <Label htmlFor="logo">Logo URL</Label>
                  <Input
                    id="logo"
                    value={settings.logo}
                    onChange={(e) => handleInputChange('logo', e.target.value)}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contact" className="space-y-4">
              <div className="space-y-4">
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
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};