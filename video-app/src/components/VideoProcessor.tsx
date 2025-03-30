import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import VideoControls from './VideoControls'
import Visualizer from './Visualizer'
import Player from './Player'
import { calculateHistogram, calculateCDF, applyCLAHE, adjustExposure } from '../utils/imageProcessing'
import { rgbToHsv, rgbToCmykC, rgbToCmykM, rgbToCmykY } from '../utils/colorConversion'
import { HelpCircle, X, Loader2, Pause, Play } from 'lucide-react'
import type { 
  VideoProcessorProps, 
  FilterType, 
  SmoothingMode, 
  FrameBufferSizes 
} from '../types/video'

const FRAME_BUFFER_SIZES: FrameBufferSizes = {
  off: 0,
  normal: 5,
  smooth: 12
}

// Filter explanations for the help modal
const FILTER_EXPLANATIONS = {
  'hue-histogram': {
    title: 'HSV-H + Histogram Equalization',
    description: 'Extracting the HSV-H (hue) color channel from a video can help detect cloaked objects or beings by analyzing color variations that may be imperceptible to the human eye. The histogram equalization enhances contrast in this channel, making subtle differences more visible.'
  },
  'hue-histogram-clahe': {
    title: 'HSV-H + Histogram + CLAHE',
    description: 'Combines hue extraction with both standard histogram equalization and CLAHE (Contrast Limited Adaptive Histogram Equalization). CLAHE applies histogram equalization to small regions rather than the entire image, often revealing local details that might be missed with global equalization.'
  },
  'histogram': {
    title: 'Histogram Equalization',
    description: 'Enhances the contrast of the entire image by stretching the intensity distribution. This can make hidden patterns more visible by ensuring all brightness levels are well-represented.'
  },
  'hue': {
    title: 'HSV-H (Hue) Channel',
    description: 'Isolates the hue component from the HSV color model, which represents the color type independent of saturation and brightness. This can reveal objects with subtle color differences that might be camouflaged in normal viewing.'
  },
  'clahe': {
    title: 'CLAHE',
    description: 'Contrast Limited Adaptive Histogram Equalization enhances local contrast while limiting noise amplification. It divides the image into small tiles and applies histogram equalization to each, then combines them using bilinear interpolation.'
  },
  'grayscale': {
    title: 'Grayscale',
    description: 'Converts the image to grayscale, removing color information but preserving luminance. This can sometimes make certain patterns more apparent by eliminating the distraction of color.'
  },
  'cmyk-c': {
    title: 'CMYK Cyan Channel',
    description: 'Extracts the Cyan channel from the CMYK color model. Cyan is the opposite of red in the color spectrum, so this filter can highlight objects that have unique signatures in the red wavelengths.'
  },
  'cmyk-m': {
    title: 'CMYK Magenta Channel',
    description: 'Extracts the Magenta channel from the CMYK color model. Magenta is the opposite of green, potentially revealing entities that have unusual interactions with green wavelengths.'
  },
  'cmyk-y': {
    title: 'CMYK Yellow Channel',
    description: 'Extracts the Yellow channel from the CMYK color model. Yellow is the opposite of blue, which can help identify anomalies that might be particularly visible or invisible in blue light.'
  }
};

const VideoProcessor = ({ file }: VideoProcessorProps) => {
  const originalVideoRef = useRef<HTMLVideoElement>(null)
  const processedCanvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()
  const frameBufferRef = useRef<ImageData[]>([])

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [currentFilter, setCurrentFilter] = useState<FilterType>('hue-histogram')
  const [temporalSmoothing, setTemporalSmoothing] = useState<SmoothingMode>('normal')
  const [exposure, setExposure] = useState(0) // 0 is neutral exposure
  const [isVerticalVideo, setIsVerticalVideo] = useState(false)
  const [isVideoLoading, setIsVideoLoading] = useState(true)
  const [videoError, setVideoError] = useState<string | null>(null)
  const [showHelpModal, setShowHelpModal] = useState(false)

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

      // Always apply exposure adjustment (even if 0, for consistency)
      adjustExposure(data, exposure);
      
      // Apply selected filter
      switch (currentFilter) {
        case 'grayscale':
          for (let i = 0; i < data.length; i += 4) {
            const avg = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2])
            data[i] = data[i + 1] = data[i + 2] = avg
          }
          break;

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
          break;

        case 'hue':
          for (let i = 0; i < data.length; i += 4) {
            const [h] = rgbToHsv(data[i], data[i + 1], data[i + 2])
            data[i] = data[i + 1] = data[i + 2] = h
          }
          break;

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
          break;

        case 'clahe':
          applyCLAHE(data, canvas.width, canvas.height)
          break;

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
          break;

        case 'cmyk-c':
          for (let i = 0; i < data.length; i += 4) {
            const value = rgbToCmykC(data[i], data[i + 1], data[i + 2])
            data[i] = data[i + 1] = data[i + 2] = value
          }
          break;

        case 'cmyk-m':
          for (let i = 0; i < data.length; i += 4) {
            const value = rgbToCmykM(data[i], data[i + 1], data[i + 2])
            data[i] = data[i + 1] = data[i + 2] = value
          }
          break;

        case 'cmyk-y':
          for (let i = 0; i < data.length; i += 4) {
            const value = rgbToCmykY(data[i], data[i + 1], data[i + 2])
            data[i] = data[i + 1] = data[i + 2] = value
          }
          break;
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
  }, [isPlaying, currentFilter, temporalSmoothing, exposure, isVideoLoading])

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

  const handleExposureChange = (value: number) => {
    // Clamp exposure value between -100 and 100
    const newExposure = Math.max(-100, Math.min(100, value));
    setExposure(newExposure);
  }

  const toggleHelpModal = () => {
    setShowHelpModal(!showHelpModal);
  }
  
  // Helper function to format time in MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="w-full space-y-6">
        <div className={`${
          isVerticalVideo ? 'grid grid-cols-2 gap-4' : 'flex flex-col gap-4'
        }`}>
          {/* Original Video Player */}
          <div className="glass-card rounded-2xl relative overflow-hidden">
            <div className="mb-2 text-center text-gray-300 font-medium py-1 bg-[#2A2A30]/50">
              Original Video
            </div>
            <div className={`${isVerticalVideo ? 'aspect-[9/16]' : 'aspect-video'} relative`}>
              <video
                ref={originalVideoRef}
                className="w-full h-full object-contain rounded-xl cursor-pointer"
                playsInline
                onClick={togglePlayback}
              />
              
              {/* Interactive overlay */}
              <div 
                className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors duration-200 flex items-center justify-center"
                onClick={togglePlayback}
              >
                <div className="opacity-0 hover:opacity-80 transition-opacity duration-200">
                  {isPlaying ? (
                    <Pause className="w-16 h-16 text-white" />
                  ) : (
                    <Play className="w-16 h-16 text-white" />
                  )}
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-800">
                <div
                  className="h-full bg-blue-500 transition-all duration-100"
                  style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>
              
              {/* Time indicators */}
              <div className="absolute bottom-4 left-4 right-4 flex justify-between text-sm text-white/80">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
            
            {isVideoLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="flex items-center space-x-3 text-white">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="font-medium">
                    Loading video...
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
          
          {/* Processed Video Player */}
          <div className="glass-card rounded-2xl relative overflow-hidden">
            <div className="mb-2 text-center text-gray-300 font-medium py-1 bg-[#2A2A30]/50">
              Processed Video
            </div>
            <Visualizer
              canvasRef={processedCanvasRef}
              isPlaying={isPlaying}
              currentTime={currentTime}
              duration={duration}
              isVerticalVideo={isVerticalVideo}
              onPlayPause={togglePlayback}
            />
            {isVideoLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="flex items-center space-x-3 text-white">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="font-medium">
                    Loading video...
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
        </div>

        <VideoControls
          isPlaying={isPlaying}
          playbackRate={playbackRate}
          temporalSmoothing={temporalSmoothing}
          exposure={exposure}
          onPlayPause={togglePlayback}
          onReset={handleReset}
          onPlaybackRateChange={handlePlaybackRateChange}
          onTemporalSmoothingChange={handleTemporalSmoothingChange}
          onExposureChange={handleExposureChange}
          disabled={isVideoLoading || !!videoError}
        />

        <div className="flex items-center gap-4">
          <select
            value={currentFilter}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setCurrentFilter(e.target.value as FilterType)}
            className="flex-1 bg-[#2A2A30] text-gray-200 rounded-lg px-4 py-3 outline-none 
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
            <option value="cmyk-c">CMYK Cyan Channel</option>
            <option value="cmyk-m">CMYK Magenta Channel</option>
            <option value="cmyk-y">CMYK Yellow Channel</option>
          </select>
          
          <button 
            onClick={toggleHelpModal}
            className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 p-3 rounded-lg transition-colors"
            title="Filter Explanations"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
        
        <div className="text-center text-sm text-gray-400 mt-2">
          For best results set speed to 0.1X
        </div>
      </div>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1A20] border border-[#3A3A42] rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-[#3A3A42]">
              <h2 className="text-xl font-semibold text-gray-100">Filter Explanations</h2>
              <button 
                onClick={toggleHelpModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {Object.entries(FILTER_EXPLANATIONS).map(([key, { title, description }]) => (
                <div key={key} className="space-y-2">
                  <h3 className="font-medium text-gray-200">{title}</h3>
                  <p className="text-gray-400">{description}</p>
                  {key !== Object.keys(FILTER_EXPLANATIONS)[Object.keys(FILTER_EXPLANATIONS).length - 1] && (
                    <div className="border-t border-[#3A3A42] pt-4 mt-4"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
