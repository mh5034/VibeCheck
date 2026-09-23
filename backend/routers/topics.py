from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import schemas, models
from sqlalchemy import func
from database import get_db
from auth import get_current_user
from ai import get_sentiment, get_topic_summary

router = APIRouter(prefix="/topics", tags=["topics"])

# Get all topics
@router.get("", response_model=list[schemas.TopicResponse])
def get_topics(db: Session = Depends(get_db)):
    # Count in SQL instead of lazily loading every topic's entire post history.
    topics = (
        db.query(
            models.Topic.id,
            models.Topic.name,
            models.Topic.ai_vibe_score,
            func.count(models.Post.id).label("post_count"),
        )
        .outerjoin(models.Post, models.Post.topic_id == models.Topic.id)
        .group_by(models.Topic.id, models.Topic.name, models.Topic.ai_vibe_score)
        .order_by(models.Topic.id.desc())
        .all()
    )
    
    result = []
    for topic in topics:        
        result.append(schemas.TopicResponse(
            id=topic.id,
            name=topic.name,
            vibe_score=topic.ai_vibe_score,
            post_count=topic.post_count
        ))
        
    return result

# Post create topic
@router.post("", response_model=schemas.TopicResponse)
def create_topic(
    request: schemas.TopicCreate,
    db: Session = Depends(get_db),
):
    # Check if topic already exists
    existing = db.query(models.Topic)\
        .filter(func.lower(models.Topic.name) == request.name.lower())\
        .first()
        
    if existing:
        raise HTTPException(status_code=400, detail="Topic already exists")
    
    topic = models.Topic(name=request.name)
    db.add(topic)
    db.commit()
    db.refresh(topic)
    
    return schemas.TopicResponse(
        id=topic.id,
        name=topic.name,
        vibe_score=None, 
        post_count=0
    )

# GET posts for a topic
@router.get("/{topic_id}/posts", response_model=schemas.TopicDetailResponse)
def get_topic_posts(topic_id: int, db: Session = Depends(get_db)):
    
    # Check if topic exists
    topic = db.query(models.Topic).filter(models.Topic.id == topic_id).first()
    
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    posts = db.query(models.Post)\
        .filter(models.Post.topic_id == topic_id)\
            .order_by(models.Post.created_at.desc(), models.Post.id.desc())\
                .limit(20)\
                    .all()
                    
    return schemas.TopicDetailResponse(
        id=topic.id,
        name=topic.name,
        vibe_score=topic.ai_vibe_score,
        summary=topic.ai_summary,
        posts=[schemas.PostResponse(
            id=p.id,
            content=p.content,
            sentiment_score=p.sentiment_score,
            created_at=p.created_at
        ) for p in posts]
    )    
    
# POST create post in topic
@router.post("/{topic_id}/posts", response_model=schemas.PostResponse)
def create_post(
    topic_id: int,
    request: schemas.PostCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    
    # Check topic exists
    topic = db.query(models.Topic).filter(models.Topic.id == topic_id).first()
    
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")    
    
    # Get sentiment score for this post
    sentiment = get_sentiment(request.content)
    
    post = models.Post(
        content=request.content,
        sentiment_score=sentiment,
        user_id=current_user.id,
        topic_id=topic.id  
    )
    
    db.add(post)
    db.commit()
    db.refresh(post)
    
    recent_posts = db.query(models.Post)\
        .filter(models.Post.topic_id == topic_id)\
            .order_by(models.Post.created_at.desc(), models.Post.id.desc())\
                .limit(20)\
                    .all()
                    
    ai_result = get_topic_summary([p.content for p in recent_posts])
    
    topic.ai_summary = ai_result["summary"]
    topic.ai_vibe_score = ai_result["score"]
    
    db.commit()
    
    return post

# Delete Post
@router.delete("/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if post.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You are not authorized to delete this post"
        )
        
    topic_id = post.topic_id
        
    db.delete(post)
    db.commit()
    
    topic = db.query(models.Topic).filter(models.Topic.id == topic_id).first()
    
    remaining_posts = db.query(models.Post)\
        .filter(models.Post.topic_id == topic_id)\
            .order_by(models.Post.created_at.desc(), models.Post.id.desc())\
                .limit(20)\
                    .all()
                    
    if remaining_posts:
        ai_result = get_topic_summary([p.content for p in remaining_posts])
        topic.ai_summary = ai_result["summary"]
        topic.ai_vibe_score = ai_result["score"]
        
    else:
        topic.ai_summary = None
        topic.ai_vibe_score = None
        
    db.commit()
    
    return None
