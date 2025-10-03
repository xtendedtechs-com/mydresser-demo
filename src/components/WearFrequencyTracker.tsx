import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface WearRecord {
  item_id: string;
  item_name: string;
  last_worn: string;
  wear_count: number;
  days_since_worn: number;
}

export const WearFrequencyTracker = () => {
  const [records, setRecords] = useState<WearRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadWearRecords();
  }, []);

  const loadWearRecords = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: items } = await supabase
        .from("wardrobe_items")
        .select("id, name, last_worn, wear_count")
        .eq("user_id", user.id)
        .order("last_worn", { ascending: false, nullsFirst: false });

      if (items) {
        const processedRecords = items
          .filter((item) => item.last_worn)
          .map((item) => ({
            item_id: item.id,
            item_name: item.name,
            last_worn: item.last_worn!,
            wear_count: item.wear_count || 0,
            days_since_worn: Math.floor(
              (Date.now() - new Date(item.last_worn!).getTime()) /
                (1000 * 60 * 60 * 24)
            ),
          }));

        setRecords(processedRecords);
      }
    } catch (error) {
      console.error("Error loading wear records:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsWorn = async (itemId: string) => {
    try {
      const { data: item } = await supabase
        .from("wardrobe_items")
        .select("wear_count")
        .eq("id", itemId)
        .single();

      const { error } = await supabase
        .from("wardrobe_items")
        .update({
          last_worn: new Date().toISOString(),
          wear_count: (item?.wear_count || 0) + 1,
        })
        .eq("id", itemId);

      if (error) throw error;

      toast({
        title: "Wear recorded",
        description: "Item wear frequency updated",
      });

      await loadWearRecords();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update wear record",
        variant: "destructive",
      });
    }
  };

  const getWearFrequencyBadge = (daysSince: number) => {
    if (daysSince <= 7) return { label: "Recently worn", variant: "default" as const };
    if (daysSince <= 30) return { label: "Worn this month", variant: "secondary" as const };
    if (daysSince <= 90) return { label: "Needs rotation", variant: "outline" as const };
    return { label: "Rarely worn", variant: "destructive" as const };
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Wear Frequency</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Wear Frequency Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {records.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No wear records yet. Start tracking by marking items as worn!
          </p>
        ) : (
          <div className="space-y-3">
            {records.slice(0, 10).map((record) => {
              const badge = getWearFrequencyBadge(record.days_since_worn);
              return (
                <div
                  key={record.item_id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="font-medium truncate">{record.item_name}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {record.wear_count} wears
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDistanceToNow(new Date(record.last_worn), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <Badge variant={badge.variant} className="text-xs">
                      {badge.label}
                    </Badge>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => markAsWorn(record.item_id)}
                  >
                    Mark Worn
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {records.length > 0 && (
          <div className="pt-4 border-t">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{records.length}</p>
                <p className="text-xs text-muted-foreground">Tracked Items</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {Math.round(
                    records.reduce((sum, r) => sum + r.wear_count, 0) /
                      records.length
                  )}
                </p>
                <p className="text-xs text-muted-foreground">Avg. Wears</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
