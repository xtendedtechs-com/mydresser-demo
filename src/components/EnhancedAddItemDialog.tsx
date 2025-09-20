import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Upload, Wand2, X, CheckCircle, Plus, Minus } from 'lucide-react';
import { SmartImageUpload } from './SmartImageUpload';
import { aiCategorization } from '@/services/aiCategorization';
import { useWardrobe } from '@/hooks/useWardrobe';
import { toast } from 'sonner';

interface EnhancedAddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ItemFormData {
  name: string;
  category: string;
  brand: string;
  color: string;
  size: string;
  material: string;
  season: string;
  occasion: string;
  condition: string;
  purchase_price: string;
  description: string;
  tags: string[];
  photos: any;
}

const initialFormData: ItemFormData = {
  name: '',
  category: 'tops',
  brand: '',
  color: '',
  size: '',
  material: '',
  season: 'all-season',
  occasion: 'casual',
  condition: 'excellent',
  purchase_price: '',
  description: '',
  tags: [],
  photos: null
};

export const EnhancedAddItemDialog = ({ open, onOpenChange }: EnhancedAddItemDialogProps) => {
  const [formData, setFormData] = useState<ItemFormData>(initialFormData);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const [customTag, setCustomTag] = useState('');
  const { addItem } = useWardrobe();

  const categories = [
    { value: 'tops', label: 'Tops' },
    { value: 'bottoms', label: 'Bottoms' },
    { value: 'dresses', label: 'Dresses' },
    { value: 'outerwear', label: 'Outerwear' },
    { value: 'shoes', label: 'Shoes' },
    { value: 'accessories', label: 'Accessories' },
    { value: 'underwear', label: 'Underwear' }
  ];

  const seasons = [
    { value: 'spring', label: 'Spring' },
    { value: 'summer', label: 'Summer' },
    { value: 'fall', label: 'Fall' },
    { value: 'winter', label: 'Winter' },
    { value: 'all-season', label: 'All Season' }
  ];

  const occasions = [
    { value: 'casual', label: 'Casual' },
    { value: 'work', label: 'Work/Business' },
    { value: 'formal', label: 'Formal' },
    { value: 'party', label: 'Party/Event' },
    { value: 'sport', label: 'Activewear' },
    { value: 'sleep', label: 'Sleepwear' }
  ];

  const conditions = [
    { value: 'excellent', label: 'Excellent' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' }
  ];

  const handleImageUpload = (file: File, analysis: any) => {
    setFormData(prev => ({
      ...prev,
      name: analysis.suggestedName || prev.name,
      category: analysis.category || prev.category,
      color: analysis.color || prev.color,
      material: analysis.material || prev.material,
      season: analysis.season || prev.season,
      occasion: analysis.occasion || prev.occasion,
      tags: [...new Set([...prev.tags, ...analysis.tags])],
      description: analysis.description || prev.description,
      photos: file
    }));
    setActiveTab('details');
    toast.success('Item details auto-filled from image analysis!');
  };

  const generateAISuggestions = async () => {
    if (!formData.name && !formData.description) {
      toast.error('Please provide at least a name or description for AI analysis');
      return;
    }

    setIsAnalyzing(true);
    try {
      const analysis = aiCategorization.analyzeItem(
        formData.name,
        formData.description
      );
      setAiSuggestions(analysis);
      setActiveTab('ai-suggestions');
      toast.success('AI analysis complete!');
    } catch (error) {
      toast.error('Failed to generate AI suggestions');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyAISuggestions = () => {
    if (!aiSuggestions) return;

    setFormData(prev => ({
      ...prev,
      category: aiSuggestions.category || prev.category,
      color: aiSuggestions.color || prev.color,
      material: aiSuggestions.material || prev.material,
      season: aiSuggestions.season || prev.season,
      occasion: aiSuggestions.occasion || prev.occasion,
      tags: [...new Set([...prev.tags, ...aiSuggestions.tags])],
      description: aiSuggestions.description || prev.description,
      name: aiSuggestions.suggestedName || prev.name
    }));
    setActiveTab('details');
    toast.success('AI suggestions applied!');
  };

  const addTag = () => {
    if (customTag.trim() && !formData.tags.includes(customTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, customTag.trim()]
      }));
      setCustomTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.category) {
      toast.error('Please provide at least a name and category');
      return;
    }

    try {
      const itemData = {
        ...formData,
        purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : null,
        photos: formData.photos ? { main: URL.createObjectURL(formData.photos) } : null,
        wear_count: 0,
        is_favorite: false
      };

      await addItem(itemData as any);
      toast.success('Item added to your wardrobe!');
      
      // Reset form and close dialog
      setFormData(initialFormData);
      setAiSuggestions(null);
      setActiveTab('upload');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to add item to wardrobe');
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setAiSuggestions(null);
    setActiveTab('upload');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Add New Item to Wardrobe
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">
              <Upload className="w-4 h-4 mr-2" />
              Upload & Analyze
            </TabsTrigger>
            <TabsTrigger value="details">
              Details & Info
            </TabsTrigger>
            <TabsTrigger value="ai-suggestions" disabled={!aiSuggestions}>
              <Wand2 className="w-4 h-4 mr-2" />
              AI Suggestions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <SmartImageUpload onUpload={handleImageUpload} />
            
            <div className="text-center">
              <p className="text-muted-foreground mb-4">Or enter details manually</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quick-name">Item Name</Label>
                  <Input
                    id="quick-name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Blue Cotton T-Shirt"
                  />
                </div>
                <div>
                  <Label htmlFor="quick-description">Description (Optional)</Label>
                  <Input
                    id="quick-description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description..."
                  />
                </div>
              </div>
              <Button 
                onClick={generateAISuggestions} 
                disabled={isAnalyzing}
                className="mt-4"
              >
                {isAnalyzing ? (
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Wand2 className="w-4 h-4 mr-2" />
                )}
                {isAnalyzing ? 'Analyzing...' : 'Generate AI Suggestions'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Item Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter item name"
                />
              </div>
              
              <div>
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                  placeholder="Brand name"
                />
              </div>
              
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  placeholder="Primary color"
                />
              </div>
              
              <div>
                <Label htmlFor="size">Size</Label>
                <Input
                  id="size"
                  value={formData.size}
                  onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
                  placeholder="S, M, L, XL, etc."
                />
              </div>
              
              <div>
                <Label htmlFor="material">Material</Label>
                <Input
                  id="material"
                  value={formData.material}
                  onChange={(e) => setFormData(prev => ({ ...prev, material: e.target.value }))}
                  placeholder="Cotton, Silk, Wool, etc."
                />
              </div>
              
              <div>
                <Label htmlFor="season">Season</Label>
                <Select 
                  value={formData.season} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, season: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {seasons.map(season => (
                      <SelectItem key={season.value} value={season.value}>
                        {season.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="occasion">Occasion</Label>
                <Select 
                  value={formData.occasion} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, occasion: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {occasions.map(occasion => (
                      <SelectItem key={occasion.value} value={occasion.value}>
                        {occasion.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="condition">Condition</Label>
                <Select 
                  value={formData.condition} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, condition: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {conditions.map(condition => (
                      <SelectItem key={condition.value} value={condition.value}>
                        {condition.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="price">Purchase Price</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.purchase_price}
                  onChange={(e) => setFormData(prev => ({ ...prev, purchase_price: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Additional details about the item..."
                className="min-h-[80px]"
              />
            </div>

            {/* Tags Section */}
            <div>
              <Label>Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  placeholder="Add a tag..."
                  onKeyDown={(e) => e.key === 'Enter' && addTag()}
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                    <button 
                      onClick={() => removeTag(tag)}
                      className="ml-2 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ai-suggestions" className="space-y-4">
            {aiSuggestions && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    AI Analysis Results
                    <Badge variant="secondary" className="ml-auto">
                      {aiSuggestions.confidence}% confidence
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Suggested Name:</span>
                      <p className="font-medium">{aiSuggestions.suggestedName}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Category:</span>
                      <p className="font-medium capitalize">{aiSuggestions.category}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Color:</span>
                      <p className="font-medium capitalize">{aiSuggestions.color}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Material:</span>
                      <p className="font-medium">{aiSuggestions.material}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Season:</span>
                      <p className="font-medium capitalize">{aiSuggestions.season}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Occasion:</span>
                      <p className="font-medium capitalize">{aiSuggestions.occasion}</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-muted-foreground text-sm">Suggested Tags:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {aiSuggestions.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-muted-foreground text-sm">Description:</span>
                    <p className="text-sm mt-1">{aiSuggestions.description}</p>
                  </div>

                  <Button onClick={applyAISuggestions} className="w-full">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Apply AI Suggestions
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="flex-1">
            <Plus className="w-4 h-4 mr-2" />
            Add to Wardrobe
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};