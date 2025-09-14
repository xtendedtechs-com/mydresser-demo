import { useState } from 'react';
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
  match_reasons: string[];
  status: 'suggested' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface MatchResult {
  merchantItem: MerchantItem;
  matchScore: number;
  matchReasons: string[];
}

export const useItemMatches = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const calculateMatchScore = (wardrobeItem: WardrobeItem, merchantItem: MerchantItem): MatchResult => {
    let score = 0;
    const reasons: string[] = [];

    // Category match (high weight)
    if (wardrobeItem.category.toLowerCase() === merchantItem.category.toLowerCase()) {
      score += 0.4;
      reasons.push('Same category');
    }

    // Brand match (medium weight)
    if (wardrobeItem.brand && merchantItem.brand && 
        wardrobeItem.brand.toLowerCase() === merchantItem.brand.toLowerCase()) {
      score += 0.2;
      reasons.push('Same brand');
    }

    // Color match (medium weight)
    if (wardrobeItem.color && merchantItem.color && 
        wardrobeItem.color.toLowerCase().includes(merchantItem.color.toLowerCase()) ||
        merchantItem.color.toLowerCase().includes(wardrobeItem.color.toLowerCase())) {
      score += 0.15;
      reasons.push('Similar color');
    }

    // Size match (low weight)
    if (wardrobeItem.size && merchantItem.size && 
        Array.isArray(merchantItem.size) && merchantItem.size.includes(wardrobeItem.size)) {
      score += 0.1;
      reasons.push('Available in your size');
    }

    // Season match (low weight)
    if (wardrobeItem.season && merchantItem.season && 
        (wardrobeItem.season === merchantItem.season || 
         wardrobeItem.season === 'all-season' || 
         merchantItem.season === 'all-season')) {
      score += 0.1;
      reasons.push('Suitable for season');
    }

    // Occasion match (low weight)
    if (wardrobeItem.occasion && merchantItem.occasion && 
        wardrobeItem.occasion === merchantItem.occasion) {
      score += 0.05;
      reasons.push('Same occasion');
    }

    // If no reasons found, add a generic one
    if (reasons.length === 0) {
      reasons.push('Similar style profile');
    }

    return {
      merchantItem,
      matchScore: Math.min(score, 1), // Cap at 1.0
      matchReasons: reasons
    };
  };

  const findMatches = async (
    wardrobeItem: WardrobeItem, 
    merchantItems: MerchantItem[],
    minScore: number = 0.3
  ): Promise<MatchResult[]> => {
    try {
      setLoading(true);

      // Calculate matches locally
      const matches = merchantItems
        .map(merchantItem => calculateMatchScore(wardrobeItem, merchantItem))
        .filter(match => match.matchScore >= minScore)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 10); // Top 10 matches

      return matches;
    } catch (error: any) {
      console.error('Error finding matches:', error);
      toast({
        title: 'Error',
        description: 'Failed to find matching items',
        variant: 'destructive'
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const saveMatch = async (
    wardrobeItemId: string,
    merchantItemId: string,
    matchScore: number,
    matchReasons: string[]
  ): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('item_matches')
        .insert({
          user_id: user.id,
          user_item_id: wardrobeItemId,
          merchant_item_id: merchantItemId,
          match_score: matchScore,
          match_reasons: matchReasons,
          status: 'suggested'
        });

      if (error) throw error;
      return true;
    } catch (error: any) {
      console.error('Error saving match:', error);
      toast({
        title: 'Error',
        description: 'Failed to save match',
        variant: 'destructive'
      });
      return false;
    }
  };

  const updateMatchStatus = async (
    matchId: string,
    status: 'accepted' | 'rejected'
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('item_matches')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', matchId);

      if (error) throw error;
      return true;
    } catch (error: any) {
      console.error('Error updating match status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update match status',
        variant: 'destructive'
      });
      return false;
    }
  };

  const getUserMatches = async (): Promise<ItemMatch[]> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('item_matches')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as ItemMatch[];
    } catch (error: any) {
      console.error('Error fetching user matches:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch matches',
        variant: 'destructive'
      });
      return [];
    }
  };

  const createMatch = async (
    wardrobeItemId: string,
    merchantItemId: string,
    matchScore: number,
    matchReasons: string[]
  ): Promise<boolean> => {
    return await saveMatch(wardrobeItemId, merchantItemId, matchScore, matchReasons);
  };

  return {
    loading,
    findMatches,
    saveMatch,
    createMatch,
    updateMatchStatus,
    getUserMatches
  };
};