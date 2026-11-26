/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        geet: {
          dark: "#0B0F19",       // Midnight dark background
          card: "#151C2C",       // Card background
          border: "#232D42",     // Subtle borders
          saffron: "#FF6B00",    // GeetBeats orange header & buttons
          amber: "#FFB800",      // Accent highlights
          highlight: "#06B6D4",  // Glowing cyan for annotated lyrics
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        lyrics: ["Lora", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};