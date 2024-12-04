import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import VideoControls from './VideoControls'
import Visualizer from './Visualizer'
import TrackList from './TrackList'
import Player from './Player'
import { calculateHistogram, calculateCDF, applyCLAHE } from '../utils/imageProcessing'
import { loadFaceDetectionModel, detectFaces, drawFaceDetections } from '../utils/faceDetection'
import { rgbToHsv } from '../utils/colorConversion'
import { Loader2 } from 'lucide-react'
import type { 
  VideoProcessorProps, 
  FilterType, 
  SmoothingMode, 
  FrameBufferSizes 
} from '../types/video'
import type { FaceDetector } from '@tensorflow-models/face-detection'

const FRAME_BUFFER_SIZES: FrameBufferSizes = {
  off: 0,
  normal: 5,
  smooth: 12
}

const VideoProcessor = ({ file }: VideoProcessorProps) => {
  const originalVideoRef = useRef<HTMLVideoElement>(null)
  const processedCanvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()
  const frameBufferRef = useRef<ImageData[]>([])
  const faceDetectorRef = useRef<FaceDetector | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [currentFilter, setCurrentFilter] = useState<FilterType>('hue-histogram')
  const [temporalSmoothing, setTemporalSmoothing] = useState<SmoothingMode>('normal')
  const [faceDetection, setFaceDetection] = useState(false)
  const [isFaceDetectionLoading, setIsFaceDetectionLoading] = useState(false)
  const [isVerticalVideo, setIsVerticalVideo] = useState(false)
  const [isVideoLoading, setIsVideoLoading] = useState(true)
  const [videoError, setVideoError] = useState<string | null>(null)

  // Cleanup function
  const cleanup = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    frameBufferRef.current = []
    
    const video = originalVideoRef.current
    if (video) {
      video.pause()
      video.src = ''
      video.load()
    }

    // Clear canvas
    const canvas = processedCanvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx?.clearRect(0, 0, canvas.width, canvas.height)
    }

    // Reset face detector
    faceDetectorRef.current = null
  }

  // Load video source
  useEffect(() => {
    if (!originalVideoRef.current || !file) return

    const video = originalVideoRef.current
    const videoURL = URL.createObjectURL(file)

    const handleError = () => {
      setVideoError('Failed to load video. Please try another file.')
      setIsVideoLoading(false)
      setIsPlaying(false)
    }

    const handleLoadedMetadata = () => {
      const canvas = processedCanvasRef.current
      if (!canvas) return

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      setIsVerticalVideo(video.videoHeight / video.videoWidth >= 1.5)
    }

    const handleLoadedData = () => {
      setIsVideoLoading(false)
      setVideoError(null)
      // Ensure first frame is drawn
      const canvas = processedCanvasRef.current
      const ctx = canvas?.getContext('2d')
      if (canvas && ctx && video) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      }
    }

    video.src = videoURL
    video.load()

    // Add event listeners
    video.addEventListener('error', handleError)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('loadeddata', handleLoadedData)

    return () => {
      URL.revokeObjectURL(videoURL)
      video.removeEventListener('error', handleError)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('loadeddata', handleLoadedData)
      cleanup()
    }
  }, [file])

  // Process frames
  const processFrame = async () => {
    const video = originalVideoRef.current
    const canvas = processedCanvasRef.current
    if (!video || !canvas || video.paused || video.ended) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    try {
      // Draw original frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      // Get frame data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      // Apply selected filter
      switch (currentFilter) {
        case 'grayscale':
          for (let i = 0; i < data.length; i += 4) {
            const avg = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2])
            data[i] = data[i + 1] = data[i + 2] = avg
          }
          break

        case 'histogram':
          const histogram = calculateHistogram(data)
          const cdf = calculateCDF(histogram)
          const cdfMin = cdf.find(x => x > 0) || 0
          const total = canvas.width * canvas.height
          for (let i = 0; i < data.length; i += 4) {
            const avg = Math.round((data[i] + data[i + 1] + data[i + 2]) / 3)
            const newValue = Math.round(((cdf[avg] - cdfMin) / (total - cdfMin)) * 255)
            data[i] = data[i + 1] = data[i + 2] = newValue
          }
          break

        case 'hue':
          for (let i = 0; i < data.length; i += 4) {
            const [h] = rgbToHsv(data[i], data[i + 1], data[i + 2])
            data[i] = data[i + 1] = data[i + 2] = h
          }
          break

        case 'hue-histogram':
          // Convert to HSV and extract hue channel
          const hueData = new Uint8ClampedArray(data.length)
          for (let i = 0; i < data.length; i += 4) {
            const [h] = rgbToHsv(data[i], data[i + 1], data[i + 2])
            hueData[i] = hueData[i + 1] = hueData[i + 2] = h
            hueData[i + 3] = 255
          }
          
          // Apply histogram equalization to hue channel
          const hueHistogram = calculateHistogram(hueData)
          const hueCdf = calculateCDF(hueHistogram)
          const hueCdfMin = hueCdf.find(x => x > 0) || 0
          const hueTotal = canvas.width * canvas.height
          
          for (let i = 0; i < data.length; i += 4) {
            const h = hueData[i]
            const newHue = Math.round(((hueCdf[h] - hueCdfMin) / (hueTotal - hueCdfMin)) * 255)
            data[i] = data[i + 1] = data[i + 2] = newHue
          }
          break

        case 'clahe':
          applyCLAHE(data, canvas.width, canvas.height)
          break

        case 'hue-histogram-clahe':
          // Convert to HSV and extract hue channel
          const hueDataClahe = new Uint8ClampedArray(data.length)
          for (let i = 0; i < data.length; i += 4) {
            const [h] = rgbToHsv(data[i], data[i + 1], data[i + 2])
            hueDataClahe[i] = hueDataClahe[i + 1] = hueDataClahe[i + 2] = h
            hueDataClahe[i + 3] = 255
          }
          
          // Apply CLAHE to hue channel
          applyCLAHE(hueDataClahe, canvas.width, canvas.height)
          
          // Copy back to main data
          for (let i = 0; i < data.length; i += 4) {
            data[i] = data[i + 1] = data[i + 2] = hueDataClahe[i]
          }
          break
      }

      // Apply temporal smoothing if enabled
      if (temporalSmoothing !== 'off') {
        const bufferSize = FRAME_BUFFER_SIZES[temporalSmoothing]
        frameBufferRef.current.push(imageData)
        if (frameBufferRef.current.length > bufferSize) {
          frameBufferRef.current.shift()
        }

        if (frameBufferRef.current.length === bufferSize) {
          const smoothedData = new Uint8ClampedArray(data.length)
          for (let i = 0; i < data.length; i++) {
            let sum = 0
            frameBufferRef.current.forEach((frame: ImageData) => {
              sum += frame.data[i]
            })
            smoothedData[i] = sum / bufferSize
          }
          imageData.data.set(smoothedData)
        }
      }

      // Put processed frame back to canvas
      ctx.putImageData(imageData, 0, 0)

      // Apply face detection if enabled
      if (faceDetection && faceDetectorRef.current) {
        try {
          const faces = await detectFaces(video)
          drawFaceDetections(ctx, faces)
        } catch (error) {
          console.error('Face detection error:', error)
          // Don't throw here to prevent video processing from stopping
        }
      }

      // Request next frame
      animationFrameRef.current = requestAnimationFrame(processFrame)
    } catch (error) {
      console.error('Frame processing error:', error)
      // Request next frame even if there's an error to keep video playing
      animationFrameRef.current = requestAnimationFrame(processFrame)
    }
  }

  // Handle playback
  useEffect(() => {
    const video = originalVideoRef.current
    if (!video || isVideoLoading) return

    if (isPlaying) {
      video.play()
        .then(() => {
          processFrame()
        })
        .catch((error: Error) => {
          console.error("Video play error:", error)
          setIsPlaying(false)
          setVideoError('Failed to play video. Please try again.')
        })
    } else {
      video.pause()
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isPlaying, currentFilter, temporalSmoothing, faceDetection, isVideoLoading])

  // Cleanup on unmount
  useEffect(() => {
    return cleanup
  }, [])

  // Playback controls
  const togglePlayback = () => {
    if (isVideoLoading || videoError) return
    setIsPlaying(!isPlaying)
  }

  const handleReset = () => {
    const video = originalVideoRef.current
    if (!video || isVideoLoading) return

    video.currentTime = 0
    setCurrentTime(0)
    if (!isPlaying) {
      setIsPlaying(true)
    }
  }

  const handlePlaybackRateChange = (rate: number) => {
    const video = originalVideoRef.current
    if (!video || isVideoLoading) return

    video.playbackRate = rate
    setPlaybackRate(rate)
  }

  const handleTemporalSmoothingChange = (mode: SmoothingMode) => {
    setTemporalSmoothing(mode)
    frameBufferRef.current = [] // Clear buffer when changing modes
  }

  const handleFaceDetectionToggle = async () => {
    if (!faceDetection && !isFaceDetectionLoading) {
      setIsFaceDetectionLoading(true)
      try {
        const detector = await loadFaceDetectionModel()
        faceDetectorRef.current = detector
        setFaceDetection(true)
      } catch (error) {
        console.error('Failed to load face detection model:', error)
        setVideoError('Failed to load face detection model. Please try again.')
      } finally {
        setIsFaceDetectionLoading(false)
      }
    } else {
      setFaceDetection(!faceDetection)
    }
  }

  return (
    <div className={`flex ${isVerticalVideo ? 'flex-col lg:flex-row' : 'flex-col md:flex-row'} gap-8`}>
      <div className={`${isVerticalVideo ? 'w-full lg:w-1/2 xl:w-2/5' : 'w-full md:w-2/3'} space-y-6`}>
        <div className={`glass-card rounded-2xl relative overflow-hidden ${
          isVerticalVideo ? 'max-w-[500px] mx-auto' : ''
        }`}>
          <Visualizer
            canvasRef={processedCanvasRef}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            isVerticalVideo={isVerticalVideo}
            onPlayPause={togglePlayback}
          />
          {(isVideoLoading || isFaceDetectionLoading) && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="flex items-center space-x-3 text-white">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="font-medium">
                  {isVideoLoading ? 'Loading video...' : 'Loading face detection...'}
                </span>
              </div>
            </div>
          )}
          {videoError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="text-red-400 font-medium text-center px-4">
                {videoError}
              </div>
            </div>
          )}
        </div>

        <VideoControls
          isPlaying={isPlaying}
          playbackRate={playbackRate}
          temporalSmoothing={temporalSmoothing}
          faceDetection={faceDetection}
          onPlayPause={togglePlayback}
          onReset={handleReset}
          onPlaybackRateChange={handlePlaybackRateChange}
          onTemporalSmoothingChange={handleTemporalSmoothingChange}
          onFaceDetectionToggle={handleFaceDetectionToggle}
          disabled={isVideoLoading || !!videoError}
        />

        <select
          value={currentFilter}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => setCurrentFilter(e.target.value as FilterType)}
          className="w-full bg-[#2A2A30] text-gray-200 rounded-lg px-4 py-3 outline-none 
                   border border-[#3A3A42] focus:border-blue-500 transition-colors
                   disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isVideoLoading || !!videoError}
        >
          <option value="hue-histogram">HSV-H + Histogram Equalization</option>
          <option value="hue-histogram-clahe">HSV-H + Histogram + CLAHE</option>
          <option value="histogram">Histogram Equalization</option>
          <option value="hue">HSV-H (Hue) Channel</option>
          <option value="clahe">CLAHE</option>
          <option value="grayscale">Grayscale</option>
        </select>
      </div>

      <div className={`${isVerticalVideo ? 'w-full lg:w-1/2 xl:w-3/5' : 'w-full md:w-1/3'}`}>
        <TrackList />
      </div>

      <video
        ref={originalVideoRef}
        className="hidden"
        playsInline
      />

      <Player
        videoRef={originalVideoRef}
        onTimeUpdate={setCurrentTime}
        onDurationChange={setDuration}
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  )
}

export default VideoProcessor
