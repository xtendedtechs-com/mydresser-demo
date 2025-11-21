import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useWardrobe, WardrobeItem } from '@/hooks/useWardrobe';
import { useToast } from '@/hooks/use-toast';
import { useFileUpload } from '@/hooks/useFileUpload';
import { getAllPhotoUrls } from '@/utils/photoHelpers';
import { supabase } from '@/integrations/supabase/client';
import RealImageUpload from './RealImageUpload';
import { X } from 'lucide-react';

interface EditWardrobeItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: WardrobeItem | null;
}

const categories = ['tops','bottoms','dresses','outerwear','shoes','accessories','underwear','activewear','formal'];
const seasons = ['spring','summer','fall','winter','all-season'];
const occasions = ['casual','work','formal','party','sport','travel'];
const conditions = ['excellent','good','fair','poor'];

const EditWardrobeItemDialog = ({ open, onOpenChange, item }: EditWardrobeItemDialogProps) => {
  const { updateItem, deleteItem } = useWardrobe();
  const { toast } = useToast();
  const { uploadWardrobePhotos } = useFileUpload();
  const [form, setForm] = useState({
    name: '',
    category: '',
    brand: '',
    color: '',
    size: '',
    material: '',
    season: 'all-season',
    occasion: 'casual',
    condition: 'excellent',
    purchase_price: '' as string | number | undefined,
    location_in_wardrobe: '',
    notes: '',
    tags: [] as string[]
  });
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    if (item) {
      setForm({
        name: item.name || '',
        category: item.category || '',
        brand: item.brand || '',
        color: item.color || '',
        size: item.size || '',
        material: item.material || '',
        season: item.season || 'all-season',
        occasion: item.occasion || 'casual',
        condition: item.condition || 'excellent',
        purchase_price: item.purchase_price ?? '',
        location_in_wardrobe: item.location_in_wardrobe || '',
        notes: item.notes || '',
        tags: item.tags || []
      });
      setExistingPhotos(getAllPhotoUrls(item.photos || {}));
      setPhotoFiles([]);
    }
  }, [item]);

  const handleChange = (key: keyof typeof form, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const onSave = async () => {
    if (!item) return;
    setSaving(true);
    try {
      // Upload new photos if any
      let newPhotoUrls: string[] = [];
      if (photoFiles.length > 0) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const uploadResults = await uploadWardrobePhotos(photoFiles, user.id, item.id);
          newPhotoUrls = uploadResults.filter(r => r.url).map(r => r.url!);
        }
      }

      // Merge existing and new photos
      const allPhotos = [...existingPhotos, ...newPhotoUrls];
      
      await updateItem(item.id, {
        name: form.name,
        category: form.category?.toLowerCase(),
        brand: form.brand || null as any,
        color: form.color || null as any,
        size: form.size || null as any,
        material: form.material || null as any,
        season: form.season?.toLowerCase() || null as any,
        occasion: form.occasion?.toLowerCase() || null as any,
        condition: form.condition?.toLowerCase(),
        purchase_price: form.purchase_price === '' ? null as any : Number(form.purchase_price),
        location_in_wardrobe: form.location_in_wardrobe || null as any,
        notes: form.notes || null as any,
        tags: form.tags,
        photos: allPhotos.length > 0 ? { urls: allPhotos } : item.photos
      });
      toast({ title: 'Item updated', description: 'Your changes were saved.' });
      onOpenChange(false);
    } catch (e: any) {
      toast({ title: 'Update failed', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const removeExistingPhoto = (photoUrl: string) => {
    setExistingPhotos(prev => prev.filter(p => p !== photoUrl));
  };

  const onDelete = async () => {
    if (!item) return;
    try {
      await deleteItem(item.id);
      toast({ title: 'Item deleted', description: `${item.name} was removed.` });
      onOpenChange(false);
    } catch (e: any) {
      toast({ title: 'Delete failed', description: e.message, variant: 'destructive' });
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-0 flex-shrink-0">
          <DialogTitle>Edit Item</DialogTitle>
        </DialogHeader>

        {!item ? (
          <div className="text-sm text-muted-foreground px-6 pb-6">Item not found.</div>
        ) : (
          <ScrollArea className="flex-1 px-6">
            <div className="space-y-4 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={form.name} onChange={e => handleChange('name', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={form.category} onValueChange={v => handleChange('category', v)}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="brand">Brand</Label>
                <Input id="brand" value={form.brand} onChange={e => handleChange('brand', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="color">Color</Label>
                <Input id="color" value={form.color} onChange={e => handleChange('color', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="size">Size</Label>
                <Input id="size" value={form.size} onChange={e => handleChange('size', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="material">Material</Label>
                <Input id="material" value={form.material} onChange={e => handleChange('material', e.target.value)} />
              </div>
              <div>
                <Label>Season</Label>
                <Select value={form.season} onValueChange={v => handleChange('season', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{seasons.map(s => (<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Occasion</Label>
                <Select value={form.occasion} onValueChange={v => handleChange('occasion', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{occasions.map(o => (<SelectItem key={o} value={o}>{o}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Condition</Label>
                <Select value={form.condition} onValueChange={v => handleChange('condition', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{conditions.map(c => (<SelectItem key={c} value={c}>{c}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="price">Purchase Price</Label>
                <Input id="price" type="number" step="0.01" value={form.purchase_price as any}
                  onChange={e => handleChange('purchase_price', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="location">Location in Wardrobe</Label>
                <Input id="location" value={form.location_in_wardrobe}
                  onChange={e => handleChange('location_in_wardrobe', e.target.value)} />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" rows={3} value={form.notes} onChange={e => handleChange('notes', e.target.value)} />
            </div>

            {/* Photo Management */}
            <div>
              <Label>Photos</Label>
              {existingPhotos.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm text-muted-foreground mb-2">Current photos:</p>
                  <div className="flex flex-wrap gap-2">
                    {existingPhotos.map((url, idx) => (
                      <div key={idx} className="relative w-24 h-24 rounded-md overflow-hidden border">
                        <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeExistingPhoto(url)}
                          className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <RealImageUpload
                onFilesSelected={setPhotoFiles}
                type="photo"
                maxFiles={5}
                existingFiles={photoFiles}
              />
            </div>

            <div className="flex gap-2 justify-between">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <div className="flex gap-2">
                {!confirmingDelete ? (
                  <Button variant="destructive" onClick={() => setConfirmingDelete(true)}>Delete</Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setConfirmingDelete(false)}>Keep</Button>
                    <Button variant="destructive" onClick={onDelete}>Confirm Delete</Button>
                  </div>
                )}
                <Button onClick={onSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
              </div>
            </div>
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditWardrobeItemDialog;
