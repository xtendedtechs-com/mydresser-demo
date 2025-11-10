import { PoseLandmark, LANDMARKS } from './poseDetection';

export interface PhysicsConfig {
  gravity: number;
  wind: number;
  stiffness: number;
}

export class ClothingPhysicsEngine {
  applyPhysics(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    landmarks: PoseLandmark[],
    category: string
  ): void {
    // Add wrinkles and folds based on body pose
    this.addWrinkles(ctx, x, y, width, height, category);
    
    // Add shadows for depth
    this.addDynamicShadows(ctx, x, y, width, height, landmarks);
  }

  private addWrinkles(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    category: string
  ): void {
    const wrinkleCount = category === 'tops' ? 3 : category === 'bottoms' ? 4 : 2;
    
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 1;

    for (let i = 0; i < wrinkleCount; i++) {
      const startY = y + (height / (wrinkleCount + 1)) * (i + 1);
      const variance = Math.random() * 10 - 5;
      
      ctx.beginPath();
      ctx.moveTo(x, startY + variance);
      
      // Create curved wrinkle line
      const segments = 5;
      for (let j = 1; j <= segments; j++) {
        const segmentX = x + (width / segments) * j;
        const segmentY = startY + Math.sin(j) * 3 + variance;
        ctx.lineTo(segmentX, segmentY);
      }
      
      ctx.stroke();
    }
    
    ctx.restore();
  }

  private addDynamicShadows(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    landmarks: PoseLandmark[]
  ): void {
    const leftShoulder = landmarks[LANDMARKS.LEFT_SHOULDER];
    const rightShoulder = landmarks[LANDMARKS.RIGHT_SHOULDER];
    
    // Calculate light direction from pose
    const shoulderAngle = Math.atan2(
      rightShoulder.y - leftShoulder.y,
      rightShoulder.x - leftShoulder.x
    );

    ctx.save();
    
    // Create gradient shadow based on body angle
    const gradient = ctx.createLinearGradient(
      x,
      y,
      x + Math.cos(shoulderAngle) * 20,
      y + Math.sin(shoulderAngle) * 20
    );
    
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.1)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width, height);
    
    ctx.restore();
  }

  simulateFabricFlow(
    landmarks: PoseLandmark[],
    category: string
  ): { flowIntensity: number; direction: number } {
    const leftShoulder = landmarks[LANDMARKS.LEFT_SHOULDER];
    const leftHip = landmarks[LANDMARKS.LEFT_HIP];
    
    // Calculate body lean
    const bodyAngle = Math.atan2(
      leftHip.y - leftShoulder.y,
      leftHip.x - leftShoulder.x
    );
    
    const flowIntensity = Math.abs(Math.sin(bodyAngle)) * 0.5;
    
    return {
      flowIntensity,
      direction: bodyAngle
    };
  }
}

export const clothingPhysics = new ClothingPhysicsEngine();
