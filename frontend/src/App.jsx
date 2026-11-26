import { useState, useEffect } from "react";
import { Music, Globe, Eye, ArrowLeft, Sparkles } from "lucide-react";
import Navbar from "./components/Navbar";

const API_URL = "http://127.0.0.1:8000";
const GENRES = ["All", "Bollywood", "Punjabi", "English"];

export default function App() {
  const [songs, setSongs] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSong, setActiveSong] = useState(null);
  const [scriptMode, setScriptMode] = useState("hinglish"); // "hinglish" | "hindi" | "english"
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSongs = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          genre: selectedGenre,
          search: searchQuery,
        });
        const res = await fetch(`${API_URL}/songs?${params}`);
        const data = await res.json();
        setSongs(data);
      } catch (err) {
        console.error("Failed to fetch songs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSongs();
  }, [selectedGenre, searchQuery]);

  const getDisplayedLyrics = (song) => {
    if (!song) return "";
    if (scriptMode === "hindi") return song.lyrics_hindi || song.lyrics_hinglish;
    if (scriptMode === "english") return song.lyrics_english || song.lyrics_hinglish;
    return song.lyrics_hinglish;
  };

  return (
    <div className="min-h-screen bg-geet-dark text-white font-sans">
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {!activeSong ? (
          <>
            {/* Hero Banner */}
            <div className="bg-geet-card border border-geet-border rounded-2xl p-6 md:p-8 mb-8">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-geet-saffron">
                <Sparkles className="w-4 h-4" /> Multi-Script Lyric Engine
              </span>
              <h1 className="text-3xl md:text-5xl font-extrabold mt-2 leading-tight">
                Read Bollywood, Punjabi & English Lyrics Your Way.
              </h1>
              <p className="text-gray-400 mt-2 text-base md:text-lg max-w-2xl">
                Switch seamlessly between Hinglish, हिंदी (Devanagari), and English translations on every track.
              </p>
            </div>

            {/* Genre Filter Pills */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                {GENRES.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => setSelectedGenre(genre)}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition ${
                      selectedGenre === genre
                        ? "bg-geet-saffron text-geet-dark shadow"
                        : "bg-geet-card text-gray-300 border border-geet-border hover:border-geet-saffron"
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
              <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                Showing {songs.length} {songs.length === 1 ? "Track" : "Tracks"}
              </span>
            </div>

            {/* Songs Grid */}
            {loading ? (
              <p className="text-gray-400 py-10">Loading tracks...</p>
            ) : songs.length === 0 ? (
              <div className="bg-geet-card border border-geet-border rounded-xl p-8 text-center text-gray-400">
                No songs matched your filter. Try another genre or search term.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {songs.map((song) => (
                  <div
                    key={song.id}
                    onClick={() => {
                      setActiveSong(song);
                      setScriptMode("hinglish");
                    }}
                    className="group cursor-pointer bg-geet-card border border-geet-border hover:border-geet-saffron rounded-xl p-5 transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded bg-geet-saffron/15 text-geet-saffron">
                          {song.genre}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Eye className="w-3.5 h-3.5" />
                          {song.views.toLocaleString()}
                        </span>
                      </div>
                      <h2 className="text-xl font-extrabold group-hover:text-geet-saffron transition">
                        {song.title}
                      </h2>
                      <p className="text-sm text-gray-400 font-medium mt-0.5">
                        {song.artist} {song.album ? `• ${song.album}` : ""}
                      </p>
                      <p className="text-sm text-gray-300 font-lyrics italic mt-4 line-clamp-2 border-l-2 border-geet-highlight pl-3">
                        "{song.lyrics_hinglish.split("\n")[0]}..."
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-geet-border flex items-center justify-between text-xs text-geet-highlight font-semibold">
                      <span className="flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5" /> Hinglish • हिंदी • English
                      </span>
                      <span>Read Lyrics →</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          /* Single Song & 3-Language Lyric Reader View */
          <div>
            <button
              onClick={() => setActiveSong(null)}
              className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-geet-saffron mb-6 transition"
            >
              <ArrowLeft className="w-4 h-4" /> Back to All Songs
            </button>

            <div className="bg-geet-card border border-geet-border rounded-2xl p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-geet-border">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-geet-saffron text-geet-dark">
                    {activeSong.genre}
                  </span>
                  <h1 className="text-3xl md:text-4xl font-black mt-3">
                    {activeSong.title}
                  </h1>
                  <p className="text-gray-300 text-lg font-medium mt-1">
                    {activeSong.artist}
                    {activeSong.album && (
                      <span className="text-gray-500"> • {activeSong.album}</span>
                    )}
                  </p>
                </div>

                {/* 3-Script Language Toggle */}
                <div className="flex items-center gap-2 bg-geet-dark p-1.5 rounded-xl border border-geet-border self-start">
                  {[
                    { id: "hinglish", label: "Hinglish" },
                    { id: "hindi", label: "हिंदी (Hindi)" },
                    { id: "english", label: "English" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setScriptMode(tab.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
                        scriptMode === tab.id
                          ? "bg-geet-highlight text-geet-dark shadow"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lyrics Display */}
              <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-400 font-bold mb-4">
                    <Music className="w-4 h-4 text-geet-saffron" />
                    <span>
                      Reading in{" "}
                      <strong className="text-geet-highlight">{scriptMode}</strong>
                    </span>
                  </div>
                  <pre className="whitespace-pre-wrap font-lyrics text-xl md:text-2xl leading-relaxed text-gray-100">
                    {getDisplayedLyrics(activeSong)}
                  </pre>
                </div>

                {/* Side Info Card */}
                <div className="bg-geet-dark/60 border border-geet-border rounded-xl p-5 h-fit">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-geet-saffron">
                    About This Track
                  </h3>
                  <p className="text-sm text-gray-300 mt-3 leading-relaxed">
                    Use the script switcher above to toggle between Romanized{" "}
                    <strong>Hinglish</strong>, native <strong>हिंदी</strong>{" "}
                    Devanagari script, and <strong>English</strong> translation.
                  </p>
                  <div className="mt-4 pt-4 border-t border-geet-border text-xs text-gray-400 flex justify-between">
                    <span>Total Reads</span>
                    <span className="text-white font-bold">
                      {activeSong.views.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}