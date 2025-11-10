import { poseDetectionService, PoseLandmark, LANDMARKS, PoseResults } from './poseDetection';
import { sizeRecommendation, SizeRecommendation } from './sizeRecommendation';
import { colorMatching, ColorAdjustment } from './colorMatching';
import { fabricTexture } from './fabricTexture';
import { bodyShapeAnalyzer, BodyShape } from './bodyShapeAnalysis';
import { clothingPhysics } from './clothingPhysics';

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
  bodyShape: BodyShape;
}

export class LocalVTOEngine {
  private poseCache = new Map<string, PoseResults>();
  private imageCache = new Map<string, HTMLImageElement>();

  async generateVTO(config: VTOConfig): Promise<VTOResult> {
    const startTime = performance.now();
    try {
      console.log('Starting VTO generation...');
      
      // Load and downscale user image for faster processing
      const userImg = await this.getCachedImage(config.userImage);
      const maxDimension = 800; // Reduce from original size for speed
      const scale = Math.min(maxDimension / userImg.width, maxDimension / userImg.height, 1);
      const scaledWidth = Math.floor(userImg.width * scale);
      const scaledHeight = Math.floor(userImg.height * scale);
      
      // Create scaled canvas for processing
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = scaledWidth;
      tempCanvas.height = scaledHeight;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) throw new Error('Could not create temp canvas');
      tempCtx.drawImage(userImg, 0, 0, scaledWidth, scaledHeight);
      
      // Detect pose with caching and timeout
      console.log('Detecting pose...');
      let poseResults = this.poseCache.get(config.userImage);
      if (!poseResults) {
        try {
          const scaledImg = new Image();
          scaledImg.src = tempCanvas.toDataURL('image/jpeg', 0.8);
          await new Promise(resolve => scaledImg.onload = resolve);
          
          // Add timeout to pose detection
          const posePromise = poseDetectionService.detectPose(scaledImg);
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Pose detection timeout')), 5000)
          );
          
          poseResults = await Promise.race([posePromise, timeoutPromise]) as PoseResults;
          
          if (!poseResults || !poseResults.landmarks) {
            throw new Error('Could not detect pose in image');
          }
          this.poseCache.set(config.userImage, poseResults);
          console.log('Pose detected successfully');
        } catch (poseError) {
          console.error('Pose detection failed:', poseError);
          throw new Error('Could not detect body pose. Please ensure full body is visible in good lighting.');
        }
      }

      // Analyze body shape
      const bodyShape = bodyShapeAnalyzer.analyzeBodyShape(
        poseResults.landmarks,
        scaledWidth,
        scaledHeight
      );

      // Analyze lighting
      const colorAdjustment = colorMatching.analyzeImageLighting(userImg);

      // Use scaled canvas for final output
      const canvas = tempCanvas;
      const ctx = tempCtx;

      // Load all clothing images in parallel
      const clothingImages = await Promise.all(
        config.clothingItems.map(item => this.getCachedImage(item.photo))
      );

      // Calculate size recommendations
      const sizeRecommendations: SizeRecommendation[] = [];
      const measurements = sizeRecommendation.calculateMeasurements(
        poseResults.landmarks,
        scaledWidth,
        scaledHeight
      );

      // Overlay clothing items with all enhancements
      for (let i = 0; i < config.clothingItems.length; i++) {
        const item = config.clothingItems[i];
        const itemImg = clothingImages[i];
        
        const manualAdj = config.manualAdjustments?.[item.id];
        await this.overlayClothing(
          ctx,
          itemImg,
          item.category,
          poseResults.landmarks,
          scaledWidth,
          scaledHeight,
          colorAdjustment,
          manualAdj
        );

        const sizeRec = sizeRecommendation.recommendSize(measurements, item.category);
        sizeRecommendations.push(sizeRec);
      }

      const processingTime = performance.now() - startTime;

      return {
        imageUrl: canvas.toDataURL('image/jpeg', 0.85),
        sizeRecommendations,
        processingTime,
        bodyShape
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
    
    // Apply fabric texture
    const fabricType = fabricTexture.detectFabricType(category);
    fabricTexture.applyFabricTexture(ctx, Math.floor(x), Math.floor(y), Math.floor(width), Math.floor(height), fabricType);
    
    // Apply clothing physics (wrinkles and shadows)
    clothingPhysics.applyPhysics(ctx, x, y, width, height, landmarks, category);
    
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
      
      // Only set crossOrigin for non-blob URLs
      if (!src.startsWith('blob:')) {
        img.crossOrigin = 'anonymous';
      }
      
      // Add timeout for faster failure
      const timeout = setTimeout(() => {
        reject(new Error(`Image load timeout: ${src}`));
      }, 5000);
      
      img.onload = () => {
        clearTimeout(timeout);
        resolve(img);
      };
      img.onerror = (e) => {
        clearTimeout(timeout);
        console.error('Image load error:', e, 'src:', src);
        reject(new Error(`Failed to load image: ${src}`));
      };
      img.src = src;
    });
  }

  clearCache(): void {
    this.poseCache.clear();
    this.imageCache.clear();
  }
}

export const localVTO = new LocalVTOEngine();
