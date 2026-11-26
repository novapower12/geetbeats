import { Search, Music2 } from "lucide-react";

export default function Navbar({ searchQuery, setSearchQuery }) {
  return (
    <header className="sticky top-0 z-50 bg-geet-saffron text-geet-dark shadow-md">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <a href="/" className="flex items-center gap-2 font-black text-2xl tracking-tighter uppercase">
            <Music2 className="w-6 h-6 stroke-[2.5]" />
            <span>GeetBeats</span>
          </a>
          <nav className="hidden md:flex items-center gap-5 text-sm font-bold uppercase tracking-wide">
            <a href="#charts" className="hover:opacity-75 transition">Charts</a>
            <a href="#videos" className="hover:opacity-75 transition">Videos</a>
            <a href="#discover" className="hover:opacity-75 transition">Discover</a>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search lyrics, artists, beats..."
              className="bg-geet-dark/10 placeholder-geet-dark/70 text-geet-dark text-sm font-medium pl-3 pr-9 py-1.5 rounded-full focus:outline-none focus:ring-2 focus:ring-geet-dark w-48 sm:w-64"
            />
            <Search className="w-4 h-4 absolute right-3 top-2 text-geet-dark/80" />
          </div>
          <button className="bg-geet-dark text-white text-xs font-bold uppercase px-4 py-2 rounded-full hover:bg-geet-card transition">
            Sign In
          </button>
        </div>
      </div>
    </header>
  );
}