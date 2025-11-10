import { Pose, Results } from '@mediapipe/pose';

export interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface PoseResults {
  poseLandmarks: PoseLandmark[];
  poseWorldLandmarks: PoseLandmark[];
  landmarks: PoseLandmark[];
}

// Landmark indices from MediaPipe
export const LANDMARKS = {
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  MOUTH_LEFT: 9,
  MOUTH_RIGHT: 10,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_PINKY: 17,
  RIGHT_PINKY: 18,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
  LEFT_THUMB: 21,
  RIGHT_THUMB: 22,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32
};

export class PoseDetectionService {
  private pose: Pose | null = null;
  private initialized = false;
  private modelCache: PoseResults | null = null;
  private initializationAttempts = 0;
  private maxAttempts = 3;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      this.pose = new Pose({
        locateFile: (file) => {
          // Use unpkg CDN for better reliability
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/${file}`;
        }
      });

      this.pose.setOptions({
        modelComplexity: 0, // Use lightweight model for speed
        smoothLandmarks: false, // Disable for faster processing
        enableSegmentation: false,
        smoothSegmentation: false,
        minDetectionConfidence: 0.3, // Lower threshold for faster detection
        minTrackingConfidence: 0.3
      });

      this.initialized = true;
      console.log('MediaPipe Pose initialized successfully');
    } catch (error) {
      console.error('Failed to initialize MediaPipe Pose:', error);
      this.initializationAttempts++;
      
      if (this.initializationAttempts < this.maxAttempts) {
        console.log(`Retrying initialization (${this.initializationAttempts}/${this.maxAttempts})...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.initialize();
      }
      
      throw new Error(`Failed to initialize pose detection after ${this.maxAttempts} attempts`);
    }
  }

  async detectPose(imageElement: HTMLImageElement): Promise<PoseResults | null> {
    if (!this.initialized || !this.pose) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      if (!this.pose) {
        reject(new Error('Pose detection not initialized'));
        return;
      }

      this.pose.onResults((results: Results) => {
        if (results.poseLandmarks) {
          const poseResults: PoseResults = {
            poseLandmarks: results.poseLandmarks,
            poseWorldLandmarks: results.poseWorldLandmarks || [],
            landmarks: results.poseLandmarks
          };
          resolve(poseResults);
        } else {
          resolve(null);
        }
      });

      // Add timeout to prevent hanging
      const timeout = setTimeout(() => {
        reject(new Error('Pose detection timeout'));
      }, 10000);

      this.pose.send({ image: imageElement }).then(() => {
        clearTimeout(timeout);
      }).catch((error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  close(): void {
    if (this.pose) {
      this.pose.close();
      this.pose = null;
      this.initialized = false;
    }
  }
}

export const poseDetectionService = new PoseDetectionService();
