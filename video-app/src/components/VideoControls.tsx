import { Play, Pause, RotateCcw, Clock, Scan } from 'lucide-react'

interface VideoControlsProps {
  isPlaying: boolean
  playbackRate: number
  temporalSmoothing: 'off' | 'normal' | 'smooth'
  faceDetection: boolean
  disabled?: boolean
  onPlayPause: () => void
  onReset: () => void
  onPlaybackRateChange: (rate: number) => void
  onTemporalSmoothingChange: (mode: 'off' | 'normal' | 'smooth') => void
  onFaceDetectionToggle: () => void
}

const VideoControls = ({
  isPlaying,
  playbackRate,
  temporalSmoothing,
  faceDetection,
  disabled = false,
  onPlayPause,
  onReset,
  onPlaybackRateChange,
  onTemporalSmoothingChange,
  onFaceDetectionToggle,
}: VideoControlsProps) => {
  const playbackRates = [0.1, 0.25, 0.5, 1, 2]

  return (
    <div className="glass-card rounded-xl p-4 flex items-center justify-center space-x-4">
      <button
        onClick={onPlayPause}
        className="p-3 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title={isPlaying ? "Pause" : "Play"}
        disabled={disabled}
      >
        {isPlaying ? (
          <Pause className="w-5 h-5 text-gray-200" />
        ) : (
          <Play className="w-5 h-5 text-gray-200" />
        )}
      </button>

      <button
        onClick={onReset}
        className="p-3 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Reset"
        disabled={disabled}
      >
        <RotateCcw className="w-5 h-5 text-gray-200" />
      </button>

      <select
        value={playbackRate}
        onChange={(e) => onPlaybackRateChange(Number(e.target.value))}
        className="bg-[#2A2A30] text-gray-200 rounded-lg px-4 py-2 outline-none 
                 border border-[#3A3A42] focus:border-blue-500 transition-colors
                 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={disabled}
      >
        {playbackRates.map((rate) => (
          <option key={rate} value={rate}>
            {rate}x
          </option>
        ))}
      </select>

      <div className="flex items-center space-x-3">
        <Clock className="w-4 h-4 text-gray-400" />
        <select
          value={temporalSmoothing}
          onChange={(e) => onTemporalSmoothingChange(e.target.value as 'off' | 'normal' | 'smooth')}
          className="bg-[#2A2A30] text-gray-200 rounded-lg px-4 py-2 outline-none 
                   border border-[#3A3A42] focus:border-blue-500 transition-colors
                   disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={disabled}
        >
          <option value="off">No Smoothing</option>
          <option value="normal">Normal Smooth</option>
          <option value="smooth">Extra Smooth</option>
        </select>
      </div>

      <button
        onClick={onFaceDetectionToggle}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200
                   ${faceDetection 
                     ? 'bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/20' 
                     : 'bg-[#2A2A30] hover:bg-[#3A3A42] border border-[#3A3A42]'
                   }
                   disabled:opacity-50 disabled:cursor-not-allowed`}
        disabled={disabled}
      >
        <Scan className="w-4 h-4" />
        <span className="text-sm">Face Detection</span>
      </button>
    </div>
  )
}

export default VideoControls