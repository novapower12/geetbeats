import os
import re
import lyricsgenius
from deep_translator import GoogleTranslator

GENIUS_TOKEN = os.getenv("GENIUS_TOKEN", "FlEsesJUn5fUm9dWU1LnaI4K-wjGb6hpqJ3NKIEJOCcEzQvhroPCsMHgmfAjqmRg")

genius = lyricsgenius.Genius(
    GENIUS_TOKEN,
    skip_non_songs=True,
    excluded_terms=["(Remix)", "(Live)"],
    remove_section_headers=False,
)

def clean_lyrics(raw_text: str) -> str:
    lines = raw_text.splitlines()
    if lines and "Lyrics" in lines[0]:
        lines = lines[1:]
    cleaned = "\n".join(lines)
    cleaned = re.sub(r"\d*Embed$", "", cleaned).strip()
    return cleaned

def generate_three_scripts(raw_lyrics: str, genre: str) -> dict:
    chunk = raw_lyrics[:4500]
    try:
        hindi_text = GoogleTranslator(source="auto", target="hi").translate(chunk)
    except Exception:
        hindi_text = chunk

    try:
        english_text = GoogleTranslator(source="auto", target="en").translate(chunk)
    except Exception:
        english_text = chunk

    return {
        "lyrics_hinglish": chunk,
        "lyrics_hindi": hindi_text,
        "lyrics_english": english_text,
    }

def fetch_and_prepare_song(title: str, artist: str = "", genre: str = "Bollywood") -> dict | None:
    song = genius.search_song(title, artist) if artist else genius.search_song(title)
    if not song or not song.lyrics:
        return None

    cleaned = clean_lyrics(song.lyrics)
    scripts = generate_three_scripts(cleaned, genre)

    raw_album = getattr(song, "album", None)
    if isinstance(raw_album, dict):
        album_name = raw_album.get("name")
    elif raw_album:
        album_name = str(raw_album)
    else:
        album_name = None

    return {
        "title": song.title,
        "artist": song.artist,
        "genre": genre,
        "album": album_name,
        "cover_art_url": song.song_art_image_url,
        **scripts,
    }