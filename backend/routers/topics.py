from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import schemas, models
from sqlalchemy import func
from database import get_db
from auth import get_current_user
from ai import get_topic_summary, get_sentiment

router = APIRouter(prefix="/topics", tags=["topics"])

# Get all topics
@router.get("", response_model=list[schemas.TopicResponse])
def get_topics(db: Session = Depends(get_db)):
    topics = db.query(models.Topic).all()
    
    result = []
    for topic in topics:
        # Average sentiment score of all posts in topic
        avg_score = db.query(func.avg(models.Post.sentiment_score))\
        .filter(models.Post.topic_id == topic.id)\
        .scalar()
        
        result.append(schemas.TopicResponse(
            id=topic.id,
            name=topic.name,
            vibe_score=round(avg_score, 1) if avg_score else None,
            post_count=len(topic.posts)
        ))
        
    return result

# Post create topic
@router.post("", response_model=schemas.TopicResponse)
def create_topic(
    request: schemas.TopicCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
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
        return HTTPException(status_code=404, detail="Topic not found")
    
    posts = db.query(models.Post)\
        .filter(models.Post.topic_id == topic_id)\
            .order_by(models.Post.created_at.desc())\
                .limit(20)\
                    .all()
                    
    # Get AI summary if there are posts
    summary = None
    vibe_score = None
    
    if posts:
        post_contents = [p.content for p in posts]
        ai_result = get_topic_summary(post_contents)
        summary = ai_result["summary"]
        vibe_score = ai_result["score"]
    
    return schemas.TopicDetailResponse(
        id=topic.id,
        name=topic.name,
        vibe_score=vibe_score,
        summary=summary,
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
    
    return post

    
    