from dotenv import load_dotenv
import os, models
from passlib.context import CryptContext
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Depends, HTTPException, status
from datetime import datetime, timedelta
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from database import get_db

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
EXPIRE_MIN =int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))

pwd_context = CryptContext(schemes=["bcrypt"])
bearer_scheme = HTTPBearer()
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain:str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=EXPIRE_MIN)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(
     credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db)
):
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid_credentials"
    )
    try:
        token = credentials.credentials 
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        
        if not email:
            raise credentials_error
    except JWTError:
        raise credentials_error
    
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise credentials_error
    return user
    