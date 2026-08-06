import models
from fastapi import FastAPI
from database import engine
from fastapi.security import HTTPBearer
from fastapi.middleware.cors import CORSMiddleware
from routers import auth_router, topics, users

# Create all tables
models.Base.metadata.create_all(bind=engine)

security = HTTPBearer()

app = FastAPI(title="VibeCheck API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth_router.router)
app.include_router(topics.router)
app.include_router(users.router)

@app.get("/")
def root():
    return {"message": "VibeCheck API running"}