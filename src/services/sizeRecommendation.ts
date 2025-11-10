import { PoseLandmark, LANDMARKS } from './poseDetection';

export interface BodyMeasurements {
  shoulderWidth: number;
  chestWidth: number;
  waistWidth: number;
  hipWidth: number;
  torsoLength: number;
  legLength: number;
  armLength: number;
}

export interface SizeRecommendation {
  size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
  confidence: number;
  measurements: BodyMeasurements;
  category: string;
}

export class SizeRecommendationEngine {
  calculateMeasurements(
    landmarks: PoseLandmark[],
    imageWidth: number,
    imageHeight: number
  ): BodyMeasurements {
    const leftShoulder = landmarks[LANDMARKS.LEFT_SHOULDER];
    const rightShoulder = landmarks[LANDMARKS.RIGHT_SHOULDER];
    const leftHip = landmarks[LANDMARKS.LEFT_HIP];
    const rightHip = landmarks[LANDMARKS.RIGHT_HIP];
    const leftWrist = landmarks[LANDMARKS.LEFT_WRIST];
    const rightWrist = landmarks[LANDMARKS.RIGHT_WRIST];
    const leftAnkle = landmarks[LANDMARKS.LEFT_ANKLE];
    const rightAnkle = landmarks[LANDMARKS.RIGHT_ANKLE];

    const shoulderWidth = this.calculateDistance(leftShoulder, rightShoulder, imageWidth, imageHeight);
    const chestWidth = shoulderWidth * 1.1;
    const waistWidth = shoulderWidth * 0.85;
    const hipWidth = this.calculateDistance(leftHip, rightHip, imageWidth, imageHeight);
    const torsoLength = this.calculateDistance(leftShoulder, leftHip, imageWidth, imageHeight);
    const legLength = this.calculateDistance(leftHip, leftAnkle, imageWidth, imageHeight);
    const armLength = this.calculateDistance(leftShoulder, leftWrist, imageWidth, imageHeight);

    return {
      shoulderWidth,
      chestWidth,
      waistWidth,
      hipWidth,
      torsoLength,
      legLength,
      armLength
    };
  }

  recommendSize(measurements: BodyMeasurements, category: string): SizeRecommendation {
    let size: SizeRecommendation['size'] = 'M';
    let confidence = 0.8;

    const avgWidth = (measurements.shoulderWidth + measurements.chestWidth) / 2;

    if (category.toLowerCase() === 'tops' || category.toLowerCase() === 'outerwear') {
      if (avgWidth < 140) { size = 'XS'; confidence = 0.85; }
      else if (avgWidth < 160) { size = 'S'; confidence = 0.9; }
      else if (avgWidth < 180) { size = 'M'; confidence = 0.9; }
      else if (avgWidth < 200) { size = 'L'; confidence = 0.9; }
      else if (avgWidth < 220) { size = 'XL'; confidence = 0.85; }
      else { size = 'XXL'; confidence = 0.8; }
    } else if (category.toLowerCase() === 'bottoms') {
      const waistHipAvg = (measurements.waistWidth + measurements.hipWidth) / 2;
      if (waistHipAvg < 130) { size = 'XS'; confidence = 0.85; }
      else if (waistHipAvg < 150) { size = 'S'; confidence = 0.9; }
      else if (waistHipAvg < 170) { size = 'M'; confidence = 0.9; }
      else if (waistHipAvg < 190) { size = 'L'; confidence = 0.9; }
      else if (waistHipAvg < 210) { size = 'XL'; confidence = 0.85; }
      else { size = 'XXL'; confidence = 0.8; }
    }

    return { size, confidence, measurements, category };
  }

  private calculateDistance(
    p1: PoseLandmark,
    p2: PoseLandmark,
    width: number,
    height: number
  ): number {
    return Math.sqrt(
      Math.pow((p2.x - p1.x) * width, 2) +
      Math.pow((p2.y - p1.y) * height, 2)
    );
  }
}

export const sizeRecommendation = new SizeRecommendationEngine();
