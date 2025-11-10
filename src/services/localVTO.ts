import { poseDetectionService, PoseLandmark, LANDMARKS, PoseResults } from './poseDetection';
import { sizeRecommendation, SizeRecommendation } from './sizeRecommendation';
import { colorMatching, ColorAdjustment } from './colorMatching';

interface ClothingItem {
  id: string;
  name: string;
  category: string;
  photo: string;
}

export interface VTOConfig {
  userImage: string;
  clothingItems: ClothingItem[];
  manualAdjustments?: {
    [itemId: string]: {
      x: number;
      y: number;
      scale: number;
    };
  };
}

export interface VTOResult {
  imageUrl: string;
  sizeRecommendations: SizeRecommendation[];
  processingTime: number;
}

export class LocalVTOEngine {
  private poseCache = new Map<string, PoseResults>();
  private imageCache = new Map<string, HTMLImageElement>();

  async generateVTO(config: VTOConfig): Promise<VTOResult> {
    const startTime = performance.now();
    try {
      // Load user image with caching
      const userImg = await this.getCachedImage(config.userImage);
      
      // Detect pose with caching
      let poseResults = this.poseCache.get(config.userImage);
      if (!poseResults) {
        poseResults = await poseDetectionService.detectPose(userImg);
        if (!poseResults || !poseResults.landmarks) {
          throw new Error('Could not detect pose in image');
        }
        this.poseCache.set(config.userImage, poseResults);
      }

      // Analyze lighting
      const colorAdjustment = colorMatching.analyzeImageLighting(userImg);

      // Create canvas for composition
      const canvas = document.createElement('canvas');
      canvas.width = userImg.width;
      canvas.height = userImg.height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not create canvas context');
      }

      // Draw original image
      ctx.drawImage(userImg, 0, 0);

      // Load all clothing images in parallel
      const clothingImages = await Promise.all(
        config.clothingItems.map(item => this.getCachedImage(item.photo))
      );

      // Calculate size recommendations
      const sizeRecommendations: SizeRecommendation[] = [];
      const measurements = sizeRecommendation.calculateMeasurements(
        poseResults.landmarks,
        canvas.width,
        canvas.height
      );

      // Overlay clothing items
      for (let i = 0; i < config.clothingItems.length; i++) {
        const item = config.clothingItems[i];
        const itemImg = clothingImages[i];
        
        const manualAdj = config.manualAdjustments?.[item.id];
        await this.overlayClothing(
          ctx,
          itemImg,
          item.category,
          poseResults.landmarks,
          canvas.width,
          canvas.height,
          colorAdjustment,
          manualAdj
        );

        const sizeRec = sizeRecommendation.recommendSize(measurements, item.category);
        sizeRecommendations.push(sizeRec);
      }

      const processingTime = performance.now() - startTime;

      return {
        imageUrl: canvas.toDataURL('image/jpeg', 0.95),
        sizeRecommendations,
        processingTime
      };
    } catch (error) {
      console.error('VTO generation error:', error);
      throw error;
    }
  }

  private async overlayClothing(
    ctx: CanvasRenderingContext2D,
    clothingImg: HTMLImageElement,
    category: string,
    landmarks: PoseLandmark[],
    canvasWidth: number,
    canvasHeight: number,
    colorAdjustment: ColorAdjustment,
    manualAdjustment?: { x: number; y: number; scale: number }
  ): Promise<void> {
    const leftShoulder = landmarks[LANDMARKS.LEFT_SHOULDER];
    const rightShoulder = landmarks[LANDMARKS.RIGHT_SHOULDER];
    const leftHip = landmarks[LANDMARKS.LEFT_HIP];
    const rightHip = landmarks[LANDMARKS.RIGHT_HIP];
    const leftAnkle = landmarks[LANDMARKS.LEFT_ANKLE];
    const rightAnkle = landmarks[LANDMARKS.RIGHT_ANKLE];

    // Calculate body dimensions in pixels
    const shoulderWidth = Math.sqrt(
      Math.pow((rightShoulder.x - leftShoulder.x) * canvasWidth, 2) +
      Math.pow((rightShoulder.y - leftShoulder.y) * canvasHeight, 2)
    );

    const torsoHeight = Math.sqrt(
      Math.pow((leftHip.x - leftShoulder.x) * canvasWidth, 2) +
      Math.pow((leftHip.y - leftShoulder.y) * canvasHeight, 2)
    );

    // Position and scale based on category
    let x = 0, y = 0, width = 0, height = 0, opacity = 0.9;

    switch (category.toLowerCase()) {
      case 'tops':
      case 'outerwear':
        // Position at shoulders, cover torso
        x = (leftShoulder.x * canvasWidth) - (shoulderWidth * 0.1);
        y = (leftShoulder.y * canvasHeight) - (shoulderWidth * 0.15);
        width = shoulderWidth * 1.2;
        height = torsoHeight * 1.1;
        break;

      case 'bottoms':
        // Position at hips, cover legs
        const legHeight = Math.sqrt(
          Math.pow((leftAnkle.x - leftHip.x) * canvasWidth, 2) +
          Math.pow((leftAnkle.y - leftHip.y) * canvasHeight, 2)
        );
        x = (leftHip.x * canvasWidth) - (shoulderWidth * 0.15);
        y = leftHip.y * canvasHeight;
        width = shoulderWidth * 0.9;
        height = legHeight * 1.05;
        break;

      case 'shoes':
        // Position at ankles
        const footCenterX = ((leftAnkle.x + rightAnkle.x) / 2) * canvasWidth;
        const footCenterY = ((leftAnkle.y + rightAnkle.y) / 2) * canvasHeight;
        width = shoulderWidth * 0.4;
        height = width * 0.5;
        x = footCenterX - width / 2;
        y = footCenterY - height * 0.3;
        break;

      default:
        // Generic overlay at torso
        x = (leftShoulder.x * canvasWidth);
        y = (leftShoulder.y * canvasHeight);
        width = shoulderWidth;
        height = torsoHeight;
    }

    // Apply manual adjustments if provided
    if (manualAdjustment) {
      x += manualAdjustment.x;
      y += manualAdjustment.y;
      width *= manualAdjustment.scale;
      height *= manualAdjustment.scale;
    }

    // Apply enhanced blending with lighting
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.globalCompositeOperation = 'multiply';
    
    // Apply color adjustments for realistic lighting
    colorMatching.applyColorAdjustment(ctx, colorAdjustment);
    
    try {
      ctx.drawImage(clothingImg, x, y, width, height);
    } catch (error) {
      console.error('Error drawing clothing item:', error);
    }
    
    ctx.restore();
    
    // Apply subtle shadow for depth
    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = 'transparent';
    ctx.fillRect(x, y, width, height);
    ctx.restore();
  }

  private async getCachedImage(src: string): Promise<HTMLImageElement> {
    if (this.imageCache.has(src)) {
      return this.imageCache.get(src)!;
    }
    const img = await this.loadImage(src);
    this.imageCache.set(src, img);
    return img;
  }

  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      img.src = src;
    });
  }

  clearCache(): void {
    this.poseCache.clear();
    this.imageCache.clear();
  }
}

export const localVTO = new LocalVTOEngine();
