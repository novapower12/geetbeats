import { useEffect, useState } from "react";
import GeetBeatsLogo from "./GeetBeatsLogo";

const API_URL = "http://localhost:8000";

export default function App() {
  const [songs, setSongs] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [search, setSearch] = useState("");
  const [activeSong, setActiveSong] = useState(null);
  const [script, setScript] = useState("hinglish");
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);
  const [retryTick, setRetryTick] = useState(0);

  // Auth & History state
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("geetbeats_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [viewMode, setViewMode] = useState("browse");
  const [historyList, setHistoryList] = useState([]);

  useEffect(() => {
    setLoading(true);
    setApiError(false);
    const params = new URLSearchParams();
    if (selectedGenre !== "All") params.append("genre", selectedGenre);
    if (search.trim()) params.append("search", search.trim());

    fetch(`${API_URL}/songs?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error("Server error");
        return res.json();
      })
      .then((data) => {
        setSongs(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setApiError(true);
        setLoading(false);
      });
  }, [selectedGenre, search, retryTick]);

  const fetchHistory = async (userId) => {
    try {
      const res = await fetch(`${API_URL}/users/${userId}/history`);
      const data = await res.json();
      setHistoryList(Array.isArray(data) ? data : []);
    } catch {
      setHistoryList([]);
    }
  };

  useEffect(() => {
    if (user && viewMode === "history") {
      fetchHistory(user.id);
    }
  }, [user, viewMode]);

  const handleOpenSong = async (song) => {
    setActiveSong(song);
    if (user) {
      await fetch(`${API_URL}/history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id, song_id: song.id }),
      });
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    const endpoint = authMode === "signup" ? "/auth/signup" : "/auth/login";
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.detail || "Authentication failed");
        return;
      }
      localStorage.setItem("geetbeats_user", JSON.stringify(data));
      setUser(data);
      setShowAuthModal(false);
      setAuthForm({ name: "", email: "", password: "" });
    } catch {
      setAuthError("Backend offline. Start uvicorn on port 8000 first.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("geetbeats_user");
    setUser(null);
    setViewMode("browse");
    setHistoryList([]);
  };

  const getLyricsByScript = (song) => {
    if (script === "hindi") return song.lyrics_hindi;
    if (script === "english") return song.lyrics_english;
    return song.lyrics_hinglish;
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 font-sans">
      {/* Top Navbar */}
      <header className="bg-[#FF6B00] text-[#0B0F19] sticky top-0 z-30 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                setActiveSong(null);
                setViewMode("browse");
              }}
              className="flex items-center cursor-pointer hover:opacity-90 transition"
            >
              <GeetBeatsLogo className="h-9 w-auto" />
            </button>
            <nav className="hidden sm:flex items-center gap-5 text-xs font-extrabold tracking-wider">
              <button
                onClick={() => {
                  setActiveSong(null);
                  setViewMode("browse");
                }}
                className={`cursor-pointer hover:underline ${
                  viewMode === "browse" && !activeSong ? "underline" : ""
                }`}
              >
                DISCOVER
              </button>
              <button
                onClick={() => {
                  if (!user) {
                    setAuthMode("login");
                    setShowAuthModal(true);
                    return;
                  }
                  setActiveSong(null);
                  setViewMode("history");
                }}
                className={`cursor-pointer hover:underline ${
                  viewMode === "history" && !activeSong ? "underline" : ""
                }`}
              >
                MY HISTORY
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-3 flex-1 sm:flex-initial justify-end">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setActiveSong(null);
                setViewMode("browse");
              }}
              placeholder="Search lyrics, artists, beats..."
              className="w-full sm:w-64 px-3.5 py-1.5 rounded-full bg-[#0B0F19]/15 placeholder-[#0B0F19]/70 text-[#0B0F19] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0B0F19]"
            />

            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setActiveSong(null);
                    setViewMode("history");
                  }}
                  className="px-3.5 py-1.5 rounded-full bg-[#0B0F19] text-[#FF6B00] text-xs font-bold tracking-wide cursor-pointer hover:opacity-90"
                >
                  Hi, {user.name.split(" ")[0]}
                </button>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-full border border-[#0B0F19] text-[#0B0F19] text-xs font-bold cursor-pointer hover:bg-[#0B0F19] hover:text-white transition"
                >
                  LOG OUT
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthError("");
                  setShowAuthModal(true);
                }}
                className="px-4 py-1.5 rounded-full bg-[#0B0F19] text-white text-xs font-extrabold tracking-wider cursor-pointer hover:bg-slate-900 transition"
              >
                SIGN IN
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeSong ? (
          <div className="bg-[#121826] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
            <button
              onClick={() => setActiveSong(null)}
              className="text-xs font-bold text-[#FF6B00] hover:underline mb-6 inline-block cursor-pointer"
            >
              ← Back to {viewMode === "history" ? "My History" : "Tracks"}
            </button>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div className="flex items-center gap-4">
                {activeSong.cover_art_url && (
                  <img
                    src={activeSong.cover_art_url}
                    alt={activeSong.title}
                    className="w-20 h-20 rounded-xl object-cover border border-slate-700"
                  />
                )}
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded bg-[#FF6B00]/15 text-[#FF6B00] text-[11px] font-bold uppercase tracking-wider mb-1.5">
                    {activeSong.genre}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-white">
                    {activeSong.title}
                  </h1>
                  <p className="text-slate-400 text-sm mt-0.5">
                    {activeSong.artist}
                    {activeSong.album ? ` • ${activeSong.album}` : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center bg-[#0B0F19] p-1 rounded-full border border-slate-800 self-start">
                {[
                  { id: "hinglish", label: "Hinglish" },
                  { id: "hindi", label: "हिंदी" },
                  { id: "english", label: "English" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setScript(tab.id)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                      script === tab.id
                        ? "bg-[#FF6B00] text-[#0B0F19]"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {!user && (
              <div className="mt-4 px-4 py-2.5 rounded-xl bg-[#FF6B00]/10 border border-[#FF6B00]/30 text-xs text-slate-300 flex items-center justify-between">
                <span>Sign in to automatically save this song to your reading history.</span>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="text-[#FF6B00] font-bold hover:underline cursor-pointer"
                >
                  Sign In →
                </button>
              </div>
            )}

            <pre className="mt-6 whitespace-pre-wrap font-sans text-base sm:text-lg leading-relaxed text-slate-200">
              {getLyricsByScript(activeSong)}
            </pre>
          </div>
        ) : viewMode === "history" && user ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-white">
                  {user.name}'s Viewed Lyrics History
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  Tracks you opened recently on GeetBeats.
                </p>
              </div>
              <button
                onClick={() => setViewMode("browse")}
                className="px-4 py-2 rounded-full bg-[#121826] border border-slate-700 text-xs font-bold hover:border-[#FF6B00] cursor-pointer"
              >
                Browse All Songs
              </button>
            </div>

            {historyList.length === 0 ? (
              <div className="bg-[#121826] border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
                You haven't opened any lyrics while signed in yet. Click any song in Discover to start building your history!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {historyList.map(({ history_id, viewed_at, song }) => (
                  <div
                    key={history_id}
                    onClick={() => handleOpenSong(song)}
                    className="bg-[#121826] border border-slate-800 hover:border-[#FF6B00] rounded-2xl p-5 cursor-pointer transition group"
                  >
                    <div className="flex items-center justify-between text-xs mb-3">
                      <span className="px-2.5 py-0.5 rounded bg-[#FF6B00]/15 text-[#FF6B00] font-bold uppercase">
                        {song.genre}
                      </span>
                      <span className="text-slate-500">
                        Viewed {new Date(viewed_at + "Z").toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-lg font-extrabold text-white group-hover:text-[#FF6B00] transition">
                      {song.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {song.artist}
                      {song.album ? ` • ${song.album}` : ""}
                    </p>
                    <p className="mt-4 pl-3 border-l-2 border-[#FF6B00] text-xs italic text-slate-300 line-clamp-1">
                      "{song.lyrics_hinglish?.split("\n")[0]}..."
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            <section className="bg-[#121826] border border-slate-800 rounded-2xl p-6 sm:p-10 mb-8">
              <p className="text-xs font-extrabold tracking-widest text-[#FF6B00] uppercase mb-2">
                ✨ MULTI-SCRIPT LYRIC ENGINE
              </p>
              <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight max-w-2xl">
                Read Bollywood, Punjabi & English Lyrics Your Way.
              </h1>
              <p className="text-slate-400 text-sm sm:text-base mt-3 max-w-xl">
                Switch seamlessly between Hinglish, हिंदी (Devanagari), and English translations on every track.
              </p>
            </section>

            {/* Genre Filter Pills */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                {["All", "Bollywood", "Punjabi", "English"].map((genre) => (
                  <button
                    key={genre}
                    onClick={() => setSelectedGenre(genre)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                      selectedGenre === genre
                        ? "bg-[#FF6B00] text-[#0B0F19]"
                        : "bg-[#121826] text-slate-300 border border-slate-800 hover:border-slate-600"
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
              <span className="text-xs font-bold text-slate-500 tracking-wider">
                SHOWING {songs.length} TRACK{songs.length === 1 ? "" : "S"}
              </span>
            </div>

            {loading ? (
              <p className="text-slate-400 text-sm">Loading tracks...</p>
            ) : apiError ? (
              <div className="bg-red-950/40 border border-red-500/40 rounded-2xl p-6 text-sm text-red-200 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-red-400">Backend Kitchen is Offline (Port 8000)</p>
                  <p className="text-xs text-slate-300 mt-1">
                    Run <code className="text-[#FF6B00]">uvicorn main:app --reload</code> inside <code className="text-[#FF6B00]">backend</code> (with <code className="text-[#FF6B00]">(venv)</code> active), then click Retry.
                  </p>
                </div>
                <button
                  onClick={() => setRetryTick((n) => n + 1)}
                  className="px-4 py-2 rounded-full bg-[#FF6B00] text-[#0B0F19] font-bold text-xs cursor-pointer"
                >
                  Retry Connection
                </button>
              </div>
            ) : songs.length === 0 ? (
              <p className="text-slate-400 text-sm">No matching tracks found.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {songs.map((song) => (
                  <div
                    key={song.id}
                    onClick={() => handleOpenSong(song)}
                    className="bg-[#121826] border border-slate-800 hover:border-[#FF6B00] rounded-2xl p-5 cursor-pointer transition flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-3">
                        <span className="px-2.5 py-0.5 rounded bg-[#FF6B00]/15 text-[#FF6B00] font-bold uppercase">
                          {song.genre}
                        </span>
                        <span className="text-slate-500">
                          👁 {song.views?.toLocaleString() || 0}
                        </span>
                      </div>
                      <h3 className="text-lg font-extrabold text-white group-hover:text-[#FF6B00] transition">
                        {song.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {song.artist}
                        {song.album ? ` • ${song.album}` : ""}
                      </p>
                      <p className="mt-4 pl-3 border-l-2 border-[#FF6B00] text-xs italic text-slate-300 line-clamp-1">
                        "{song.lyrics_hinglish?.split("\n")[0]}..."
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Hinglish • हिंदी • English</span>
                      <span className="text-[#FF6B00] font-bold">Read Lyrics →</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Sign In / Sign Up Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#121826] border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black text-white">
                {authMode === "signup" ? "Create GeetBeats Account" : "Sign In to GeetBeats"}
              </h2>
              <button
                onClick={() => setShowAuthModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === "signup" && (
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={authForm.name}
                    onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                    placeholder="Shashikant Bharti"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0B0F19] border border-slate-700 text-sm text-white focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={authForm.email}
                  onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0B0F19] border border-slate-700 text-sm text-white focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  minLength={4}
                  value={authForm.password}
                  onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0B0F19] border border-slate-700 text-sm text-white focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              {authError && (
                <p className="text-xs text-red-400 font-semibold">{authError}</p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#FF6B00] text-[#0B0F19] font-extrabold text-sm cursor-pointer hover:opacity-95 transition"
              >
                {authMode === "signup" ? "Create Account" : "Sign In"}
              </button>
            </form>

            <p className="mt-4 text-center text-xs text-slate-400">
              {authMode === "signup" ? "Already have an account?" : "New to GeetBeats?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setAuthError("");
                  setAuthMode(authMode === "signup" ? "login" : "signup");
                }}
                className="text-[#FF6B00] font-bold hover:underline cursor-pointer"
              >
                {authMode === "signup" ? "Sign In" : "Create an account"}
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}