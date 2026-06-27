from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    
    posts = relationship("Post", back_populates="user")
    
class Topic(Base):
    __tablename__ = "topics"
    
    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    
    ai_summary = Column(String, nullable=True)
    ai_vibe_score = Column(String, nullable=True)
    
    posts = relationship("Post", back_populates="topic")
    
class Post(Base):
    __tablename__ = "posts"
    
    id = Column(Integer, primary_key=True)
    content = Column(String(280), nullable=False)
    sentiment_score = Column(Float, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    
    user_id = Column(Integer, ForeignKey("users.id"))
    topic_id = Column(Integer, ForeignKey("topics.id"))
    
    user = relationship("User", back_populates="posts")
    topic = relationship("Topic", back_populates="posts")
    