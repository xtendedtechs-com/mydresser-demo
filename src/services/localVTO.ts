import { poseDetectionService, PoseLandmark, LANDMARKS } from './poseDetection';

interface ClothingItem {
  id: string;
  name: string;
  category: string;
  photo: string;
}

interface VTOConfig {
  userImage: string;
  clothingItems: ClothingItem[];
}

export class LocalVTOEngine {
  async generateVTO(config: VTOConfig): Promise<string> {
    try {
      // Load user image
      const userImg = await this.loadImage(config.userImage);
      
      // Detect pose
      const poseResults = await poseDetectionService.detectPose(userImg);
      
      if (!poseResults || !poseResults.landmarks) {
        throw new Error('Could not detect pose in image');
      }

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

      // Overlay clothing items based on category
      for (const item of config.clothingItems) {
        const itemImg = await this.loadImage(item.photo);
        await this.overlayClothing(ctx, itemImg, item.category, poseResults.landmarks, canvas.width, canvas.height);
      }

      // Return as data URL
      return canvas.toDataURL('image/jpeg', 0.95);
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
    canvasHeight: number
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
    let x = 0, y = 0, width = 0, height = 0, opacity = 0.85;

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

    // Apply semi-transparent overlay with blend mode
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.globalCompositeOperation = 'multiply';
    
    try {
      ctx.drawImage(clothingImg, x, y, width, height);
    } catch (error) {
      console.error('Error drawing clothing item:', error);
    }
    
    ctx.restore();
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
}

export const localVTO = new LocalVTOEngine();
