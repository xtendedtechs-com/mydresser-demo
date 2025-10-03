import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useWardrobe } from "@/hooks/useWardrobe";
import { Loader2, Home, Shirt, Box, Snowflake } from "lucide-react";

interface CreateWardrobeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface WardrobePreset {
  type: string;
  name: string;
  description: string;
  icon: any;
  defaultDimensions: {
    width: number;
    height: number;
    depth: number;
  };
}

const WARDROBE_PRESETS: WardrobePreset[] = [
  {
    type: "walk-in-closet",
    name: "Walk-in Closet",
    description: "Large wardrobe space with multiple sections",
    icon: Home,
    defaultDimensions: { width: 300, height: 240, depth: 200 }
  },
  {
    type: "bedroom-wardrobe",
    name: "Bedroom Wardrobe",
    description: "Standard bedroom closet or armoire",
    icon: Shirt,
    defaultDimensions: { width: 180, height: 200, depth: 60 }
  },
  {
    type: "seasonal-storage",
    name: "Seasonal Storage",
    description: "Storage for off-season clothing",
    icon: Snowflake,
    defaultDimensions: { width: 120, height: 180, depth: 50 }
  },
  {
    type: "specialty-storage",
    name: "Specialty Storage",
    description: "Custom storage for specific items",
    icon: Box,
    defaultDimensions: { width: 100, height: 150, depth: 40 }
  }
];

export const CreateWardrobeDialog = ({ open, onOpenChange }: CreateWardrobeDialogProps) => {
  const { createWardrobe } = useWardrobe();
  const [loading, setLoading] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<WardrobePreset | null>(null);
  const [step, setStep] = useState<"preset" | "details">("preset");
  
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    location: "",
    notes: "",
    dimensions: {
      width: 0,
      height: 0,
      depth: 0,
      unit: "cm"
    }
  });

  const handlePresetSelect = (preset: WardrobePreset) => {
    setSelectedPreset(preset);
    setFormData({
      name: preset.name,
      type: preset.type,
      location: "",
      notes: "",
      dimensions: {
        ...preset.defaultDimensions,
        unit: "cm"
      }
    });
    setStep("details");
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.type) return;

    setLoading(true);
    try {
      const { data: { user } } = await import("@/integrations/supabase/client").then(m => m.supabase.auth.getUser());
      if (!user) {
        throw new Error("User not authenticated");
      }

      await createWardrobe({
        user_id: user.id,
        name: formData.name,
        type: formData.type,
        location: formData.location || undefined,
        notes: formData.notes || undefined,
        dimensions: formData.dimensions
      });
      
      handleClose();
    } catch (error) {
      console.error("Error creating wardrobe:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep("preset");
    setSelectedPreset(null);
    setFormData({
      name: "",
      type: "",
      location: "",
      notes: "",
      dimensions: { width: 0, height: 0, depth: 0, unit: "cm" }
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === "preset" ? "Choose Wardrobe Type" : "Wardrobe Details"}
          </DialogTitle>
          <DialogDescription>
            {step === "preset" 
              ? "Select a preset to get started quickly, or customize your own"
              : "Customize your wardrobe settings"
            }
          </DialogDescription>
        </DialogHeader>

        {step === "preset" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {WARDROBE_PRESETS.map((preset) => {
              const Icon = preset.icon;
              return (
                <Card
                  key={preset.type}
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => handlePresetSelect(preset)}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{preset.name}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{preset.description}</CardDescription>
                    <p className="text-xs text-muted-foreground mt-2">
                      {preset.defaultDimensions.width} × {preset.defaultDimensions.height} × {preset.defaultDimensions.depth} cm
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Wardrobe Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="My Main Wardrobe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Bedroom, Guest Room, etc."
              />
            </div>

            <div className="space-y-2">
              <Label>Dimensions (cm)</Label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label htmlFor="width" className="text-xs text-muted-foreground">Width</Label>
                  <Input
                    id="width"
                    type="number"
                    value={formData.dimensions.width}
                    onChange={(e) => setFormData({
                      ...formData,
                      dimensions: { ...formData.dimensions, width: parseInt(e.target.value) || 0 }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="height" className="text-xs text-muted-foreground">Height</Label>
                  <Input
                    id="height"
                    type="number"
                    value={formData.dimensions.height}
                    onChange={(e) => setFormData({
                      ...formData,
                      dimensions: { ...formData.dimensions, height: parseInt(e.target.value) || 0 }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="depth" className="text-xs text-muted-foreground">Depth</Label>
                  <Input
                    id="depth"
                    type="number"
                    value={formData.dimensions.depth}
                    onChange={(e) => setFormData({
                      ...formData,
                      dimensions: { ...formData.dimensions, depth: parseInt(e.target.value) || 0 }
                    })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional details about this wardrobe..."
                rows={3}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          {step === "details" && (
            <Button
              variant="outline"
              onClick={() => setStep("preset")}
              disabled={loading}
            >
              Back
            </Button>
          )}
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          {step === "details" && (
            <Button onClick={handleSubmit} disabled={loading || !formData.name}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Wardrobe"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
