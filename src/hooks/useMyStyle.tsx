import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserStyle {
  id: string;
  user_id: string;
  style_name: string;
  style_description: string | null;
  color_palette: any;
  preferred_categories: any;
  style_keywords: string[];
  inspiration_images: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface UseMyStyleReturn {
  styles: UserStyle[];
  activeStyle: UserStyle | null;
  loading: boolean;
  createStyle: (styleData: any) => Promise<void>;
  updateStyle: (styleId: string, styleData: any) => Promise<void>;
  deleteStyle: (styleId: string) => Promise<void>;
  setActiveStyle: (styleId: string) => Promise<void>;
  fetchStyles: () => Promise<void>;
}

export const useMyStyle = (): UseMyStyleReturn => {
  const [styles, setStyles] = useState<UserStyle[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const activeStyle = styles.find(style => style.is_active) || null;

  const fetchStyles = async () => {
    try {
      setLoading(true);
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

  const createStyle = async (styleData: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_styles')
        .insert([{
          ...styleData,
          user_id: user.id
        }]);

      if (error) throw error;
      
      toast({
        title: "Style Created",
        description: "Your new style has been created successfully"
      });
      
      await fetchStyles();
    } catch (error) {
      console.error('Error creating style:', error);
      toast({
        title: "Error",
        description: "Failed to create style",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateStyle = async (styleId: string, styleData: any) => {
    try {
      const { error } = await supabase
        .from('user_styles')
        .update(styleData)
        .eq('id', styleId);

      if (error) throw error;
      
      toast({
        title: "Style Updated",
        description: "Your style has been updated successfully"
      });
      
      await fetchStyles();
    } catch (error) {
      console.error('Error updating style:', error);
      toast({
        title: "Error",
        description: "Failed to update style",
        variant: "destructive"
      });
      throw error;
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
      
      await fetchStyles();
    } catch (error) {
      console.error('Error deleting style:', error);
      toast({
        title: "Error",
        description: "Failed to delete style",
        variant: "destructive"
      });
      throw error;
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
      
      await fetchStyles();
    } catch (error) {
      console.error('Error setting active style:', error);
      toast({
        title: "Error",
        description: "Failed to update active style",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchStyles();
  }, []);

  return {
    styles,
    activeStyle,
    loading,
    createStyle,
    updateStyle,
    deleteStyle,
    setActiveStyle,
    fetchStyles
  };
};