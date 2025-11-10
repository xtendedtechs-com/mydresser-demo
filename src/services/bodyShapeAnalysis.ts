import { PoseLandmark, LANDMARKS } from './poseDetection';

export interface BodyShape {
  type: 'hourglass' | 'pear' | 'apple' | 'rectangle' | 'inverted-triangle';
  shoulderWidth: number;
  waistWidth: number;
  hipWidth: number;
  torsoLength: number;
  legLength: number;
  bustToWaistRatio: number;
  waistToHipRatio: number;
}

export class BodyShapeAnalyzer {
  analyzeBodyShape(
    landmarks: PoseLandmark[],
    canvasWidth: number,
    canvasHeight: number
  ): BodyShape {
    const measurements = this.calculateMeasurements(landmarks, canvasWidth, canvasHeight);
    const shape = this.determineBodyShape(measurements);
    
    return {
      ...shape,
      ...measurements
    };
  }

  private calculateMeasurements(
    landmarks: PoseLandmark[],
    canvasWidth: number,
    canvasHeight: number
  ) {
    const leftShoulder = landmarks[LANDMARKS.LEFT_SHOULDER];
    const rightShoulder = landmarks[LANDMARKS.RIGHT_SHOULDER];
    const leftHip = landmarks[LANDMARKS.LEFT_HIP];
    const rightHip = landmarks[LANDMARKS.RIGHT_HIP];
    const leftAnkle = landmarks[LANDMARKS.LEFT_ANKLE];
    const rightAnkle = landmarks[LANDMARKS.RIGHT_ANKLE];

    // Calculate widths
    const shoulderWidth = Math.sqrt(
      Math.pow((rightShoulder.x - leftShoulder.x) * canvasWidth, 2) +
      Math.pow((rightShoulder.y - leftShoulder.y) * canvasHeight, 2)
    );

    const hipWidth = Math.sqrt(
      Math.pow((rightHip.x - leftHip.x) * canvasWidth, 2) +
      Math.pow((rightHip.y - leftHip.y) * canvasHeight, 2)
    );

    // Estimate waist width (between shoulders and hips)
    const waistY = (leftShoulder.y + leftHip.y) / 2;
    const waistWidth = hipWidth * 0.75; // Approximate

    // Calculate lengths
    const torsoLength = Math.sqrt(
      Math.pow((leftHip.x - leftShoulder.x) * canvasWidth, 2) +
      Math.pow((leftHip.y - leftShoulder.y) * canvasHeight, 2)
    );

    const legLength = Math.sqrt(
      Math.pow((leftAnkle.x - leftHip.x) * canvasWidth, 2) +
      Math.pow((leftAnkle.y - leftHip.y) * canvasHeight, 2)
    );

    return {
      shoulderWidth,
      waistWidth,
      hipWidth,
      torsoLength,
      legLength,
      bustToWaistRatio: shoulderWidth / waistWidth,
      waistToHipRatio: waistWidth / hipWidth
    };
  }

  private determineBodyShape(measurements: ReturnType<typeof this.calculateMeasurements>): { type: BodyShape['type'] } {
    const { bustToWaistRatio, waistToHipRatio, shoulderWidth, hipWidth } = measurements;
    
    // Hourglass: balanced shoulders and hips with defined waist
    if (bustToWaistRatio > 1.2 && waistToHipRatio < 0.85) {
      return { type: 'hourglass' };
    }
    
    // Pear: hips wider than shoulders
    if (hipWidth > shoulderWidth * 1.05) {
      return { type: 'pear' };
    }
    
    // Inverted triangle: shoulders wider than hips
    if (shoulderWidth > hipWidth * 1.05) {
      return { type: 'inverted-triangle' };
    }
    
    // Apple: less defined waist
    if (bustToWaistRatio < 1.15) {
      return { type: 'apple' };
    }
    
    // Rectangle: balanced proportions
    return { type: 'rectangle' };
  }

  getStyleRecommendations(bodyShape: BodyShape['type']): string[] {
    const recommendations: Record<BodyShape['type'], string[]> = {
      'hourglass': ['Fitted tops', 'High-waisted bottoms', 'Wrap dresses'],
      'pear': ['A-line skirts', 'Structured shoulders', 'Dark bottoms'],
      'apple': ['V-neck tops', 'Empire waist', 'Straight-leg pants'],
      'rectangle': ['Peplum tops', 'Belted waist', 'Layered looks'],
      'inverted-triangle': ['A-line bottoms', 'Wide-leg pants', 'Detailed bottoms']
    };
    
    return recommendations[bodyShape] || [];
  }
}

export const bodyShapeAnalyzer = new BodyShapeAnalyzer();
