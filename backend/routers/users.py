from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func 
from database import get_db
from auth import get_current_user
import models, schemas


router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=schemas.DashboardResponse)
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    posts = db.query(models.Post)\
        .filter(models.Post.user_id == current_user.id)\
            .order_by(models.Post.created_at.desc())\
                .all()
                
    avg_score = db.query(func.avg(models.Post.sentiment_score))\
        .filter(models.Post.user_id == current_user.id)\
            .scalar()
            
    return schemas.DashboardResponse(
        email = current_user.email,
        total_posts = len(posts),
        avg_sentiment = round(avg_score, 1) if avg_score else None,
        posts = [schemas.DashboardPost(
            id=p.id,
            content=p.content, 
            sentiment_score=p.sentiment_score,
            topic_name=p.topic.name,
            created_at=p.created_at
        ) for p in posts])
     