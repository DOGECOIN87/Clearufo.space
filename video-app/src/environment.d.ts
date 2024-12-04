/// <reference types="react" />
/// <reference types="vite/client" />

declare module '@tensorflow-models/face-detection' {
  export interface Face {
    box: {
      xMin: number
      yMin: number
      width: number
      height: number
    }
    score?: number
    keypoints?: Array<{
      x: number
      y: number
    }>
  }

  export interface FaceDetector {
    estimateFaces(
      image: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement,
      config?: { flipHorizontal: boolean }
    ): Promise<Face[]>
  }

  export const SupportedModels: {
    MediaPipeFaceDetector: string
  }

  export function createDetector(
    model: string,
    config: {
      runtime: string
      modelType: string
      maxFaces: number
    }
  ): Promise<FaceDetector>
}

declare module '*.css' {
  const content: { [className: string]: string }
  export default content
}

declare module '*.svg' {
  import type { FunctionComponent, SVGProps } from 'react'
  const content: FunctionComponent<SVGProps<SVGElement>>
  export default content
}

declare module '*.png' {
  const content: string
  export default content
}

declare module '*.jpg' {
  const content: string
  export default content
}

declare module '*.jpeg' {
  const content: string
  export default content
}

declare module '*.gif' {
  const content: string
  export default content
}

declare module '*.webp' {
  const content: string
  export default content
}
