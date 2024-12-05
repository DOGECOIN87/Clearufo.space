import { Clock, Video } from 'lucide-react'

const TrackList = () => {
  return (
    <div className="glass-card rounded-xl p-6 space-y-6">
      <h2 className="text-xl font-semibold text-gray-100">How it works</h2>
      
      <div className="space-y-4">
        {/* Video Info Section */}
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-500/10 rounded-lg mt-1">
              <Video className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h3 className="font-medium text-gray-200">HSV-H Color Channel Extraction</h3>
              <p className="text-sm text-gray-400">Extracting the HSV-H (hue) color channel from a video can help detect cloaked objects or beings by analyzing color variations that may be imperceptible to the human eye. Cloaking technologies theoretically work by bending light or creating distortions in the visible spectrum. These distortions may still exhibit subtle differences in hue, even if the object appears invisible or camouflaged.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-500/10 rounded-lg mt-1">
              <Clock className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h3 className="font-medium text-gray-200">Histogram Equalization</h3>
              <p className="text-sm text-gray-400">The equalization filter makes the distortions or anomalies caused by cloaked objects more prominent, improving the chances of detection in complex or noisy environments.</p>
            </div>
          </div>
        </div>

        {/* Future Track List */}
        <div className="border-t border-white/5 pt-4">
          <p className="text-sm text-gray-400">
            For best results set speed to 0.1X
          </p>
        </div>
      </div>
    </div>
  )
}

export default TrackList
