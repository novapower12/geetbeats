from database import SessionLocal, engine
import models
from lyric_service import fetch_and_prepare_song

models.Base.metadata.create_all(bind=engine)

SONG_CATALOG = [
    # Bollywood
    ("Tum Hi Ho", "Arijit Singh", "Bollywood"),
    ("Apna Bana Le", "Arijit Singh", "Bollywood"),
    ("Channa Mereya", "Arijit Singh", "Bollywood"),
    ("Chaleya", "Arijit Singh", "Bollywood"),
    ("Raataan Lambiyan", "Jubin Nautiyal", "Bollywood"),
    ("Tera Ban Jaunga", "Akhil Sachdeva", "Bollywood"),
    ("Agar Tum Saath Ho", "Alka Yagnik, Arijit Singh", "Bollywood"),
    # Punjabi
    ("Lover", "Diljit Dosanjh", "Punjabi"),
    ("Born to Shine", "Diljit Dosanjh", "Punjabi"),
    ("Softly", "Karan Aujla", "Punjabi"),
    ("Tauba Tauba", "Karan Aujla", "Punjabi"),
    ("Excuses", "AP Dhillon", "Punjabi"),
    ("Brown Munde", "AP Dhillon", "Punjabi"),
    ("So High", "Sidhu Moose Wala", "Punjabi"),
    # English
    ("Shape of You", "Ed Sheeran", "English"),
    ("Perfect", "Ed Sheeran", "English"),
    ("Starboy", "The Weeknd", "English"),
    ("Believer", "Imagine Dragons", "English"),
    ("Cruel Summer", "Taylor Swift", "English"),
]

def run_bulk_import():
    db = SessionLocal()
    added = 0
    for title, artist, genre in SONG_CATALOG:
        exists = db.query(models.Song).filter(models.Song.title.ilike(f"%{title}%")).first()
        if exists:
            print(f"Skipping (already exists): {title}")
            continue

        print(f"Fetching & translating: {title} - {artist} ({genre})...")
        data = fetch_and_prepare_song(title, artist, genre)
        if data:
            new_song = models.Song(**data, views=1000)
            db.add(new_song)
            db.commit()
            added += 1
            print(f"  -> Saved: {data['title']}")
        else:
            print(f"  -> Could not find: {title}")

    db.close()
    print(f"\nDone! Added {added} new songs to GeetBeats.")

if __name__ == "__main__":
    run_bulk_import()