import { Settings } from 'lucide-react'

const TrackList = () => {
  return (
    <div className="glass-card rounded-xl p-6 space-y-6">
      <h2 className="text-xl font-semibold text-gray-100">Video Processing</h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <Settings className="w-12 h-12 text-blue-400 mx-auto mb-4 opacity-50" />
            <p className="text-gray-400">
              Use the controls below the video to adjust playback and processing settings
            </p>
          </div>
        </div>

        {/* Tips */}
        <div className="border-t border-white/5 pt-4">
          <p className="text-sm text-gray-400 text-center">
            For best results set speed to 0.1X
          </p>
        </div>
      </div>
    </div>
  )
}

export default TrackList
