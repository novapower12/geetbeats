import hashlib
import secrets
from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import engine, get_db, SessionLocal
import models
from lyric_service import fetch_and_prepare_song

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="GeetBeats API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Request Schemas ---
class SignupRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class HistoryRecordRequest(BaseModel):
    user_id: int
    song_id: int

def hash_password(password: str, salt: str | None = None) -> str:
    salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 100_000).hex()
    return f"{salt}${digest}"

def verify_password(password: str, stored_hash: str) -> bool:
    salt, _ = stored_hash.split("$", 1)
    return hash_password(password, salt) == stored_hash

# --- Auth Endpoints ---
@app.post("/auth/signup")
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    email = payload.email.strip().lower()
    if not payload.name.strip() or not email or len(payload.password) < 4:
        raise HTTPException(status_code=400, detail="Enter name, valid email, and password (min 4 chars).")

    existing = db.query(models.User).filter(models.User.email == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered. Please sign in.")

    user = models.User(
        name=payload.name.strip(),
        email=email,
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"id": user.id, "name": user.name, "email": user.email}

@app.post("/auth/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    email = payload.email.strip().lower()
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    return {"id": user.id, "name": user.name, "email": user.email}

# --- Song & History Endpoints ---
@app.get("/songs")
def list_songs(genre: str = "All", search: str = "", db: Session = Depends(get_db)):
    query = db.query(models.Song)
    if genre != "All":
        query = query.filter(models.Song.genre.ilike(genre))
    if search:
        query = query.filter(
            (models.Song.title.ilike(f"%{search}%")) | (models.Song.artist.ilike(f"%{search}%"))
        )
    results = query.all()

    if search and len(search.strip()) >= 3 and len(results) == 0:
        detected_genre = genre if genre != "All" else "Bollywood"
        fetched = fetch_and_prepare_song(search.strip(), genre=detected_genre)
        if fetched:
            new_song = models.Song(**fetched, views=1)
            db.add(new_song)
            db.commit()
            db.refresh(new_song)
            results = [new_song]

    return results

@app.get("/songs/{song_id}")
def get_song(song_id: int, db: Session = Depends(get_db)):
    song = db.query(models.Song).filter(models.Song.id == song_id).first()
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")
    song.views += 1
    db.commit()
    db.refresh(song)
    return song

@app.post("/history")
def record_history(payload: HistoryRecordRequest, db: Session = Depends(get_db)):
    existing = (
        db.query(models.ViewHistory)
        .filter(
            models.ViewHistory.user_id == payload.user_id,
            models.ViewHistory.song_id == payload.song_id,
        )
        .first()
    )
    if existing:
        existing.viewed_at = datetime.utcnow()
    else:
        entry = models.ViewHistory(user_id=payload.user_id, song_id=payload.song_id)
        db.add(entry)
    db.commit()
    return {"status": "saved"}

@app.get("/users/{user_id}/history")
def get_user_history(user_id: int, db: Session = Depends(get_db)):
    rows = (
        db.query(models.ViewHistory, models.Song)
        .join(models.Song, models.ViewHistory.song_id == models.Song.id)
        .filter(models.ViewHistory.user_id == user_id)
        .order_by(models.ViewHistory.viewed_at.desc())
        .limit(30)
        .all()
    )
    return [
        {
            "history_id": history.id,
            "viewed_at": history.viewed_at.isoformat(),
            "song": {
                "id": song.id,
                "title": song.title,
                "artist": song.artist,
                "genre": song.genre,
                "album": song.album,
                "lyrics_hinglish": song.lyrics_hinglish,
                "lyrics_hindi": song.lyrics_hindi,
                "lyrics_english": song.lyrics_english,
                "cover_art_url": song.cover_art_url,
                "views": song.views,
            },
        }
        for history, song in rows
    ]