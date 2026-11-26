from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from database import Base

class Song(Base):
    __tablename__ = "songs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    artist = Column(String, index=True, nullable=False)
    genre = Column(String, index=True, default="Bollywood")
    album = Column(String, nullable=True)
    lyrics_hinglish = Column(Text, nullable=False)
    lyrics_hindi = Column(Text, nullable=False)
    lyrics_english = Column(Text, nullable=False)
    cover_art_url = Column(String, nullable=True)
    views = Column(Integer, default=0)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class ViewHistory(Base):
    __tablename__ = "view_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    song_id = Column(Integer, ForeignKey("songs.id"), index=True, nullable=False)
    viewed_at = Column(DateTime, default=datetime.utcnow)