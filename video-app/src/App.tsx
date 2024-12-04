import { useState } from 'react'
import { Upload } from 'lucide-react'
import VideoProcessor from './components/VideoProcessor'
import Header from './components/Header'

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-gray-100">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        {!selectedFile ? (
          <div className="flex flex-col items-center justify-center space-y-4 p-8">
            <label className="glass-card w-full h-64 rounded-2xl cursor-pointer 
                            hover:border-blue-500/50 transition-all duration-300
                            flex flex-col items-center justify-center">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <div className="bg-blue-500/20 p-4 rounded-xl mb-4">
                  <Upload size={32} className="text-blue-400" />
                </div>
                <p className="mb-2 text-xl font-medium text-gray-200">Click to select a video</p>
                <p className="text-sm text-gray-400">MP4, WebM, or Ogg</p>
              </div>
              <input 
                type="file" 
                className="hidden" 
                accept="video/*"
                onChange={handleFileSelect}
              />
            </label>
          </div>
        ) : (
          <VideoProcessor file={selectedFile} />
        )}
      </main>
    </div>
  )
}

export default App