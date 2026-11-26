from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, get_db, SessionLocal
import models
from lyric_service import fetch_and_prepare_song

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="GeetBeats API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def seed_songs():
    db = SessionLocal()
    if db.query(models.Song).count() == 0:
        sample_songs = [
            models.Song(
                title="Kesariya",
                artist="Arijit Singh",
                genre="Bollywood",
                album="Brahmastra",
                lyrics_hinglish="Mujhko itna bataye koi\nKaise tujhse dil na lagaye koi\nRabba ne tujhko banane mein\nKar di hain husn ki khaali tijoriyan",
                lyrics_hindi="मुझको इतना बताये कोई\nकैसे तुझसे दिल ना लगाये कोई\nरब्बा ने तुझको बनाने में\nकर दी हैं हुस्न की खाली तिजोरियाँ",
                lyrics_english="Someone tell me this much\nHow could anyone not fall in love with you\nIn creating you, God\nEmptied out all the treasuries of beauty",
                views=142500
            ),
            models.Song(
                title="295",
                artist="Sidhu Moose Wala",
                genre="Punjabi",
                album="Moosetape",
                lyrics_hinglish="Sach bolega taan milu 295\nJe karega tarakki putt hate milugi\nJe bolega sach taan milu 295",
                lyrics_hindi="सच बोलेगा तां मिलू 295\nजे करेगा तरक्की पुत्त हेट मिलूगी\nजे बोलेगा सच तां मिलू 295",
                lyrics_english="If you speak the truth, you'll get charged under Section 295\nIf you succeed, son, you'll face hate\nIf you speak the truth, you'll get 295",
                views=210800
            ),
            models.Song(
                title="Blinding Lights",
                artist="The Weeknd",
                genre="English",
                album="After Hours",
                lyrics_hinglish="I've been tryna call\nI've been on my own for long enough\nMaybe you can show me how to love, maybe",
                lyrics_hindi="आई हैव बीन ट्राइंग टू कॉल\nआई हैव बीन ऑन माय ओन फॉर लॉन्ग इनफ\nमेबी यू कैन शो मी हाउ टू लव, मेबी",
                lyrics_english="I've been trying to call\nI've been on my own for long enough\nMaybe you can show me how to love, maybe",
                views=315000
            ),
        ]
        db.add_all(sample_songs)
        db.commit()
    db.close()

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

    # Auto-fetch & save any searched song not yet in the database
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
    return song