from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional
import uuid
import os
import json
from dotenv import load_dotenv
from openai import OpenAI
from sqlalchemy.orm import Session
from database import get_db, create_tables, CampaignDB
from ml_model import ml_model

# Load environment variables
load_dotenv()

# Initialize OpenAI client
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Create database tables
create_tables()

# Pydantic models for campaign data
class CampaignData(BaseModel):
    campaign_name: str = Field(..., description="Campaign name or ID")
    emails_sent: int = Field(..., gt=0, description="Number of emails sent")
    open_rate: float = Field(..., ge=0, le=100, description="Open rate percentage")
    click_rate: float = Field(..., ge=0, le=100, description="Click-through rate percentage") 
    conversion_rate: float = Field(..., ge=0, le=100, description="Conversion rate percentage")
    # Target market information (optional)
    target_market: Optional[str] = Field(None, description="Target audience description (e.g., 'B2B SaaS professionals')")
    target_age_range: Optional[str] = Field(None, description="Target age range (e.g., '25-35')")
    target_industry: Optional[str] = Field(None, description="Target industry (e.g., 'Technology', 'Healthcare')")
    target_company_size: Optional[str] = Field(None, description="Target company size (e.g., 'Startup', 'SMB', 'Enterprise')")

class CampaignAnalysis(BaseModel):
    campaign_id: str
    campaign_data: CampaignData
    weak_spots: List[str]
    ai_suggestions: List[str]
    estimated_improvement: str
    ml_prediction: Optional[dict] = None  # Will contain ML-based predictions
    analyzed_at: str

# Database helper functions
def save_campaign_to_db(analysis: CampaignAnalysis, db: Session):
    """Save campaign analysis to database"""
    db_campaign = CampaignDB(
        id=analysis.campaign_id,
        campaign_name=analysis.campaign_data.campaign_name,
        emails_sent=analysis.campaign_data.emails_sent,
        open_rate=analysis.campaign_data.open_rate,
        click_rate=analysis.campaign_data.click_rate,
        conversion_rate=analysis.campaign_data.conversion_rate,
        weak_spots=json.dumps(analysis.weak_spots),
        ai_suggestions=json.dumps(analysis.ai_suggestions),
        estimated_improvement=analysis.estimated_improvement,
        # Target market information
        target_market=analysis.campaign_data.target_market,
        target_age_range=analysis.campaign_data.target_age_range,
        target_industry=analysis.campaign_data.target_industry,
        target_company_size=analysis.campaign_data.target_company_size,
        analyzed_at=datetime.fromisoformat(analysis.analyzed_at.replace('Z', '+00:00'))
    )
    db.add(db_campaign)
    db.commit()
    db.refresh(db_campaign)
    return db_campaign

def get_campaigns_from_db(db: Session) -> List[CampaignAnalysis]:
    """Get all campaigns from database"""
    campaigns = db.query(CampaignDB).order_by(CampaignDB.analyzed_at.desc()).all()
    
    result = []
    for campaign in campaigns:
        analysis = CampaignAnalysis(
            campaign_id=campaign.id,
            campaign_data=CampaignData(
                campaign_name=campaign.campaign_name,
                emails_sent=campaign.emails_sent,
                open_rate=campaign.open_rate,
                click_rate=campaign.click_rate,
                conversion_rate=campaign.conversion_rate,
                target_market=campaign.target_market,
                target_age_range=campaign.target_age_range,
                target_industry=campaign.target_industry,
                target_company_size=campaign.target_company_size
            ),
            weak_spots=json.loads(campaign.weak_spots),
            ai_suggestions=json.loads(campaign.ai_suggestions),
            estimated_improvement=campaign.estimated_improvement,
            analyzed_at=campaign.analyzed_at.isoformat()
        )
        result.append(analysis)
    
    return result

def get_campaign_from_db(campaign_id: str, db: Session) -> Optional[CampaignAnalysis]:
    """Get specific campaign from database"""
    campaign = db.query(CampaignDB).filter(CampaignDB.id == campaign_id).first()
    
    if not campaign:
        return None
    
    return CampaignAnalysis(
        campaign_id=campaign.id,
        campaign_data=CampaignData(
            campaign_name=campaign.campaign_name,
            emails_sent=campaign.emails_sent,
            open_rate=campaign.open_rate,
            click_rate=campaign.click_rate,
            conversion_rate=campaign.conversion_rate,
            target_market=campaign.target_market,
            target_age_range=campaign.target_age_range,
            target_industry=campaign.target_industry,
            target_company_size=campaign.target_company_size
        ),
        weak_spots=json.loads(campaign.weak_spots),
        ai_suggestions=json.loads(campaign.ai_suggestions),
        estimated_improvement=campaign.estimated_improvement,
        analyzed_at=campaign.analyzed_at.isoformat()
    )

def convert_campaign_for_ml(campaign: CampaignData) -> dict:
    """Convert CampaignData to format expected by ML model"""
    return {
        'emails_sent': campaign.emails_sent,
        'open_rate': campaign.open_rate,
        'click_rate': campaign.click_rate,
        'conversion_rate': campaign.conversion_rate,
        'target_market': campaign.target_market or 'Unknown',
        'target_age_range': campaign.target_age_range or 'Unknown',
        'target_industry': campaign.target_industry or 'Unknown',
        'target_company_size': campaign.target_company_size or 'Unknown'
    }

def train_ml_model_with_database(db: Session):
    """Train ML model with all campaigns from database"""
    campaigns = db.query(CampaignDB).all()
    
    if len(campaigns) < 3:
        return {"message": "Not enough campaigns to train ML model", "campaigns_count": len(campaigns)}
    
    # Convert database campaigns to ML format
    ml_data = []
    for campaign in campaigns:
        ml_data.append({
            'emails_sent': campaign.emails_sent,
            'open_rate': campaign.open_rate,
            'click_rate': campaign.click_rate,
            'conversion_rate': campaign.conversion_rate,
            'target_market': campaign.target_market or 'Unknown',
            'target_age_range': campaign.target_age_range or 'Unknown',
            'target_industry': campaign.target_industry or 'Unknown',
            'target_company_size': campaign.target_company_size or 'Unknown'
        })
    
    # Train the model
    metrics = ml_model.train(ml_data)
    return {
        "message": f"ML model trained successfully on {len(campaigns)} campaigns",
        "metrics": metrics,
        "campaigns_count": len(campaigns)
    }

app = FastAPI(
    title="AI Email Campaign Analyzer",
    description="Analyze email campaign performance and get AI-powered suggestions with persistent storage",
    version="1.0.0"
)

# Add CORS middleware to allow frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for Vercel deployment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Startup event to train ML model if enough campaigns exist"""
    try:
        from database import SessionLocal
        db = SessionLocal()
        result = train_ml_model_with_database(db)
        print(f"Startup ML training: {result.get('message', 'Training completed')}")
        db.close()
    except Exception as e:
        print(f"Startup ML training failed: {e}")
        # Continue without ML training - it's not critical for basic functionality

async def generate_ai_suggestions(campaign: CampaignData, weak_spots: List[str]) -> List[str]:
    """Generate AI-powered suggestions using OpenAI GPT"""
    
    # Check if OpenAI API key is available
    if not os.getenv("OPENAI_API_KEY") or os.getenv("OPENAI_API_KEY") == "your_openai_api_key_here":
        # Fallback to enhanced hardcoded responses if no API key
        return get_fallback_suggestions(campaign, weak_spots)
    
    try:
        # Create a detailed prompt for GPT
        prompt = f"""
        You are an expert email marketing consultant. Analyze this email campaign performance and provide specific, actionable recommendations.

        Campaign Data:
        - Campaign: {campaign.campaign_name}
        - Emails Sent: {campaign.emails_sent:,}
        - Open Rate: {campaign.open_rate}%
        - Click Rate: {campaign.click_rate}%
        - Conversion Rate: {campaign.conversion_rate}%

        Identified Issues: {', '.join(weak_spots)}

        Please provide 3-5 specific, actionable recommendations to improve this campaign's performance. Focus on practical steps the marketer can implement immediately. Be concise but detailed.

        Format your response as a numbered list of recommendations.
        """

        response = openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an expert email marketing consultant with 10+ years of experience optimizing email campaigns."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=500,
            temperature=0.7
        )

        # Parse the response and extract suggestions
        ai_response = response.choices[0].message.content
        suggestions = []
        
        # Split by numbered items and clean up
        lines = ai_response.strip().split('\n')
        for line in lines:
            line = line.strip()
            if line and (line[0].isdigit() or line.startswith('-') or line.startswith('•')):
                # Remove numbering and clean up
                clean_suggestion = line.lstrip('0123456789.-• ').strip()
                if clean_suggestion:
                    suggestions.append(clean_suggestion)
        
        return suggestions if suggestions else get_fallback_suggestions(campaign, weak_spots)
        
    except Exception as e:
        print(f"OpenAI API error: {e}")
        # Fallback to hardcoded suggestions on API error
        return get_fallback_suggestions(campaign, weak_spots)

def get_fallback_suggestions(campaign: CampaignData, weak_spots: List[str]) -> List[str]:
    """Enhanced fallback suggestions when OpenAI API is not available"""
    suggestions = []
    
    if "Low open rate" in weak_spots:
        suggestions.extend([
            f"A/B test subject lines - your current {campaign.open_rate}% is below the 20% benchmark",
            "Optimize send timing - try Tuesday-Thursday between 10 AM-2 PM for better engagement",
            "Personalize subject lines with recipient names or company information",
            "Clean your email list and remove inactive subscribers to improve deliverability"
        ])
    
    if "Low click-through rate" in weak_spots:
        suggestions.extend([
            f"Redesign your CTA buttons - current {campaign.click_rate}% CTR needs improvement",
            "Use action-oriented language like 'Get Started Now' instead of generic 'Click Here'",
            "Reduce email content length and focus on one primary goal",
            "Add compelling visuals and ensure mobile-responsive design"
        ])
    
    if "Low conversion rate" in weak_spots:
        suggestions.extend([
            f"Optimize landing page speed and relevance - {campaign.conversion_rate}% conversion is below average",
            "Add social proof, testimonials, and trust badges to increase credibility",
            "Simplify your conversion process and reduce form fields",
            "Ensure strong message match between email content and landing page"
        ])
    
    if not suggestions:
        suggestions.append(f"Your campaign shows solid performance! Consider testing small optimizations to push beyond current metrics.")
    
    return suggestions

def analyze_campaign(campaign: CampaignData) -> CampaignAnalysis:
    """Analyze campaign performance and generate suggestions"""
    weak_spots = []
    
    # Analyze performance metrics
    if campaign.open_rate < 20:
        weak_spots.append("Low open rate")
    
    if campaign.click_rate < 3:
        weak_spots.append("Low click-through rate") 
    
    if campaign.conversion_rate < 2:
        weak_spots.append("Low conversion rate")
    
    if not weak_spots:
        weak_spots.append("No major issues detected")
    
    # Generate campaign analysis
    campaign_id = str(uuid.uuid4())
    
    # This will be updated after we add async support
    suggestions = get_fallback_suggestions(campaign, weak_spots)
    
    analysis = CampaignAnalysis(
        campaign_id=campaign_id,
        campaign_data=campaign,
        weak_spots=weak_spots,
        ai_suggestions=suggestions,
        estimated_improvement="5-15% improvement possible with suggested changes",
        analyzed_at=datetime.now().isoformat()
    )
    
    return analysis

async def analyze_campaign_with_ai(campaign: CampaignData) -> CampaignAnalysis:
    """Analyze campaign performance and generate AI suggestions"""
    weak_spots = []
    
    # Analyze performance metrics
    if campaign.open_rate < 20:
        weak_spots.append("Low open rate")
    
    if campaign.click_rate < 3:
        weak_spots.append("Low click-through rate") 
    
    if campaign.conversion_rate < 2:
        weak_spots.append("Low conversion rate")
    
    if not weak_spots:
        weak_spots.append("No major issues detected")
    
    # Generate AI-powered suggestions
    ai_suggestions = await generate_ai_suggestions(campaign, weak_spots)
    
    # Get ML predictions for improvement
    campaign_ml_data = convert_campaign_for_ml(campaign)
    ml_predictions = ml_model.predict_improvements(campaign_ml_data)
    
    # Create more specific improvement estimate using ML predictions
    if ml_predictions.get('confidence') == 'High':
        improvement_text = f"ML prediction: Open rate {ml_predictions['predicted_open_rate']}% (+{ml_predictions['open_rate_improvement_percent']}%), Click rate {ml_predictions['predicted_click_rate']}% (+{ml_predictions['click_rate_improvement_percent']}%)"
    else:
        improvement_text = "5-25% improvement possible with AI-optimized changes"
    
    # Generate campaign analysis
    campaign_id = str(uuid.uuid4())
    analysis = CampaignAnalysis(
        campaign_id=campaign_id,
        campaign_data=campaign,
        weak_spots=weak_spots,
        ai_suggestions=ai_suggestions,
        estimated_improvement=improvement_text,
        ml_prediction=ml_predictions,
        analyzed_at=datetime.now().isoformat()
    )
    
    return analysis

@app.post("/analyze-campaign", response_model=CampaignAnalysis)
async def analyze_campaign_endpoint(campaign: CampaignData, db: Session = Depends(get_db)):
    """Submit campaign data for AI-powered analysis"""
    try:
        analysis = await analyze_campaign_with_ai(campaign)
        save_campaign_to_db(analysis, db)
        return analysis
    except Exception as e:
        print(f"Analysis error: {e}")
        # Fallback to non-AI analysis if something goes wrong
        analysis = analyze_campaign(campaign)
        save_campaign_to_db(analysis, db)
        return analysis

@app.get("/campaigns", response_model=List[CampaignAnalysis])
async def get_all_campaigns(db: Session = Depends(get_db)):
    """Get all analyzed campaigns from database"""
    return get_campaigns_from_db(db)

@app.get("/campaigns/{campaign_id}", response_model=CampaignAnalysis)
async def get_campaign(campaign_id: str, db: Session = Depends(get_db)):
    """Get specific campaign analysis from database"""
    campaign = get_campaign_from_db(campaign_id, db)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign

@app.get("/")
async def root(db: Session = Depends(get_db)):
    """Hello endpoint to verify the API is running"""
    openai_status = "configured" if os.getenv("OPENAI_API_KEY") and os.getenv("OPENAI_API_KEY") != "your_openai_api_key_here" else "not configured"
    
    # Get campaign count
    try:
        campaign_count = db.query(CampaignDB).count()
    except:
        campaign_count = 0
    
    return {
        "message": "🚀 AI Email Campaign Analyzer API is running!",
        "status": "active",
        "openai_status": openai_status,
        "ai_enabled": openai_status == "configured",
        "total_campaigns": campaign_count,
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

@app.post("/train-ml-model")
async def train_ml_model_endpoint(db: Session = Depends(get_db)):
    """Train the ML model with all campaigns in database"""
    try:
        result = train_ml_model_with_database(db)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error training ML model: {str(e)}")

@app.get("/ml-model-status")
async def get_ml_model_status(db: Session = Depends(get_db)):
    """Get ML model training status and statistics"""
    try:
        campaign_count = db.query(CampaignDB).count()
        return {
            "is_trained": ml_model.is_trained,
            "total_campaigns": campaign_count,
            "min_campaigns_needed": 3,
            "can_train": campaign_count >= 3,
            "model_confidence": "High" if ml_model.is_trained and campaign_count >= 10 else "Medium" if ml_model.is_trained else "Low",
            "message": "ML model ready for predictions" if ml_model.is_trained else f"Need {max(0, 3 - campaign_count)} more campaigns to train ML model"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting ML model status: {str(e)}")

@app.get("/health")
async def health_check(db: Session = Depends(get_db)):
    """Health check endpoint with database status"""
    openai_status = "configured" if os.getenv("OPENAI_API_KEY") and os.getenv("OPENAI_API_KEY") != "your_openai_api_key_here" else "not configured"
    
    # Check database connection and get stats
    try:
        campaign_count = db.query(CampaignDB).count()
        db_status = "connected"
    except Exception as e:
        campaign_count = 0
        db_status = f"error: {str(e)}"
    
    return {
        "status": "healthy",
        "service": "email-campaign-analyzer",
        "openai_status": openai_status,
        "ai_enabled": openai_status == "configured",
        "database_status": db_status,
        "total_campaigns": campaign_count,
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)