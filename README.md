# 🎵 GeetBeats — Multi-Script Lyric Engine

**GeetBeats** is a full-stack music lyrics web application built with **React**, **FastAPI**, and **SQLite**. Designed with a high-contrast Midnight Indigo (`#0B0F19`) and Electric Saffron (`#FF6B00`) interface, GeetBeats lets users discover Bollywood, Punjabi, and English tracks, switch between **Hinglish**, **हिंदी (Devanagari)**, and **English** translations in a single click, and track their recently viewed lyrics history.

---

## ✨ Key Features

- **1-Click 3-Script Lyric Switcher:** Toggle instantly between **Hinglish**, **हिंदी (Hindi)**, and **English** translations on any track without page reloads.
- **Live Lyric Auto-Fetch & Translation:** Search for any song not yet in the database—GeetBeats automatically fetches lyrics via the Genius API, cleans metadata artifacts, translates them into Hindi and English, and caches the song locally.
- **Multi-Genre Catalog & Bulk Ingestion:** Filter tracks across **Bollywood**, **Punjabi**, and **English**, pre-populated via a duplicate-safe bulk importer (`bulk_import.py`).
- **User Authentication & Viewing History:** Sign up or sign in (secured with PBKDF2-SHA256 + random salt password hashing) to automatically log every opened song to a personal **My History** dashboard.
- **Resilient Full-Stack UX:** Built-in backend health detection with one-click retry recovery and a Windows batch launcher (`start_geetbeats.bat`) for instant local startup.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React, Vite, Tailwind CSS, Custom Vector SVG Logo |
| **Backend** | Python, FastAPI, Uvicorn, Pydantic |
| **Database** | SQLite (`geetbeats_v2.db`), SQLAlchemy ORM |
| **Integrations** | `lyricsgenius` (Genius API), `deep-translator` (Google Translate) |

---

## 📁 Project Structure

```text
geetbeats/
├── backend/
│   ├── main.py              # FastAPI REST endpoints (songs, auth, history, CORS)
│   ├── models.py            # SQLAlchemy ORM models (Song, User, ViewHistory)
│   ├── database.py          # SQLite engine, session management, and Base declaration
│   ├── lyric_service.py     # Genius API fetcher, regex cleaner, and 3-script translator
│   ├── bulk_import.py       # Automated multi-genre song ingestion script
│   └── geetbeats_v2.db      # Local SQLite database (auto-generated)
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Main UI, 3-script reader, auth modals, and history view
│   │   ├── GeetBeatsLogo.jsx# Custom double-eighth-note SVG brand mark
│   │   └── main.jsx         # React entry point
│   └── package.json
├── start_geetbeats.bat      # One-click Windows launcher for backend + frontend
└── README.md
🚀 Getting StartedPrerequisitesPython 3.10+Node.js 18+ & npmA free Genius API Client Access Token from genius.com/api-clients1. Clone the RepositoryBashgit clone [https://github.com/novapower12/geetbeats.git](https://github.com/novapower12/geetbeats.git)
cd geetbeats
2. Backend Setup (localhost:8000)Bashcd backend
python -m venv venv

# Activate virtual environment (Windows PowerShell)
.\venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn sqlalchemy pydantic lyricsgenius deep-translator python-dotenv
Create a .env file inside backend/ and add your Genius API token:Code snippetGENIUS_TOKEN=your_genius_client_access_token_here
(Optional) Populate the database with the starter Bollywood, Punjabi, and English catalog:Bashpython bulk_import.py
Start the FastAPI server:Bashuvicorn main:app --reload
3. Frontend Setup (localhost:5173)Open a second terminal in the project root:Bashcd frontend
npm install
npm run dev
Open http://localhost:5173 in your browser.⚡ Quick One-Click Launch (Windows)After initial setup, double-click start_geetbeats.bat in the root folder to automatically start both the FastAPI backend and Vite frontend and launch http://localhost:5173.🔌 API EndpointsMethodEndpointDescriptionGET/songs?genre=&search=List songs by genre/search; auto-fetches from Genius if no match existsGET/songs/{song_id}Retrieve a single song and increment its view counterPOST/auth/signupRegister a new user account with salted PBKDF2-SHA256 password hashingPOST/auth/loginAuthenticate an existing userPOST/historyRecord or update a signed-in user's viewed song timestampGET/users/{user_id}/historyFetch a user's 30 most recently viewed songs👨‍💻 AuthorShashikant BhartiGitHub: @novapower12Portfolio: shashikant-bharti.netlify.app