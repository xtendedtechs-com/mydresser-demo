// AI-based VTO fallback when MediaPipe fails
import { SizeRecommendation } from './sizeRecommendation';
import { BodyShape } from './bodyShapeAnalysis';

interface ClothingItem {
  id: string;
  name: string;
  category: string;
  photo: string;
}

export interface AIVTOConfig {
  userImage: string;
  clothingItems: ClothingItem[];
}

export interface AIVTOResult {
  imageUrl: string;
  sizeRecommendations: SizeRecommendation[];
  bodyShape: BodyShape;
  processingTime: number;
}

export class AIVTOEngine {
  async generateVTO(config: AIVTOConfig): Promise<AIVTOResult> {
    const startTime = performance.now();
    
    try {
      // Create a simple canvas-based overlay
      const userImg = await this.loadImage(config.userImage);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) throw new Error('Cannot create canvas');
      
      canvas.width = Math.min(userImg.width, 800);
      canvas.height = Math.min(userImg.height, 1200);
      
      // Draw user image
      ctx.drawImage(userImg, 0, 0, canvas.width, canvas.height);
      
      // Load clothing images (tolerate per-image failures)
      const imageResults = await Promise.allSettled(
        config.clothingItems.map(item => this.loadImage(item.photo))
      );

      // If none of the clothing images could be loaded, bail so caller can try another fallback
      const anyLoaded = imageResults.some(r => r.status === 'fulfilled');
      if (!anyLoaded) {
        throw new Error('No clothing images could be loaded for AI VTO');
      }
      
      // Simple overlay positioning based on image dimensions; skip failed images
      for (let i = 0; i < config.clothingItems.length; i++) {
        const item = config.clothingItems[i];
        const res = imageResults[i];
        if (res.status !== 'fulfilled') {
          console.warn('Skipping clothing image due to load failure:', item);
          continue;
        }
        const itemImg = res.value;
        
        await this.simpleOverlay(
          ctx,
          itemImg,
          item.category,
          canvas.width,
          canvas.height
        );
      }
      
      // Generate simple size recommendations
      const sizeRecommendations: SizeRecommendation[] = config.clothingItems.map(item => ({
        category: item.category,
        size: 'M',
        confidence: 0.7,
        measurements: {
          shoulderWidth: 18,
          chestWidth: 20,
          waistWidth: 16,
          hipWidth: 20,
          torsoLength: 28,
          legLength: 32,
          armLength: 24
        }
      }));
      
      // Simple body shape estimation
      const bodyShape: BodyShape = {
        type: 'rectangle',
        shoulderWidth: canvas.width * 0.3,
        waistWidth: canvas.width * 0.25,
        hipWidth: canvas.width * 0.3,
        torsoLength: canvas.height * 0.4,
        legLength: canvas.height * 0.5,
        bustToWaistRatio: 1.2,
        waistToHipRatio: 0.83
      };
      
      return {
        imageUrl: canvas.toDataURL('image/jpeg', 0.85),
        sizeRecommendations,
        bodyShape,
        processingTime: performance.now() - startTime
      };
    } catch (error) {
      console.error('AI VTO error:', error);
      throw error;
    }
  }
  
  private async simpleOverlay(
    ctx: CanvasRenderingContext2D,
    clothingImg: HTMLImageElement,
    category: string,
    canvasWidth: number,
    canvasHeight: number
  ): Promise<void> {
    // Simple positioning based on category
    let x = 0, y = 0, width = 0, height = 0;
    
    switch (category.toLowerCase()) {
      case 'tops':
      case 'outerwear':
      case 'shirt':
      case 'blouse':
        x = canvasWidth * 0.25;
        y = canvasHeight * 0.15;
        width = canvasWidth * 0.5;
        height = canvasHeight * 0.35;
        break;
        
      case 'bottoms':
      case 'pants':
      case 'skirt':
        x = canvasWidth * 0.3;
        y = canvasHeight * 0.45;
        width = canvasWidth * 0.4;
        height = canvasHeight * 0.45;
        break;
        
      case 'shoes':
        x = canvasWidth * 0.35;
        y = canvasHeight * 0.85;
        width = canvasWidth * 0.3;
        height = canvasHeight * 0.12;
        break;
        
      default:
        x = canvasWidth * 0.25;
        y = canvasHeight * 0.2;
        width = canvasWidth * 0.5;
        height = canvasHeight * 0.4;
    }
    
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.globalCompositeOperation = 'multiply';
    
    try {
      ctx.drawImage(clothingImg, x, y, width, height);
    } catch (error) {
      console.error('Error drawing clothing:', error);
    }
    
    ctx.restore();
  }
  
  private async loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      // Only set crossOrigin for actual HTTP URLs, not blob or data URLs
      if (src.startsWith('http://') || src.startsWith('https://')) {
        img.crossOrigin = 'anonymous';
      }
      
      const timeout = setTimeout(() => {
        reject(new Error(`Image load timeout: ${src.substring(0, 100)}`));
      }, 30000);
      
      img.onload = () => {
        clearTimeout(timeout);
        console.log('Image loaded successfully:', src.substring(0, 50));
        resolve(img);
      };
      
      img.onerror = (e) => {
        clearTimeout(timeout);
        console.error('Image load error:', 'Failed to load image:', src.substring(0, 100));
        reject(new Error(`Failed to load image: ${src.substring(0, 100)}`));
      };
      
      img.src = src;
    });
  }
}

export const aiVTO = new AIVTOEngine();
