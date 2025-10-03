/**
 * Browser-Based Machine Learning Service
 * Uses Hugging Face Transformers for client-side ML
 */

import { pipeline, env } from '@huggingface/transformers';

// Configure transformers to use local models
env.allowLocalModels = true;
env.allowRemoteModels = true;

class BrowserMLService {
  private static instance: BrowserMLService;
  private initialized = false;
  private models: Map<string, any> = new Map();
  private initPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): BrowserMLService {
    if (!BrowserMLService.instance) {
      BrowserMLService.instance = new BrowserMLService();
    }
    return BrowserMLService.instance;
  }

  /**
   * Initialize ML models
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = this.loadModels();
    await this.initPromise;
    this.initialized = true;
  }

  private async loadModels(): Promise<void> {
    try {
      console.log('Loading ML models...');
      
      // Load feature extraction model for embeddings
      const embedder = await pipeline(
        'feature-extraction',
        'Xenova/all-MiniLM-L6-v2',
        { device: 'webgpu', dtype: 'fp32' }
      );
      this.models.set('embedder', embedder);

      // Load zero-shot classification for style analysis
      const classifier = await pipeline(
        'zero-shot-classification',
        'Xenova/mobilebert-uncased-mnli',
        { device: 'webgpu', dtype: 'fp32' }
      );
      this.models.set('classifier', classifier);

      console.log('ML models loaded successfully');
    } catch (error) {
      console.warn('Failed to load some ML models:', error);
      // Fallback to CPU if WebGPU fails
      try {
        const embedder = await pipeline(
          'feature-extraction',
          'Xenova/all-MiniLM-L6-v2'
        );
        this.models.set('embedder', embedder);
      } catch (fallbackError) {
        console.error('Failed to load models even with fallback:', fallbackError);
      }
    }
  }

  /**
   * Generate embeddings for text or items
   */
  async generateEmbedding(text: string): Promise<number[] | null> {
    try {
      await this.initialize();
      const embedder = this.models.get('embedder');
      if (!embedder) return null;

      const output = await embedder(text, {
        pooling: 'mean',
        normalize: true
      });

      return Array.from(output.data);
    } catch (error) {
      console.error('Embedding generation error:', error);
      return null;
    }
  }

  /**
   * Calculate similarity between two items
   */
  async calculateSimilarity(item1: string, item2: string): Promise<number> {
    try {
      const emb1 = await this.generateEmbedding(item1);
      const emb2 = await this.generateEmbedding(item2);

      if (!emb1 || !emb2) return 0;

      // Cosine similarity
      const dotProduct = emb1.reduce((sum, val, i) => sum + val * emb2[i], 0);
      const mag1 = Math.sqrt(emb1.reduce((sum, val) => sum + val * val, 0));
      const mag2 = Math.sqrt(emb2.reduce((sum, val) => sum + val * val, 0));

      return dotProduct / (mag1 * mag2);
    } catch (error) {
      console.error('Similarity calculation error:', error);
      return 0;
    }
  }

  /**
   * Classify style using zero-shot classification
   */
  async classifyStyle(description: string): Promise<{
    style: string;
    confidence: number;
    alternatives: Array<{ label: string; score: number }>;
  } | null> {
    try {
      await this.initialize();
      const classifier = this.models.get('classifier');
      if (!classifier) return null;

      const styles = [
        'minimalist',
        'bohemian',
        'classic',
        'edgy',
        'romantic',
        'sporty',
        'trendy',
        'casual',
        'formal',
        'streetwear'
      ];

      const result = await classifier(description, styles, {
        multi_label: false
      });

      return {
        style: result.labels[0],
        confidence: result.scores[0],
        alternatives: result.labels.slice(1, 4).map((label: string, i: number) => ({
          label,
          score: result.scores[i + 1]
        }))
      };
    } catch (error) {
      console.error('Style classification error:', error);
      return null;
    }
  }

  /**
   * Analyze outfit compatibility using ML
   */
  async analyzeOutfitCompatibility(items: Array<{
    name: string;
    category: string;
    color: string;
    style?: string;
  }>): Promise<{
    score: number;
    issues: string[];
    suggestions: string[];
  }> {
    try {
      await this.initialize();

      const itemDescriptions = items.map(
        item => `${item.name} - ${item.category} - ${item.color} - ${item.style || 'casual'}`
      );

      // Calculate pairwise similarities
      const similarities: number[] = [];
      for (let i = 0; i < itemDescriptions.length; i++) {
        for (let j = i + 1; j < itemDescriptions.length; j++) {
          const sim = await this.calculateSimilarity(
            itemDescriptions[i],
            itemDescriptions[j]
          );
          similarities.push(sim);
        }
      }

      const avgSimilarity =
        similarities.reduce((a, b) => a + b, 0) / Math.max(similarities.length, 1);
      const score = Math.round(avgSimilarity * 100);

      const issues: string[] = [];
      const suggestions: string[] = [];

      if (score < 60) {
        issues.push('Items may not coordinate well together');
        suggestions.push('Consider choosing items with similar style profiles');
      }

      if (score > 90) {
        suggestions.push('Great coordination! These items work well together');
      }

      return { score, issues, suggestions };
    } catch (error) {
      console.error('Outfit analysis error:', error);
      return {
        score: 50,
        issues: ['Analysis unavailable'],
        suggestions: []
      };
    }
  }

  /**
   * Find similar items in wardrobe
   */
  async findSimilarItems(
    targetItem: string,
    wardrobeItems: Array<{ name: string; category: string }>
  ): Promise<Array<{ item: any; similarity: number }>> {
    try {
      await this.initialize();

      const results = await Promise.all(
        wardrobeItems.map(async item => {
          const similarity = await this.calculateSimilarity(
            targetItem,
            `${item.name} ${item.category}`
          );
          return { item, similarity };
        })
      );

      return results
        .filter(r => r.similarity > 0.3)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 5);
    } catch (error) {
      console.error('Similar items search error:', error);
      return [];
    }
  }

  /**
   * Predict outfit rating based on context
   */
  async predictOutfitRating(outfit: {
    items: any[];
    occasion: string;
    weather: string;
  }): Promise<{
    rating: number;
    factors: Array<{ name: string; impact: number }>;
  }> {
    try {
      await this.initialize();

      const outfitDescription = `${outfit.items.map(i => i.name).join(', ')} for ${outfit.occasion} in ${outfit.weather} weather`;

      // Use classifier to predict appropriateness
      const classifier = this.models.get('classifier');
      if (!classifier) {
        return {
          rating: 70,
          factors: []
        };
      }

      const appropriatenessLabels = [
        'highly appropriate',
        'appropriate',
        'somewhat appropriate',
        'inappropriate'
      ];

      const result = await classifier(outfitDescription, appropriatenessLabels);

      const rating =
        result.labels[0] === 'highly appropriate'
          ? 95
          : result.labels[0] === 'appropriate'
          ? 80
          : result.labels[0] === 'somewhat appropriate'
          ? 60
          : 40;

      return {
        rating,
        factors: [
          {
            name: 'Context Appropriateness',
            impact: result.scores[0] * 100
          }
        ]
      };
    } catch (error) {
      console.error('Rating prediction error:', error);
      return {
        rating: 70,
        factors: []
      };
    }
  }

  /**
   * Get model status
   */
  getStatus(): {
    initialized: boolean;
    modelsLoaded: string[];
    available: boolean;
  } {
    return {
      initialized: this.initialized,
      modelsLoaded: Array.from(this.models.keys()),
      available: this.models.size > 0
    };
  }

  /**
   * Clear loaded models from memory
   */
  async cleanup(): Promise<void> {
    this.models.clear();
    this.initialized = false;
    this.initPromise = null;
  }
}

export const browserML = BrowserMLService.getInstance();
export default browserML;
