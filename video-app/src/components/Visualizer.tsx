import { RefObject, useCallback } from 'react'
import { Pause, Play } from 'lucide-react'

interface VisualizerProps {
  canvasRef: RefObject<HTMLCanvasElement>
  isPlaying: boolean
  currentTime: number
  duration: number
  isVerticalVideo: boolean
  onPlayPause?: () => void
}

const Visualizer = ({
  canvasRef,
  isPlaying,
  currentTime,
  duration,
  isVerticalVideo,
  onPlayPause
}: VisualizerProps) => {
  const progress = duration ? (currentTime / duration) * 100 : 0

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onPlayPause?.()
  }, [onPlayPause])

  return (
    <div className="relative w-full">
      <div 
        className={`${isVerticalVideo ? 'aspect-[9/16]' : 'aspect-video'} relative cursor-pointer`}
        onClick={handleClick}
      >
        {/* Base canvas layer */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-contain rounded-xl"
        />

        {/* Interactive overlay - always present but only visible on hover */}
        <div 
          className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors duration-200 flex items-center justify-center"
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
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Time indicators */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between text-sm text-white/80">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  )
}

// Helper function to format time in MM:SS
const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export default Visualizer