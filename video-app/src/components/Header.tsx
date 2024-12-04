import { Video } from 'lucide-react'

const Header = () => {
  return (
    <header className="glass-bg border-b border-white/5">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-500/20 p-2 rounded-lg">
            <Video className="w-6 h-6 text-blue-400" />
          </div>
          <h1 className="text-xl font-semibold text-white">Video Processor</h1>
        </div>
      </div>
    </header>
  )
}

export default Header