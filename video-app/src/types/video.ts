import { RefObject } from 'react'

export interface VideoControlsProps {
  isPlaying: boolean
  playbackRate: number
  temporalSmoothing: SmoothingMode
  disabled: boolean
  onPlayPause: () => void
  onReset: () => void
  onPlaybackRateChange: (rate: number) => void
  onTemporalSmoothingChange: (mode: SmoothingMode) => void
}

export interface VisualizerProps {
  canvasRef: RefObject<HTMLCanvasElement>
  isPlaying: boolean
  currentTime: number
  duration: number
  isVerticalVideo: boolean
  onPlayPause: () => void
}

export interface PlayerProps {
  videoRef: RefObject<HTMLVideoElement>
  onTimeUpdate: (time: number) => void
  onDurationChange: (duration: number) => void
  onEnded: () => void
}

export type FilterType = 'grayscale' | 'histogram' | 'hue' | 'hue-histogram' | 'clahe' | 'hue-histogram-clahe' | 'cmyk-c' | 'cmyk-m' | 'cmyk-y'
export type SmoothingMode = 'off' | 'normal' | 'smooth'

export interface FrameBufferSizes {
  off: number
  normal: number
  smooth: number
}

export interface VideoProcessorProps {
  file: File
}
