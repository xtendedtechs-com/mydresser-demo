import { pipeline } from '@huggingface/transformers';

export interface GarmentClassification {
  category: string;
  confidence: number;
  suggestions: Array<{ label: string; score: number }>;
}

class GarmentClassifier {
  private classifier: any = null;
  private initialized = false;

  async initialize() {
    if (this.initialized) return;
    
    try {
      // Using a fashion-focused image classification model
      this.classifier = await pipeline(
        'image-classification',
        'Xenova/vit-base-patch16-224',
        { device: 'webgpu' }
      );
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize garment classifier:', error);
      throw error;
    }
  }

  async classifyGarment(imageUrl: string): Promise<GarmentClassification> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const result = await this.classifier(imageUrl);
      
      // Map generic labels to our wardrobe categories
      const category = this.mapToWardrobeCategory(result[0].label);
      
      return {
        category,
        confidence: result[0].score,
        suggestions: result.slice(1, 4).map((r: any) => ({
          label: this.mapToWardrobeCategory(r.label),
          score: r.score
        }))
      };
    } catch (error) {
      console.error('Classification error:', error);
      throw new Error('Failed to classify garment');
    }
  }

  private mapToWardrobeCategory(label: string): string {
    const lowerLabel = label.toLowerCase();
    
    // Map AI labels to our wardrobe categories
    if (lowerLabel.includes('shirt') || lowerLabel.includes('blouse') || lowerLabel.includes('top')) {
      return 'tops';
    }
    if (lowerLabel.includes('pants') || lowerLabel.includes('jeans') || lowerLabel.includes('trousers')) {
      return 'bottoms';
    }
    if (lowerLabel.includes('dress') || lowerLabel.includes('gown')) {
      return 'dresses';
    }
    if (lowerLabel.includes('jacket') || lowerLabel.includes('coat') || lowerLabel.includes('blazer')) {
      return 'outerwear';
    }
    if (lowerLabel.includes('shoe') || lowerLabel.includes('sneaker') || lowerLabel.includes('boot')) {
      return 'shoes';
    }
    if (lowerLabel.includes('bag') || lowerLabel.includes('purse') || lowerLabel.includes('backpack')) {
      return 'accessories';
    }
    
    return 'other';
  }
}

export const garmentClassifier = new GarmentClassifier();
