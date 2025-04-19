import { Play, Pause, RotateCcw, Clock } from 'lucide-react'
import { VideoControlsProps } from '../types/video'

const VideoControls = ({
  isPlaying,
  playbackRate,
  temporalSmoothing,
  disabled = false,
  onPlayPause,
  onReset,
  onPlaybackRateChange,
  onTemporalSmoothingChange,
}: VideoControlsProps) => {
  const playbackRates = [0.1, 0.25, 0.5, 1, 2]

  return (
    <div className="glass-card rounded-xl p-4 sm:p-5">
      {/* Desktop layout (hidden on mobile) */}
      <div className="hidden sm:flex sm:items-center sm:justify-between">
        <div className="flex items-center space-x-3">
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
        </div>
        
        <div className="flex items-center space-x-4">
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
        </div>
      </div>
      
      {/* Mobile layout (hidden on desktop) */}
      <div className="sm:hidden space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
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
          </div>
          
          <select
            value={playbackRate}
            onChange={(e) => onPlaybackRateChange(Number(e.target.value))}
            className="bg-[#2A2A30] text-gray-200 rounded-lg px-3 py-2 outline-none 
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
        </div>
        
        <div className="flex items-center space-x-3 bg-[#1A1A20] rounded-lg p-2">
          <Clock className="w-4 h-4 text-gray-400 ml-1" />
          <select
            value={temporalSmoothing}
            onChange={(e) => onTemporalSmoothingChange(e.target.value as 'off' | 'normal' | 'smooth')}
            className="flex-grow bg-[#2A2A30] text-gray-200 rounded-lg px-3 py-2 outline-none 
                    border border-[#3A3A42] focus:border-blue-500 transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={disabled}
          >
            <option value="off">No Smoothing</option>
            <option value="normal">Normal Smooth</option>
            <option value="smooth">Extra Smooth</option>
          </select>
        </div>
      </div>
    </div>
  )
}

export default VideoControls
