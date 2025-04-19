const Header = () => {
  return (
    <header className="glass-bg border-b border-white/5">
      <div className="container mx-auto px-6 py-4">
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center space-x-5">
            <div className="w-16 h-16 flex items-center justify-center">
              <img 
                src="images/logo.png" 
                alt="ClearUFO.space Logo" 
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-white text-center">Cloak Detect App</h1>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
