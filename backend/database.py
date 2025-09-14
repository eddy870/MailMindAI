from sqlalchemy import create_engine, Column, String, Float, Integer, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./email_campaigns.db")

# Create SQLAlchemy engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for models
Base = declarative_base()

class CampaignDB(Base):
    """Database model for email campaigns"""
    __tablename__ = "campaigns"
    
    id = Column(String, primary_key=True, index=True)
    campaign_name = Column(String, index=True)
    emails_sent = Column(Integer)
    open_rate = Column(Float)
    click_rate = Column(Float)
    conversion_rate = Column(Float)
    weak_spots = Column(Text)  # JSON string
    ai_suggestions = Column(Text)  # JSON string
    estimated_improvement = Column(String)
    # Target market information
    target_market = Column(String)  # e.g., "B2B SaaS professionals", "E-commerce shoppers"
    target_age_range = Column(String)  # e.g., "25-35", "40-55"
    target_industry = Column(String)  # e.g., "Technology", "Healthcare", "Retail"
    target_company_size = Column(String)  # e.g., "Startup", "SMB", "Enterprise"
    analyzed_at = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<Campaign(id={self.id}, name={self.campaign_name})>"

def create_tables():
    """Create all database tables"""
    Base.metadata.create_all(bind=engine)

def get_db():
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()