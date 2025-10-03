import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useWardrobeComponents, WardrobeComponent } from "@/hooks/useWardrobeComponents";
import { Box, Layers, Minus, ShoppingBag, Grid3x3, Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface WardrobeComponentBuilderProps {
  wardrobeId: string;
  wardrobeName: string;
  wardrobeDimensions: { width: number; height: number; depth: number };
}

const COMPONENT_TYPES = [
  { value: 'shelf', label: 'Shelf', icon: Layers, description: 'Horizontal storage shelf' },
  { value: 'drawer', label: 'Drawer', icon: Box, description: 'Pull-out drawer' },
  { value: 'hanging_rod', label: 'Hanging Rod', icon: Minus, description: 'Rod for hanging clothes' },
  { value: 'shoe_rack', label: 'Shoe Rack', icon: ShoppingBag, description: 'Storage for shoes' },
  { value: 'accessory_drawer', label: 'Accessory Drawer', icon: Grid3x3, description: 'Small compartments for accessories' },
  { value: 'other', label: 'Other', icon: Box, description: 'Custom storage component' }
];

export const WardrobeComponentBuilder = ({ wardrobeId, wardrobeName, wardrobeDimensions }: WardrobeComponentBuilderProps) => {
  const { components, loading, addComponent, updateComponent, deleteComponent } = useWardrobeComponents(wardrobeId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingComponent, setEditingComponent] = useState<WardrobeComponent | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    component_type: 'shelf' as string,
    name: '',
    dimensions: { width: 0, height: 0, depth: 0 },
    position: { x: 0, y: 0, z: 0 },
    capacity: 10,
    color: '#e5e7eb',
    notes: ''
  });

  const resetForm = () => {
    setFormData({
      component_type: 'shelf',
      name: '',
      dimensions: { width: 0, height: 0, depth: 0 },
      position: { x: 0, y: 0, z: 0 },
      capacity: 10,
      color: '#e5e7eb',
      notes: ''
    });
    setEditingComponent(null);
  };

  const handleOpenDialog = (component?: WardrobeComponent) => {
    if (component) {
      setEditingComponent(component);
      setFormData({
        component_type: component.component_type,
        name: component.name,
        dimensions: component.dimensions,
        position: component.position,
        capacity: component.capacity,
        color: component.color || '#e5e7eb',
        notes: component.notes || ''
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || formData.dimensions.width <= 0) return;

    setSaving(true);
    try {
      const { data: { user } } = await import("@/integrations/supabase/client").then(m => m.supabase.auth.getUser());
      if (!user) throw new Error("User not authenticated");

      if (editingComponent) {
        await updateComponent(editingComponent.id, formData);
      } else {
        await addComponent({
          wardrobe_id: wardrobeId,
          user_id: user.id,
          ...formData
        });
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving component:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this component?")) {
      await deleteComponent(id);
    }
  };

  const getComponentIcon = (type: string) => {
    const componentType = COMPONENT_TYPES.find(t => t.value === type);
    return componentType ? componentType.icon : Box;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{wardrobeName} - Components</h3>
          <p className="text-sm text-muted-foreground">
            Wardrobe Size: {wardrobeDimensions.width} × {wardrobeDimensions.height} × {wardrobeDimensions.depth} cm
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Component
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : components.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Box className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No components yet</h3>
              <p className="text-muted-foreground mb-4">Start building your wardrobe by adding shelves, drawers, and more</p>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Component
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {components.map((component) => {
            const Icon = getComponentIcon(component.component_type);
            const fillPercentage = (component.current_items / component.capacity) * 100;

            return (
              <Card key={component.id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base">{component.name}</CardTitle>
                        <CardDescription className="capitalize">{component.component_type.replace('_', ' ')}</CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(component)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(component.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">W:</span> {component.dimensions.width}cm
                    </div>
                    <div>
                      <span className="text-muted-foreground">H:</span> {component.dimensions.height}cm
                    </div>
                    <div>
                      <span className="text-muted-foreground">D:</span> {component.dimensions.depth}cm
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Capacity</span>
                      <span>{component.current_items} / {component.capacity}</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(fillPercentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  {component.notes && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{component.notes}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open) resetForm();
        setIsDialogOpen(open);
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{editingComponent ? 'Edit Component' : 'Add Component'}</DialogTitle>
            <DialogDescription>
              Configure the component's properties and dimensions
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Component Type *</Label>
                <Select
                  value={formData.component_type}
                  onValueChange={(value: string) =>
                    setFormData({ ...formData, component_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPONENT_TYPES.map((type) => {
                      const Icon = type.icon;
                      return (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <span>{type.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Component Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Top Shelf, Sock Drawer"
                />
              </div>

              <div className="space-y-2">
                <Label>Dimensions (cm) *</Label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label htmlFor="width" className="text-xs text-muted-foreground">Width</Label>
                    <Input
                      id="width"
                      type="number"
                      value={formData.dimensions.width || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        dimensions: { ...formData.dimensions, width: parseFloat(e.target.value) || 0 }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="height" className="text-xs text-muted-foreground">Height</Label>
                    <Input
                      id="height"
                      type="number"
                      value={formData.dimensions.height || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        dimensions: { ...formData.dimensions, height: parseFloat(e.target.value) || 0 }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="depth" className="text-xs text-muted-foreground">Depth</Label>
                    <Input
                      id="depth"
                      type="number"
                      value={formData.dimensions.depth || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        dimensions: { ...formData.dimensions, depth: parseFloat(e.target.value) || 0 }
                      })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Position in Wardrobe (cm)</Label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label htmlFor="pos-x" className="text-xs text-muted-foreground">X (Left)</Label>
                    <Input
                      id="pos-x"
                      type="number"
                      value={formData.position.x || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        position: { ...formData.position, x: parseFloat(e.target.value) || 0 }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pos-y" className="text-xs text-muted-foreground">Y (Bottom)</Label>
                    <Input
                      id="pos-y"
                      type="number"
                      value={formData.position.y || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        position: { ...formData.position, y: parseFloat(e.target.value) || 0 }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pos-z" className="text-xs text-muted-foreground">Z (Front)</Label>
                    <Input
                      id="pos-z"
                      type="number"
                      value={formData.position.z || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        position: { ...formData.position, z: parseFloat(e.target.value) || 0 }
                      })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Item Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity || ''}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 10 })}
                  placeholder="10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="#e5e7eb"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional details..."
                  rows={3}
                />
              </div>
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saving || !formData.name || formData.dimensions.width <= 0}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                editingComponent ? 'Update Component' : 'Add Component'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};