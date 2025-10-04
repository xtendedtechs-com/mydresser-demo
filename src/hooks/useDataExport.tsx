import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ExportData {
  profile: any;
  wardrobeItems: any[];
  outfits: any[];
  posts: any[];
  marketTransactions: any[];
  settings: any;
}

export const useDataExport = () => {
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const exportAllData = async (): Promise<ExportData | null> => {
    setExporting(true);
    setProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Fetch profile data
      setProgress(10);
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Fetch wardrobe items
      setProgress(25);
      const { data: wardrobeItems } = await supabase
        .from('wardrobe_items')
        .select('*')
        .eq('user_id', user.id);

      // Fetch outfits
      setProgress(40);
      const { data: outfits } = await supabase
        .from('outfits')
        .select('*, outfit_items(*)')
        .eq('user_id', user.id);

      // Fetch social posts
      setProgress(55);
      const { data: posts } = await supabase
        .from('social_posts')
        .select('*')
        .eq('user_id', user.id);

      // Fetch marketplace transactions
      setProgress(70);
      const { data: buyerTransactions } = await supabase
        .from('marketplace_transactions')
        .select('*')
        .eq('buyer_id', user.id);

      const { data: sellerTransactions } = await supabase
        .from('marketplace_transactions')
        .select('*')
        .eq('seller_id', user.id);

      // Fetch user settings
      setProgress(85);
      const { data: settings } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setProgress(100);

      const exportData: ExportData = {
        profile: profile || {},
        wardrobeItems: wardrobeItems || [],
        outfits: outfits || [],
        posts: posts || [],
        marketTransactions: [
          ...(buyerTransactions || []),
          ...(sellerTransactions || []),
        ],
        settings: settings || {},
      };

      return exportData;
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
      return null;
    } finally {
      setExporting(false);
    }
  };

  const downloadAsJSON = (data: ExportData) => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mydresser-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully');
  };

  const downloadAsCSV = (data: ExportData) => {
    // Convert wardrobe items to CSV
    const wardrobeCSV = convertToCSV(data.wardrobeItems, [
      'id', 'name', 'category', 'brand', 'color', 'size', 'price', 
      'purchase_date', 'wear_count', 'is_favorite'
    ]);

    // Convert outfits to CSV
    const outfitsCSV = convertToCSV(data.outfits, [
      'id', 'name', 'occasion', 'season', 'is_favorite', 'created_at'
    ]);

    // Create a combined CSV with sections
    const combinedCSV = `
# MyDresser Data Export
# Generated: ${new Date().toISOString()}

## Wardrobe Items
${wardrobeCSV}

## Outfits
${outfitsCSV}
    `.trim();

    const blob = new Blob([combinedCSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mydresser-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Data exported as CSV');
  };

  const convertToCSV = (data: any[], columns: string[]): string => {
    if (!data || data.length === 0) return 'No data available';

    const header = columns.join(',');
    const rows = data.map(item => 
      columns.map(col => {
        const value = item[col];
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      }).join(',')
    );

    return [header, ...rows].join('\n');
  };

  return {
    exportAllData,
    downloadAsJSON,
    downloadAsCSV,
    exporting,
    progress,
  };
};
