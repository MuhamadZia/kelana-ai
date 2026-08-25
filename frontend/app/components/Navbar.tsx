export default function Navbar() {
  return (
    <header className="w-full border-b border-maroon/10 bg-cream/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Left nav links */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#" className="text-sm text-maroon/70 hover:text-maroon transition-colors">About</a>
          <a href="#" className="text-sm text-maroon/70 hover:text-maroon transition-colors">Destinations</a>
          <a href="#" className="text-sm text-maroon/70 hover:text-maroon transition-colors">Community</a>
          <a href="#" className="text-sm text-maroon/70 hover:text-maroon transition-colors">Contacts</a>
        </nav>

        {/* Logo */}
        <div className="flex flex-col items-center leading-none">
          <span className="font-serif text-xl font-bold text-maroon tracking-tight">
            <span className="text-orange">K</span>elana
          </span>
          <span className="text-xs font-semibold text-orange tracking-widest uppercase">AI</span>
        </div>

        {/* Right auth links */}
        <div className="flex items-center gap-4">
          <a href="#" className="text-sm text-maroon/70 hover:text-maroon transition-colors">Sign In</a>
          <a
            href="#"
            className="text-sm font-medium border border-maroon text-maroon px-4 py-1.5 rounded-full hover:bg-maroon hover:text-cream transition-all"
          >
            Sign up
          </a>
        </div>
      </div>
    </header>
  );
}
