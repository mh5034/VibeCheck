from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# Auth
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    
class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    
# Topic

class TopicCreate(BaseModel):
    name: str
    
class TopicResponse(BaseModel):
    id: int
    name: str
    vibe_score: Optional[float] = None
    post_count: int = 0
    
    class Config:
        from_attributes = True
        
class TopicDetailResponse(BaseModel):
    id: int
    name: str
    vibe_score: Optional[float] = None
    summary: Optional[str] = None
    posts: list["PostResponse"] = []

    class Config:
        from_attributes = True
        
# Post
class PostCreate(BaseModel):
    content: str
    
class PostResponse(BaseModel):
    id: int
    content: str
    sentiment_score: Optional[float] = None
    created_at: datetime
    
    class Config:
        from_attributes = True