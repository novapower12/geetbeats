import { useEffect, useState } from "react";

const API_URL = "http://localhost:8000";
const FLIP_INTERVAL = 5000; // 5 seconds

// label shown on card -> genre value stored in the database
const LANGUAGES = [
  { label: "Punjabi", genre: "Punjabi" },
  { label: "Hindi", genre: "Bollywood" },
  { label: "English", genre: "English" },
];

export default function TopChartFlipCards({ onOpenSong }) {
  const [tops, setTops] = useState({});
  const [flipped, setFlipped] = useState(false);
  const [paused, setPaused] = useState(false);

  // Load songs once and pick the most-viewed song per language
  useEffect(() => {
    fetch(`${API_URL}/songs`)
      .then((res) => res.json())
      .then((data) => {
        const result = {};
        (Array.isArray(data) ? data : []).forEach((song) => {
          const key = song.genre?.toLowerCase();
          if (!result[key] || (song.views || 0) > (result[key].views || 0)) {
            result[key] = song;
          }
        });
        setTops(result);
      })
      .catch(() => setTops({}));
  }, []);

  // Flip every 5 seconds (stops while the mouse is over the cards)
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => setFlipped((f) => !f), FLIP_INTERVAL);
    return () => clearInterval(timer);
  }, [paused]);

  return (
    <div
      className="grid grid-cols-3 gap-3 w-full lg:w-[460px] shrink-0"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {LANGUAGES.map(({ label, genre }, i) => {
        const song = tops[genre.toLowerCase()];
        return (
          <div
            key={label}
            role="button"
            tabIndex={song ? 0 : -1}
            aria-label={song ? `Open ${song.title}` : `${label} top song`}
            onClick={() => song && onOpenSong(song)}
            onKeyDown={(e) => {
              if (song && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                onOpenSong(song);
              }
            }}
            className={`flip-scene h-56 transition-transform duration-200 ${
              song ? "cursor-pointer hover:-translate-y-1" : "cursor-default"
            }`}
          >
            <div
              className={`flip-card ${flipped ? "is-flipped" : ""}`}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              {/* FRONT */}
              <div className="flip-face bg-[#0B0F19] border border-slate-800 p-3 flex flex-col justify-between">
                <span className="text-[10px] font-extrabold tracking-widest text-[#FF6B00] uppercase">
                  #1 {label}
                </span>
                {song ? (
                  <>
                    {song.cover_art_url ? (
                      <img
                        src={song.cover_art_url}
                        alt={song.title}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-20 rounded-lg bg-[#FF6B00]/15 flex items-center justify-center text-3xl">
                        🎵
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm font-extrabold text-white leading-tight line-clamp-2">
                        {song.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{song.artist}</p>
                      <p className="text-[10px] text-[#FF6B00] font-bold mt-1">Tap to read →</p>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-slate-500">No song yet</p>
                )}
              </div>

              {/* BACK */}
              <div className="flip-face flip-back bg-[#FF6B00] text-[#0B0F19] p-3 flex flex-col justify-between">
                <span className="text-[10px] font-extrabold tracking-widest uppercase">
                  👁 {song?.views?.toLocaleString() || 0} views
                </span>
                {song && (
                  <>
                    <p className="text-xs italic font-semibold line-clamp-4">
                      “{song.lyrics_hinglish?.split("\n").slice(0, 2).join(" ")}...”
                    </p>
                    <span className="block w-full py-1.5 rounded-full bg-[#0B0F19] text-white text-center text-[11px] font-bold">
                      Read Lyrics →
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}