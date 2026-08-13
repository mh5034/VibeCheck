from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime


# Auth
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    
    @field_validator('password')
    @classmethod
    def password_min_length(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters')
        return v
    
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
        
# Dashboard
class DashboardPost(BaseModel):
    id: int
    content: str
    sentiment_score: Optional[float] = None
    topic_name: str
    created_at: datetime
    
    class Config: 
        from_attributes = True
        
class DashboardResponse(BaseModel):
    email: str
    total_posts: int
    avg_sentiment: Optional[float] = None
    posts: list[DashboardPost] = []