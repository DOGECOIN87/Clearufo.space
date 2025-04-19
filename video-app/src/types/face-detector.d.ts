interface FaceDetectorOptions {
  fastMode?: boolean;
  maxDetectedFaces?: number;
}

interface FaceBoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface DetectedFace {
  boundingBox: FaceBoundingBox;
}

declare class FaceDetector {
  constructor(options?: FaceDetectorOptions);
  detect(target: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement): Promise<DetectedFace[]>;
}

interface Window {
  FaceDetector: {
    new(options?: FaceDetectorOptions): FaceDetector;
  };
}
