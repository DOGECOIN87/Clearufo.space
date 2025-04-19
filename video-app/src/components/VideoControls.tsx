import { Play, Pause, RotateCcw, Clock, SunMedium, Plus, Minus } from 'lucide-react'
import { VideoControlsProps } from '../types/video'

const VideoControls = ({
  isPlaying,
  playbackRate,
  temporalSmoothing,
  exposure,
  disabled = false,
  onPlayPause,
  onReset,
  onPlaybackRateChange,
  onTemporalSmoothingChange,
  onExposureChange,
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

      <div className="flex items-center space-x-3">
        <SunMedium className="w-4 h-4 text-gray-400" />
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onExposureChange(exposure - 10)}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Decrease Exposure"
            disabled={disabled || exposure <= -100}
          >
            <Minus className="w-4 h-4 text-gray-200" />
          </button>
          <span className="text-gray-200 min-w-[40px] text-center">{exposure}</span>
          <button
            onClick={() => onExposureChange(exposure + 10)}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Increase Exposure"
            disabled={disabled || exposure >= 100}
          >
            <Plus className="w-4 h-4 text-gray-200" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default VideoControls
