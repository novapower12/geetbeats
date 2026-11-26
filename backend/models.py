from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime, timezone

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(120), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    beat_score = Column(Integer, default=0)
    is_verified = Column(Boolean, default=False)

class Song(Base):
    __tablename__ = "songs"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), index=True, nullable=False)
    artist = Column(String(150), index=True, nullable=False)
    genre = Column(String(30), index=True, default="Bollywood")  # Bollywood, Punjabi, English
    album = Column(String(150), nullable=True)
    
    # Multi-script & translated lyrics
    lyrics_hinglish = Column(Text, nullable=False)
    lyrics_hindi = Column(Text, nullable=True)
    lyrics_english = Column(Text, nullable=True)
    
    cover_art_url = Column(String(500), nullable=True)
    views = Column(Integer, default=0)
    annotations = relationship("Annotation", back_populates="song", cascade="all, delete-orphan")

class Annotation(Base):
    __tablename__ = "annotations"
    id = Column(Integer, primary_key=True, index=True)
    song_id = Column(Integer, ForeignKey("songs.id"), nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    language_tab = Column(String(20), default="hinglish")  # hinglish, hindi, english
    start_index = Column(Integer, nullable=False)
    end_index = Column(Integer, nullable=False)
    explanation = Column(Text, nullable=False)
    upvotes = Column(Integer, default=1)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    song = relationship("Song", back_populates="annotations")
    