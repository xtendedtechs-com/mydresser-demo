import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, Check, X, Eye, Star } from 'lucide-react';
import { useItemMatches } from '@/hooks/useItemMatches';
import { useMerchantItems } from '@/hooks/useMerchantItems';
import { WardrobeItem, useWardrobe } from '@/hooks/useWardrobe';
import ItemMatchDialog from './ItemMatchDialog';
import { useToast } from '@/hooks/use-toast';

interface SmartItemMatcherProps {
  wardrobeItems: WardrobeItem[];
  onMatchFound?: (wardrobeItem: WardrobeItem, matches: any[]) => void;
}

export const SmartItemMatcher: React.FC<SmartItemMatcherProps> = ({
  wardrobeItems,
  onMatchFound
}) => {
  const [suggestedMatches, setSuggestedMatches] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [showMatchDialog, setShowMatchDialog] = useState(false);
  
  const { findMatches, createMatch } = useItemMatches();
  const { items: merchantItems } = useMerchantItems();
  const { enhanceItemWithMerchantData } = useWardrobe();
  const { toast } = useToast();

  // Auto-scan for matches when items change
  useEffect(() => {
    if (wardrobeItems.length > 0 && merchantItems.length > 0) {
      scanForMatches();
    }
  }, [wardrobeItems, merchantItems]);

  const scanForMatches = async () => {
    if (isScanning) return;
    
    setIsScanning(true);
    const allMatches = [];

    try {
      for (const wardrobeItem of wardrobeItems) {
        const matches = await findMatches(wardrobeItem, merchantItems);
        if (matches.length > 0) {
          const bestMatch = matches[0];
          if (bestMatch.matchScore > 0.7) {
            allMatches.push({
              wardrobeItem,
              ...bestMatch,
              id: `${wardrobeItem.id}-${bestMatch.merchantItem.id}`
            });
          }
        }
      }

      setSuggestedMatches(allMatches.slice(0, 10)); // Limit to top 10
      
      if (allMatches.length > 0) {
        toast({
          title: "Smart matches found!",
          description: `Found ${allMatches.length} potential matches for your items`,
        });
        
        if (onMatchFound) {
          onMatchFound(allMatches[0].wardrobeItem, allMatches);
        }
      }
    } catch (error) {
      console.error('Error scanning for matches:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const handleViewMatch = (match: any) => {
    setSelectedMatch(match);
    setShowMatchDialog(true);
  };

  const handleAcceptMatch = async (match: any) => {
    try {
      await createMatch(
        match.wardrobeItem.id,
        match.merchantItem.id,
        match.matchScore,
        match.matchReasons
      );
      
      await enhanceItemWithMerchantData(match.wardrobeItem.id, match.merchantItem);
      
      // Remove from suggested matches
      setSuggestedMatches(prev => prev.filter(m => m.id !== match.id));
      
      toast({
        title: "Match accepted!",
        description: "Your item has been enhanced with accurate merchant details",
      });
    } catch (error) {
      toast({
        title: "Error accepting match",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleDismissMatch = (match: any) => {
    setSuggestedMatches(prev => prev.filter(m => m.id !== match.id));
    toast({
      title: "Match dismissed",
      description: "This suggestion won't appear again",
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.9) return 'bg-emerald-500';
    if (score >= 0.8) return 'bg-green-500';
    if (score >= 0.7) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 0.9) return 'default';
    if (score >= 0.8) return 'secondary';
    return 'outline';
  };

  if (suggestedMatches.length === 0 && !isScanning) {
    return null;
  }

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Smart Item Matching
            {isScanning && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isScanning ? (
            <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertDescription>
                Scanning your wardrobe for similar merchant items...
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                We found {suggestedMatches.length} items in your wardrobe that match merchant products. 
                You can enhance your items with professional photos, detailed descriptions, and care instructions.
              </p>
              
              <div className="grid gap-4">
                {suggestedMatches.map((match) => (
                  <div key={match.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium">{match.wardrobeItem.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Matches: {match.merchantItem.name} by {match.merchantItem.brand}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge 
                            variant={getScoreBadgeVariant(match.matchScore)}
                            className={`${getScoreColor(match.matchScore)} text-white`}
                          >
                            {Math.round(match.matchScore * 100)}% match
                          </Badge>
                          {match.merchantItem.is_featured && (
                            <Badge variant="secondary">
                              <Star className="w-3 h-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewMatch(match)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleAcceptMatch(match)}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDismissMatch(match)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {match.matchReasons.slice(0, 3).map((reason: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {reason}
                        </Badge>
                      ))}
                      {match.matchReasons.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{match.matchReasons.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <Button 
                onClick={scanForMatches} 
                variant="outline" 
                className="w-full"
                disabled={isScanning}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Scan Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedMatch && (
        <ItemMatchDialog
          isOpen={showMatchDialog}
          onClose={() => setShowMatchDialog(false)}
          wardrobeItem={selectedMatch.wardrobeItem}
          merchantItem={selectedMatch.merchantItem}
          matchScore={selectedMatch.matchScore}
          matchReasons={selectedMatch.matchReasons}
          onAccept={() => {
            handleAcceptMatch(selectedMatch);
            setShowMatchDialog(false);
          }}
          onReject={() => {
            handleDismissMatch(selectedMatch);
            setShowMatchDialog(false);
          }}
        />
      )}
    </>
  );
};