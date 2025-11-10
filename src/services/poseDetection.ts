import { Pose, Results, POSE_CONNECTIONS } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';

export interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

export interface PoseResults {
  landmarks: PoseLandmark[];
  worldLandmarks: PoseLandmark[];
}

// Key body landmarks indices from MediaPipe
export const LANDMARKS = {
  NOSE: 0,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
};

class PoseDetectionService {
  private pose: Pose | null = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    this.pose = new Pose({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`;
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

    this.isInitialized = true;
  }

  async detectPose(imageElement: HTMLImageElement): Promise<PoseResults | null> {
    if (!this.pose) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      if (!this.pose) {
        reject(new Error('Pose detection not initialized'));
        return;
      }

      this.pose.onResults((results: Results) => {
        if (results.poseLandmarks && results.poseLandmarks.length > 0) {
          resolve({
            landmarks: results.poseLandmarks as PoseLandmark[],
            worldLandmarks: results.poseWorldLandmarks as PoseLandmark[] || []
          });
        } else {
          resolve(null);
        }
      });

      this.pose.send({ image: imageElement });
    });
  }

  close(): void {
    if (this.pose) {
      this.pose.close();
      this.pose = null;
      this.isInitialized = false;
    }
  }
}

export const poseDetectionService = new PoseDetectionService();
