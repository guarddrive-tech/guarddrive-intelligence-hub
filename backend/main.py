from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, timedelta
import jwt
import hashlib
import os

app = FastAPI(
    title="GuardDrive Intelligence Hub API",
    description="Central de Inteligência de Mercado & Data Room Comercial",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "guarddrive-intelligence-secret-key-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

# ─── MODELS ───────────────────────────────────────────────────────

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    company: Optional[str] = None
    role: str = "researcher"  # researcher, admin, analyst

class User(BaseModel):
    id: int
    email: str
    full_name: str
    company: Optional[str]
    role: str
    created_at: datetime

class CompanyCreate(BaseModel):
    name: str
    cnpj: Optional[str] = None
    segment: str
    size: str  # small, medium, large
    contact_person: str
    contact_email: EmailStr
    phone: str
    address: Optional[str] = None

class Company(BaseModel):
    id: int
    name: str
    cnpj: Optional[str]
    segment: str
    size: str
    contact_person: str
    contact_email: str
    phone: str
    created_at: datetime

class LeadCreate(BaseModel):
    company_id: int
    contact_name: str
    contact_email: EmailStr
    contact_phone: str
    position: str
    interest_level: str  # low, medium, high
    notes: Optional[str] = None
    collected_by: str  # user_id

class Lead(BaseModel):
    id: int
    company_id: int
    contact_name: str
    contact_email: str
    contact_phone: str
    position: str
    interest_level: str
    notes: Optional[str]
    collected_by: str
    created_at: datetime

class MarketDataCreate(BaseModel):
    category: str
    metric_name: str
    metric_value: float
    unit: str
    source: str
    date_collected: datetime
    notes: Optional[str] = None

class MarketData(BaseModel):
    id: int
    category: str
    metric_name: str
    metric_value: float
    unit: str
    source: str
    date_collected: datetime
    notes: Optional[str]

# ─── DATABASE MOCK (Replace with real database) ───────────────────

# Mock database for development
users_db = []
companies_db = []
leads_db = []
market_data_db = []

# ─── AUTHENTICATION ───────────────────────────────────────────────

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    
    user = next((u for u in users_db if u["email"] == email), None)
    if user is None:
        raise credentials_exception
    return user

# ─── AUTH ENDPOINTS ─────────────────────────────────────────────

@app.post("/api/auth/register", response_model=User)
async def register(user: UserCreate):
    # Check if user already exists
    if any(u["email"] == user.email for u in users_db):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password
    password_hash = hashlib.sha256(user.password.encode()).hexdigest()
    
    # Create user
    new_user = {
        "id": len(users_db) + 1,
        "email": user.email,
        "password_hash": password_hash,
        "full_name": user.full_name,
        "company": user.company,
        "role": user.role,
        "created_at": datetime.utcnow()
    }
    users_db.append(new_user)
    
    return User(
        id=new_user["id"],
        email=new_user["email"],
        full_name=new_user["full_name"],
        company=new_user["company"],
        role=new_user["role"],
        created_at=new_user["created_at"]
    )

@app.post("/api/auth/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # Find user
    user = next((u for u in users_db if u["email"] == form_data.username), None)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    # Verify password
    password_hash = hashlib.sha256(form_data.password.encode()).hexdigest()
    if user["password_hash"] != password_hash:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "email": user["email"],
            "full_name": user["full_name"],
            "company": user["company"],
            "role": user["role"]
        }
    }

@app.get("/api/auth/me", response_model=User)
async def get_me(current_user: dict = Depends(get_current_user)):
    return User(
        id=current_user["id"],
        email=current_user["email"],
        full_name=current_user["full_name"],
        company=current_user["company"],
        role=current_user["role"],
        created_at=current_user["created_at"]
    )

# ─── COMPANIES ENDPOINTS ───────────────────────────────────────

@app.post("/api/companies", response_model=Company)
async def create_company(company: CompanyCreate, current_user: dict = Depends(get_current_user)):
    new_company = {
        "id": len(companies_db) + 1,
        "name": company.name,
        "cnpj": company.cnpj,
        "segment": company.segment,
        "size": company.size,
        "contact_person": company.contact_person,
        "contact_email": company.contact_email,
        "phone": company.phone,
        "address": company.address,
        "created_at": datetime.utcnow()
    }
    companies_db.append(new_company)
    
    return Company(**new_company)

@app.get("/api/companies", response_model=List[Company])
async def get_companies(current_user: dict = Depends(get_current_user)):
    return companies_db

@app.get("/api/companies/{company_id}", response_model=Company)
async def get_company(company_id: int, current_user: dict = Depends(get_current_user)):
    company = next((c for c in companies_db if c["id"] == company_id), None)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return Company(**company)

# ─── LEADS ENDPOINTS ───────────────────────────────────────────

@app.post("/api/leads", response_model=Lead)
async def create_lead(lead: LeadCreate, current_user: dict = Depends(get_current_user)):
    new_lead = {
        "id": len(leads_db) + 1,
        "company_id": lead.company_id,
        "contact_name": lead.contact_name,
        "contact_email": lead.contact_email,
        "contact_phone": lead.contact_phone,
        "position": lead.position,
        "interest_level": lead.interest_level,
        "notes": lead.notes,
        "collected_by": current_user["email"],
        "created_at": datetime.utcnow()
    }
    leads_db.append(new_lead)
    
    return Lead(**new_lead)

@app.get("/api/leads", response_model=List[Lead])
async def get_leads(current_user: dict = Depends(get_current_user)):
    return leads_db

@app.get("/api/leads/stats")
async def get_leads_stats(current_user: dict = Depends(get_current_user)):
    total_leads = len(leads_db)
    by_interest = {}
    for lead in leads_db:
        level = lead["interest_level"]
        by_interest[level] = by_interest.get(level, 0) + 1
    
    return {
        "total_leads": total_leads,
        "by_interest_level": by_interest,
        "recent_leads": len([l for l in leads_db if (datetime.utcnow() - l["created_at"]).days <= 7])
    }

# ─── MARKET DATA ENDPOINTS ─────────────────────────────────────

@app.post("/api/market-data", response_model=MarketData)
async def create_market_data(data: MarketDataCreate, current_user: dict = Depends(get_current_user)):
    new_data = {
        "id": len(market_data_db) + 1,
        "category": data.category,
        "metric_name": data.metric_name,
        "metric_value": data.metric_value,
        "unit": data.unit,
        "source": data.source,
        "date_collected": data.date_collected,
        "notes": data.notes
    }
    market_data_db.append(new_data)
    
    return MarketData(**new_data)

@app.get("/api/market-data", response_model=List[MarketData])
async def get_market_data(current_user: dict = Depends(get_current_user)):
    return market_data_db

@app.get("/api/market-data/category/{category}")
async def get_market_data_by_category(category: str, current_user: dict = Depends(get_current_user)):
    return [d for d in market_data_db if d["category"] == category]

# ─── DASHBOARD ENDPOINTS ───────────────────────────────────────

@app.get("/api/dashboard/overview")
async def get_dashboard_overview(current_user: dict = Depends(get_current_user)):
    return {
        "total_companies": len(companies_db),
        "total_leads": len(leads_db),
        "total_market_data": len(market_data_db),
        "recent_activity": len(leads_db) + len(market_data_db),
        "leads_by_segment": {},
        "market_trends": []
    }

# ─── HEALTH CHECK ───────────────────────────────────────────────

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
