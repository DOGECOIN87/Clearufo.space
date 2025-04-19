import {  } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="glass-bg border-t border-white/5 mt-8">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-center items-center">
          <a 
            href="https://www.tiktok.com/@clearufo.space" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            title="Follow us on TikTok"
          >
            <div className="w-8 h-8 flex items-center justify-center bg-black rounded-full">
              <svg 
                viewBox="0 0 24 24" 
                className="w-5 h-5 text-white fill-current"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"></path>
              </svg>
            </div>
            <span className="text-sm font-medium text-white">Follow us on TikTok</span>
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
