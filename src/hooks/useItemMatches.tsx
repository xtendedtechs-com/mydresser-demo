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
      const score = calculateDetailedMatchScore(wardrobeItem, merchantItem);
      return score >= 0.6; // Lower threshold for broader matching
    });

    // Sort by match score descending
    const sortedMatches = potentialMatches
      .map(merchantItem => ({
        merchantItem,
        matchScore: calculateDetailedMatchScore(wardrobeItem, merchantItem),
        matchReasons: getDetailedMatchReasons(wardrobeItem, merchantItem)
      }))
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5); // Return top 5 matches

    return sortedMatches;
  };

  const calculateDetailedMatchScore = (wardrobeItem: WardrobeItem, merchantItem: MerchantItem): number => {
    let score = 0;
    let maxPossibleScore = 0;

    // Category match (essential - high weight)
    maxPossibleScore += 0.3;
    if (merchantItem.category.toLowerCase() === wardrobeItem.category.toLowerCase()) {
      score += 0.3;
    }

    // Name similarity using fuzzy matching
    maxPossibleScore += 0.25;
    if (wardrobeItem.name && merchantItem.name) {
      const nameSimilarity = calculateTextSimilarity(wardrobeItem.name, merchantItem.name);
      score += nameSimilarity * 0.25;
    }

    // Brand match
    maxPossibleScore += 0.2;
    if (wardrobeItem.brand && merchantItem.brand) {
      if (wardrobeItem.brand.toLowerCase() === merchantItem.brand.toLowerCase()) {
        score += 0.2;
      } else {
        // Partial brand similarity
        const brandSimilarity = calculateTextSimilarity(wardrobeItem.brand, merchantItem.brand);
        if (brandSimilarity > 0.7) {
          score += brandSimilarity * 0.15;
        }
      }
    }

    // Color match
    maxPossibleScore += 0.15;
    if (wardrobeItem.color && merchantItem.color) {
      if (wardrobeItem.color.toLowerCase() === merchantItem.color.toLowerCase()) {
        score += 0.15;
      } else {
        // Check for color variations (e.g., "navy blue" vs "blue")
        const colorSimilarity = calculateColorSimilarity(wardrobeItem.color, merchantItem.color);
        score += colorSimilarity * 0.1;
      }
    }

    // Material match
    maxPossibleScore += 0.1;
    if (wardrobeItem.material && merchantItem.material) {
      if (wardrobeItem.material.toLowerCase() === merchantItem.material.toLowerCase()) {
        score += 0.1;
      } else {
        const materialSimilarity = calculateTextSimilarity(wardrobeItem.material, merchantItem.material);
        if (materialSimilarity > 0.8) {
          score += materialSimilarity * 0.08;
        }
      }
    }

    // Size compatibility
    if (wardrobeItem.size && merchantItem.size) {
      if (Array.isArray(merchantItem.size) && merchantItem.size.includes(wardrobeItem.size)) {
        score += 0.05;
      } else if (typeof merchantItem.size === 'string' && merchantItem.size === wardrobeItem.size) {
        score += 0.05;
      }
    }

    // Normalize score based on available data
    return maxPossibleScore > 0 ? Math.min(score / maxPossibleScore, 1.0) : 0;
  };

  const calculateTextSimilarity = (text1: string, text2: string): number => {
    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
    const norm1 = normalize(text1);
    const norm2 = normalize(text2);
    
    if (norm1 === norm2) return 1.0;
    if (norm1.includes(norm2) || norm2.includes(norm1)) return 0.8;
    
    // Basic Levenshtein-inspired similarity
    const maxLen = Math.max(norm1.length, norm2.length);
    if (maxLen === 0) return 1.0;
    
    let matches = 0;
    for (let i = 0; i < Math.min(norm1.length, norm2.length); i++) {
      if (norm1[i] === norm2[i]) matches++;
    }
    
    return matches / maxLen;
  };

  const calculateColorSimilarity = (color1: string, color2: string): number => {
    const colorVariations: { [key: string]: string[] } = {
      'blue': ['navy', 'royal', 'sky', 'denim', 'cobalt'],
      'red': ['crimson', 'burgundy', 'maroon', 'cherry'],
      'green': ['olive', 'forest', 'emerald', 'mint'],
      'black': ['charcoal', 'ebony', 'jet'],
      'white': ['cream', 'ivory', 'pearl', 'off-white'],
      'brown': ['tan', 'beige', 'khaki', 'coffee', 'chocolate'],
      'gray': ['grey', 'silver', 'slate'],
      'pink': ['rose', 'coral', 'salmon', 'blush'],
      'purple': ['violet', 'lavender', 'plum', 'magenta']
    };

    const norm1 = color1.toLowerCase();
    const norm2 = color2.toLowerCase();

    // Check if colors are variations of each other
    for (const [baseColor, variations] of Object.entries(colorVariations)) {
      const allColors = [baseColor, ...variations];
      if (allColors.includes(norm1) && allColors.includes(norm2)) {
        return 0.8;
      }
    }

    return calculateTextSimilarity(color1, color2);
  };

  const getDetailedMatchReasons = (wardrobeItem: WardrobeItem, merchantItem: MerchantItem): string[] => {
    const reasons = [];

    if (merchantItem.category.toLowerCase() === wardrobeItem.category.toLowerCase()) {
      reasons.push('Same category');
    }

    if (wardrobeItem.name && merchantItem.name) {
      const nameSimilarity = calculateTextSimilarity(wardrobeItem.name, merchantItem.name);
      if (nameSimilarity > 0.8) {
        reasons.push('Very similar name');
      } else if (nameSimilarity > 0.6) {
        reasons.push('Similar name');
      }
    }

    if (wardrobeItem.brand && merchantItem.brand &&
        wardrobeItem.brand.toLowerCase() === merchantItem.brand.toLowerCase()) {
      reasons.push('Same brand');
    }

    if (wardrobeItem.color && merchantItem.color) {
      if (wardrobeItem.color.toLowerCase() === merchantItem.color.toLowerCase()) {
        reasons.push('Same color');
      } else if (calculateColorSimilarity(wardrobeItem.color, merchantItem.color) > 0.7) {
        reasons.push('Similar color');
      }
    }

    if (wardrobeItem.material && merchantItem.material &&
        wardrobeItem.material.toLowerCase() === merchantItem.material.toLowerCase()) {
      reasons.push('Same material');
    }

    if (wardrobeItem.size && merchantItem.size) {
      if (Array.isArray(merchantItem.size) && merchantItem.size.includes(wardrobeItem.size)) {
        reasons.push('Size available');
      } else if (typeof merchantItem.size === 'string' && merchantItem.size === wardrobeItem.size) {
        reasons.push('Same size');
      }
    }

    // Add benefit reasons
    if (merchantItem.photos && Array.isArray(merchantItem.photos) && merchantItem.photos.length > 0) {
      reasons.push('High-quality photos available');
    }

    if (merchantItem.description && merchantItem.description.length > 50) {
      reasons.push('Detailed product information');
    }

    return reasons;
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