from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import schemas as schemas
from database import get_db
import models, auth

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=schemas.TokenResponse)
def register(request: schemas.RegisterRequest, db: Session = Depends(get_db)):
    # Check if email already exists
    existing = db.query(models.User).filter(
        models.User.email == request.email
    ).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    # Create User 
    user = models.User(
        email=request.email,
        password=auth.hash_password(request.password)   
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Return token immediately - no need to login after register
    token = auth.create_token({"sub": user.email})
    return {"access_token": token}

@router.post("/login", response_model=schemas.TokenResponse)
def login(request: schemas.LoginRequest, db: Session = Depends(get_db)):
    # Find user
    user = db.query(models.User).filter(
        models.User.email == request.email
    ).first()
    
    # Check password
    if not user or not auth.verify_password(request.password, user.password):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )
    token = auth.create_token({"sub": user.email})
    return {"access_token": token}