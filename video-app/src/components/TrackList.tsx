import { Clock, Video } from 'lucide-react'

const TrackList = () => {
  return (
    <div className="glass-card rounded-xl p-6 space-y-6">
      <h2 className="text-xl font-semibold text-gray-100">Video Information</h2>
      
      <div className="space-y-4">
        {/* Video Info Section */}
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-500/10 rounded-lg mt-1">
              <Video className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h3 className="font-medium text-gray-200">Processed Frames</h3>
              <p className="text-sm text-gray-400">Real-time frame processing with selected filters</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-500/10 rounded-lg mt-1">
              <Clock className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h3 className="font-medium text-gray-200">Processing Stats</h3>
              <p className="text-sm text-gray-400">Frame-by-frame analysis and enhancement</p>
            </div>
          </div>
        </div>

        {/* Future Track List */}
        <div className="border-t border-white/5 pt-4">
          <p className="text-sm text-gray-400">
            Additional tracks and analysis will appear here as they are processed.
          </p>
        </div>
      </div>
    </div>
  )
}

export default TrackList