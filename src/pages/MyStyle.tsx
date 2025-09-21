import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Palette, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  Sparkles, 
  Heart,
  Shirt,
  Eye,
  Upload
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";

interface UserStyle {
  id: string;
  style_name: string;
  style_description: string | null;
  color_palette: any;
  preferred_categories: any;
  style_keywords: string[];
  inspiration_images: string[];
  is_active: boolean;
  created_at: string;
}

const MyStyle = () => {
  const { profile } = useProfile();
  const { toast } = useToast();
  const [styles, setStyles] = useState<UserStyle[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStyle, setEditingStyle] = useState<UserStyle | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    style_name: '',
    style_description: '',
    color_palette: {
      primary: '#000000',
      secondary: '#ffffff',
      accent: '#6366f1'
    },
    preferred_categories: {
      tops: true,
      bottoms: true,
      dresses: false,
      shoes: true,
      accessories: true
    },
    style_keywords: [] as string[],
    inspiration_images: [] as string[]
  });

  const [newKeyword, setNewKeyword] = useState('');

  useEffect(() => {
    fetchStyles();
  }, []);

  const fetchStyles = async () => {
    try {
      const { data, error } = await supabase
        .from('user_styles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStyles(data || []);
    } catch (error) {
      console.error('Error fetching styles:', error);
      toast({
        title: "Error",
        description: "Failed to load your styles",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveStyle = async () => {
    try {
      if (!formData.style_name.trim()) {
        toast({
          title: "Name Required",
          description: "Please enter a name for your style",
          variant: "destructive"
        });
        return;
      }

      const styleData = {
        style_name: formData.style_name,
        style_description: formData.style_description || null,
        color_palette: formData.color_palette,
        preferred_categories: formData.preferred_categories,
        style_keywords: formData.style_keywords,
        inspiration_images: formData.inspiration_images,
        is_active: true
      };

      if (editingStyle) {
        const { error } = await supabase
          .from('user_styles')
          .update(styleData)
          .eq('id', editingStyle.id);

        if (error) throw error;
        
        toast({
          title: "Style Updated",
          description: "Your style has been updated successfully"
        });
      } else {
        const { error } = await supabase
          .from('user_styles')
          .insert([{
            ...styleData,
            user_id: profile?.user_id
          }]);

        if (error) throw error;
        
        toast({
          title: "Style Created",
          description: "Your new style has been created successfully"
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchStyles();
    } catch (error) {
      console.error('Error saving style:', error);
      toast({
        title: "Error",
        description: "Failed to save your style",
        variant: "destructive"
      });
    }
  };

  const deleteStyle = async (styleId: string) => {
    try {
      const { error } = await supabase
        .from('user_styles')
        .delete()
        .eq('id', styleId);

      if (error) throw error;
      
      toast({
        title: "Style Deleted",
        description: "Your style has been deleted"
      });
      
      fetchStyles();
    } catch (error) {
      console.error('Error deleting style:', error);
      toast({
        title: "Error",
        description: "Failed to delete style",
        variant: "destructive"
      });
    }
  };

  const setActiveStyle = async (styleId: string) => {
    try {
      // First, set all styles to inactive
      await supabase
        .from('user_styles')
        .update({ is_active: false })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      // Then set the selected style as active
      const { error } = await supabase
        .from('user_styles')
        .update({ is_active: true })
        .eq('id', styleId);

      if (error) throw error;
      
      toast({
        title: "Active Style Updated",
        description: "Your active style has been updated"
      });
      
      fetchStyles();
    } catch (error) {
      console.error('Error setting active style:', error);
      toast({
        title: "Error",
        description: "Failed to update active style",
        variant: "destructive"
      });
    }
  };

  const editStyle = (style: UserStyle) => {
    setEditingStyle(style);
    setFormData({
      style_name: style.style_name,
      style_description: style.style_description || '',
      color_palette: style.color_palette || {
        primary: '#000000',
        secondary: '#ffffff',
        accent: '#6366f1'
      },
      preferred_categories: style.preferred_categories || {
        tops: true,
        bottoms: true,
        dresses: false,
        shoes: true,
        accessories: true
      },
      style_keywords: style.style_keywords || [],
      inspiration_images: style.inspiration_images || []
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingStyle(null);
    setFormData({
      style_name: '',
      style_description: '',
      color_palette: {
        primary: '#000000',
        secondary: '#ffffff',
        accent: '#6366f1'
      },
      preferred_categories: {
        tops: true,
        bottoms: true,
        dresses: false,
        shoes: true,
        accessories: true
      },
      style_keywords: [],
      inspiration_images: []
    });
    setNewKeyword('');
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !formData.style_keywords.includes(newKeyword.trim())) {
      setFormData(prev => ({
        ...prev,
        style_keywords: [...prev.style_keywords, newKeyword.trim()]
      }));
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      style_keywords: prev.style_keywords.filter(k => k !== keyword)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 px-4 py-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your styles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold fashion-text-gradient flex items-center justify-center gap-2">
            <Palette className="w-8 h-8" />
            MY STYLE
          </h1>
          <p className="text-muted-foreground">Define your personal style and let AI curate perfect outfits for you</p>
        </div>

        {/* Active Style Display */}
        {styles.find(s => s.is_active) && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-primary">Current Active Style</CardTitle>
                    <CardDescription>This style guides your outfit recommendations</CardDescription>
                  </div>
                </div>
                <Badge variant="default">Active</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {(() => {
                const activeStyle = styles.find(s => s.is_active);
                return activeStyle ? (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">{activeStyle.style_name}</h3>
                    {activeStyle.style_description && (
                      <p className="text-muted-foreground">{activeStyle.style_description}</p>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Color Palette:</span>
                      <div className="flex gap-2">
                        <div 
                          className="w-6 h-6 rounded-full border"
                          style={{ backgroundColor: activeStyle.color_palette?.primary || '#000000' }}
                        />
                        <div 
                          className="w-6 h-6 rounded-full border"
                          style={{ backgroundColor: activeStyle.color_palette?.secondary || '#ffffff' }}
                        />
                        <div 
                          className="w-6 h-6 rounded-full border"
                          style={{ backgroundColor: activeStyle.color_palette?.accent || '#6366f1' }}
                        />
                      </div>
                    </div>
                    {activeStyle.style_keywords.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-sm font-medium">Style Keywords:</span>
                        <div className="flex flex-wrap gap-2">
                          {activeStyle.style_keywords.map(keyword => (
                            <Badge key={keyword} variant="secondary">{keyword}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : null;
              })()}
            </CardContent>
          </Card>
        )}

        {/* Create New Style Button */}
        <div className="flex justify-center">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Create New Style
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingStyle ? 'Edit Style' : 'Create New Style'}
                </DialogTitle>
                <DialogDescription>
                  Define your personal style to get better outfit recommendations
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="style_name">Style Name *</Label>
                    <Input
                      id="style_name"
                      value={formData.style_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, style_name: e.target.value }))}
                      placeholder="e.g., Minimalist Chic, Bohemian Dreams"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="style_description">Description</Label>
                    <Textarea
                      id="style_description"
                      value={formData.style_description}
                      onChange={(e) => setFormData(prev => ({ ...prev, style_description: e.target.value }))}
                      placeholder="Describe your style in detail..."
                      rows={3}
                    />
                  </div>
                </div>

                {/* Color Palette */}
                <div className="space-y-3">
                  <Label>Color Palette</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs">Primary</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formData.color_palette.primary}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            color_palette: { ...prev.color_palette, primary: e.target.value }
                          }))}
                          className="w-8 h-8 rounded border"
                        />
                        <Input
                          value={formData.color_palette.primary}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            color_palette: { ...prev.color_palette, primary: e.target.value }
                          }))}
                          className="text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Secondary</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formData.color_palette.secondary}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            color_palette: { ...prev.color_palette, secondary: e.target.value }
                          }))}
                          className="w-8 h-8 rounded border"
                        />
                        <Input
                          value={formData.color_palette.secondary}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            color_palette: { ...prev.color_palette, secondary: e.target.value }
                          }))}
                          className="text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Accent</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formData.color_palette.accent}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            color_palette: { ...prev.color_palette, accent: e.target.value }
                          }))}
                          className="w-8 h-8 rounded border"
                        />
                        <Input
                          value={formData.color_palette.accent}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            color_palette: { ...prev.color_palette, accent: e.target.value }
                          }))}
                          className="text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Style Keywords */}
                <div className="space-y-3">
                  <Label>Style Keywords</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      placeholder="Add keyword..."
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                    />
                    <Button type="button" onClick={addKeyword} variant="outline">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {formData.style_keywords.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.style_keywords.map(keyword => (
                        <Badge key={keyword} variant="secondary" className="cursor-pointer">
                          {keyword}
                          <button
                            onClick={() => removeKeyword(keyword)}
                            className="ml-2 hover:text-destructive"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={saveStyle} className="flex-1">
                    <Save className="w-4 h-4 mr-2" />
                    {editingStyle ? 'Update Style' : 'Create Style'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Styles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {styles.map(style => (
            <Card key={style.id} className={`relative ${style.is_active ? 'ring-2 ring-primary' : ''}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {style.is_active && <Heart className="w-4 h-4 text-primary fill-current" />}
                      {style.style_name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {style.style_description}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => editStyle(style)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteStyle(style.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Color Palette */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Colors:</span>
                  <div className="flex gap-1">
                    <div 
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: style.color_palette?.primary || '#000000' }}
                    />
                    <div 
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: style.color_palette?.secondary || '#ffffff' }}
                    />
                    <div 
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: style.color_palette?.accent || '#6366f1' }}
                    />
                  </div>
                </div>

                {/* Keywords */}
                {style.style_keywords.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1">
                      {style.style_keywords.slice(0, 3).map(keyword => (
                        <Badge key={keyword} variant="outline" className="text-xs">{keyword}</Badge>
                      ))}
                      {style.style_keywords.length > 3 && (
                        <Badge variant="outline" className="text-xs">+{style.style_keywords.length - 3}</Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  {!style.is_active && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveStyle(style.id)}
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Set Active
                    </Button>
                  )}
                  {style.is_active && (
                    <Badge variant="default" className="flex-1 justify-center">
                      Active Style
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {styles.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Palette className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No styles created yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first style to get personalized outfit recommendations
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Style
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MyStyle;