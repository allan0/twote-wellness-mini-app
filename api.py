import os
import hmac
import hashlib
from urllib.parse import parse_qsl
from fastapi import FastAPI, HTTPException, Header, Depends
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, String, Integer, JSON
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()
BOT_TOKEN = os.getenv("BOT_TOKEN")

# --- Database Setup (SQLite) ---
DATABASE_URL = "sqlite:///./twote_wellness.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- Database Model ---
class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, index=True) # Telegram User ID
    first_name = Column(String)
    points = Column(Integer, default=0)
    energy_level = Column(Integer, default=50)
    level = Column(String, default="Novice")
    consecutive_days = Column(Integer, default=0)
    mystery_boxes = Column(Integer, default=0)
    game_state = Column(JSON, default={}) # Stores complex data like arrays/dicts

Base.metadata.create_all(bind=engine)

app = FastAPI(title="TWOTE Wellness API")

# --- CORS Middleware ---
# Allows your frontend to make requests to this backend API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace "*" with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Security: Verify Telegram WebApp initData ---
def verify_telegram_data(init_data: str) -> dict:
    """Validates the data received from the Telegram Mini App."""
    try:
        parsed_data = dict(parse_qsl(init_data))
        if "hash" not in parsed_data:
            raise ValueError("Missing hash")
            
        received_hash = parsed_data.pop("hash")
        
        # Sort data alphabetically by key
        data_check_string = "\n".join(f"{k}={v}" for k, v in sorted(parsed_data.items()))
        
        if not BOT_TOKEN:
            print("WARNING: BOT_TOKEN missing. Bypassing auth for local testing.")
            import json
            return json.loads(parsed_data.get("user", '{"id":"local_test","first_name":"Tester"}'))

        # Create secret key using the bot token
        secret_key = hmac.new(b"WebAppData", BOT_TOKEN.encode(), hashlib.sha256).digest()
        calculated_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()
        
        if calculated_hash != received_hash:
            raise ValueError("Invalid hash")
            
        import json
        return json.loads(parsed_data.get("user", "{}"))
    except Exception as e:
        raise HTTPException(status_code=401, detail="Unauthorized: Invalid Telegram Data")

# --- Dependencies ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(authorization: str = Header(None), db: Session = Depends(get_db)):
    if not authorization or not authorization.startswith("tma "):
        raise HTTPException(status_code=401, detail="Missing Telegram initData")
    
    init_data = authorization.split(" ")[1]
    tg_user = verify_telegram_data(init_data)
    user_id = str(tg_user.get("id"))
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        # Create new user if they don't exist
        user = User(
            id=user_id,
            first_name=tg_user.get("first_name", "Guest"),
            game_state={} 
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
    return user

# --- API Endpoints ---
class StateSyncPayload(BaseModel):
    points: int
    energy_level: int
    level: str
    consecutive_days: int
    mystery_boxes: int
    game_state: dict

@app.get("/api/user/state")
def get_user_state(current_user: User = Depends(get_current_user)):
    """Fetches the user's secure state from the database."""
    return {
        "id": current_user.id,
        "first_name": current_user.first_name,
        "points": current_user.points,
        "energyLevel": current_user.energy_level,
        "level": current_user.level,
        "consecutiveDays": current_user.consecutive_days,
        "mysteryBoxes": current_user.mystery_boxes,
        "gameState": current_user.game_state
    }

@app.post("/api/user/sync")
def sync_user_state(payload: StateSyncPayload, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Saves the user's progress to the database."""
    current_user.points = payload.points
    current_user.energy_level = payload.energy_level
    current_user.level = payload.level
    current_user.consecutive_days = payload.consecutive_days
    current_user.mystery_boxes = payload.mystery_boxes
    
    # Merge existing game state with the new one to preserve un-synced keys
    existing_state = dict(current_user.game_state) if current_user.game_state else {}
    existing_state.update(payload.game_state)
    current_user.game_state = existing_state
    
    db.commit()
    return {"status": "success", "message": "State synced securely."}
