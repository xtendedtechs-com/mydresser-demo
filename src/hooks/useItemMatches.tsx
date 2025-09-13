import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { WardrobeItem } from './useWardrobe';
import { MerchantItem } from './useMerchantItems';
export interface ItemMatch {
  id: string;
  user_id: string;
  user_item_id: string;
  merchant_item_id: string;
  match_score: number;
  match_reasons?: string[];
  status: string;
  created_at: string;
  updated_at: string;
}

export const useItemMatches = () => {
  const [matches, setMatches] = useState<ItemMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('item_matches')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMatches(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading item matches",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const findMatches = async (wardrobeItem: WardrobeItem, merchantItems: MerchantItem[]) => {
    const potentialMatches = merchantItems.filter(merchantItem => {
      // Match by category
      if (merchantItem.category.toLowerCase() !== wardrobeItem.category.toLowerCase()) {
        return false;
      }

      // Calculate match score based on various factors
      let score = 0.5; // Base score for category match

      // Brand match
      if (wardrobeItem.brand && merchantItem.brand &&
          wardrobeItem.brand.toLowerCase() === merchantItem.brand.toLowerCase()) {
        score += 0.3;
      }

      // Color match
      if (wardrobeItem.color && merchantItem.color &&
          wardrobeItem.color.toLowerCase() === merchantItem.color.toLowerCase()) {
        score += 0.2;
      }

      // Material match
      if (wardrobeItem.material && merchantItem.material &&
          wardrobeItem.material.toLowerCase() === merchantItem.material.toLowerCase()) {
        score += 0.1;
      }

      // Size match (if merchant has multiple sizes)
      if (wardrobeItem.size && merchantItem.size &&
          merchantItem.size.includes(wardrobeItem.size)) {
        score += 0.1;
      }

      return score >= 0.7; // Only return items with high match score
    });

    return potentialMatches.map(merchantItem => ({
      merchantItem,
      matchScore: calculateMatchScore(wardrobeItem, merchantItem),
      matchReasons: getMatchReasons(wardrobeItem, merchantItem)
    }));
  };

  const calculateMatchScore = (wardrobeItem: WardrobeItem, merchantItem: MerchantItem): number => {
    let score = 0;
    const factors = [];

    // Category match (required)
    if (merchantItem.category.toLowerCase() === wardrobeItem.category.toLowerCase()) {
      score += 0.4;
      factors.push('category');
    }

    // Brand match
    if (wardrobeItem.brand && merchantItem.brand &&
        wardrobeItem.brand.toLowerCase() === merchantItem.brand.toLowerCase()) {
      score += 0.25;
      factors.push('brand');
    }

    // Color match
    if (wardrobeItem.color && merchantItem.color &&
        wardrobeItem.color.toLowerCase() === merchantItem.color.toLowerCase()) {
      score += 0.15;
      factors.push('color');
    }

    // Material match
    if (wardrobeItem.material && merchantItem.material &&
        wardrobeItem.material.toLowerCase() === merchantItem.material.toLowerCase()) {
      score += 0.1;
      factors.push('material');
    }

    // Size match
    if (wardrobeItem.size && merchantItem.size &&
        merchantItem.size.includes(wardrobeItem.size)) {
      score += 0.1;
      factors.push('size');
    }

    return Math.min(score, 1.0);
  };

  const getMatchReasons = (wardrobeItem: WardrobeItem, merchantItem: MerchantItem): string[] => {
    const reasons = [];

    if (merchantItem.category.toLowerCase() === wardrobeItem.category.toLowerCase()) {
      reasons.push('Same category');
    }

    if (wardrobeItem.brand && merchantItem.brand &&
        wardrobeItem.brand.toLowerCase() === merchantItem.brand.toLowerCase()) {
      reasons.push('Same brand');
    }

    if (wardrobeItem.color && merchantItem.color &&
        wardrobeItem.color.toLowerCase() === merchantItem.color.toLowerCase()) {
      reasons.push('Same color');
    }

    if (wardrobeItem.material && merchantItem.material &&
        wardrobeItem.material.toLowerCase() === merchantItem.material.toLowerCase()) {
      reasons.push('Same material');
    }

    if (wardrobeItem.size && merchantItem.size &&
        merchantItem.size.includes(wardrobeItem.size)) {
      reasons.push('Size available');
    }

    return reasons;
  };

  const createMatch = async (
    userItemId: string,
    merchantItemId: string,
    matchScore: number,
    matchReasons: string[]
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('item_matches')
        .insert({
          user_id: user.id,
          user_item_id: userItemId,
          merchant_item_id: merchantItemId,
          match_score: matchScore,
          match_reasons: matchReasons,
          status: 'suggested'
        })
        .select()
        .single();

      if (error) throw error;

      setMatches(prev => [data, ...prev]);
      return data;
    } catch (error: any) {
      toast({
        title: "Error creating match",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateMatchStatus = async (matchId: string, status: string) => {
    try {
      const { data, error } = await supabase
        .from('item_matches')
        .update({ status })
        .eq('id', matchId)
        .select()
        .single();

      if (error) throw error;

      setMatches(prev => prev.map(match =>
        match.id === matchId ? { ...match, status } : match
      ));

      return data;
    } catch (error: any) {
      toast({
        title: "Error updating match",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const getSuggestedMatches = () => {
    return matches.filter(match => match.status === 'suggested');
  };

  const getAcceptedMatches = () => {
    return matches.filter(match => match.status === 'accepted');
  };

  return {
    matches,
    loading,
    findMatches,
    createMatch,
    updateMatchStatus,
    getSuggestedMatches,
    getAcceptedMatches,
    refetch: fetchMatches
  };
};