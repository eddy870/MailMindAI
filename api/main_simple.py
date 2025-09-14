from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional
import os
import json
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="MailMind AI API",
    description="AI-powered email marketing campaign analyzer",
    version="1.0.0",
)

# Initialize OpenAI client
openai_client = None
try:
    api_key = os.getenv("OPENAI_API_KEY")
    if api_key:
        openai_client = OpenAI(api_key=api_key)
except Exception as e:
    print(f"OpenAI initialization error: {e}")
    openai_client = None

# Pydantic models for campaign data
class CampaignData(BaseModel):
    campaign_name: str = Field(..., description="Campaign name or ID")
    emails_sent: int = Field(..., gt=0, description="Number of emails sent")
    open_rate: float = Field(..., ge=0, le=100, description="Open rate percentage")
    click_rate: float = Field(..., ge=0, le=100, description="Click-through rate percentage") 
    conversion_rate: float = Field(..., ge=0, le=100, description="Conversion rate percentage")
    bounce_rate: Optional[float] = Field(0, ge=0, le=100, description="Bounce rate percentage")
    unsubscribe_rate: Optional[float] = Field(0, ge=0, le=100, description="Unsubscribe rate percentage")
    target_market: Optional[str] = Field(None, description="Target market (e.g., 'B2B', 'B2C')")
    target_industry: Optional[str] = Field(None, description="Target industry (e.g., 'Technology', 'Healthcare')")
    target_company_size: Optional[str] = Field(None, description="Target company size (e.g., 'Small (1-50)', 'Large (201-1000)')")
    age_range: Optional[str] = Field(None, description="Target age range (e.g., '25-34', '35-44')")

class AnalysisResponse(BaseModel):
    campaign_name: str
    analysis_summary: str
    improvement_recommendations: List[str]
    predicted_improvements: dict
    confidence_score: float
    timestamp: str

# Simple ML predictions (rule-based)
def predict_improvements(campaign_data: CampaignData) -> dict:
    """Simple rule-based predictions"""
    benchmarks = {'open_rate': 22.0, 'click_rate': 3.5, 'conversion_rate': 2.0}
    
    improvements = {}
    for metric, benchmark in benchmarks.items():
        current_value = getattr(campaign_data, metric)
        if current_value < benchmark:
            potential_improvement = min(50, (benchmark - current_value) * 1.5)
            improvements[f"{metric}_improvement"] = round(potential_improvement, 1)
        else:
            improvements[f"{metric}_improvement"] = round(min(15, (current_value - benchmark) * 0.5), 1)
    
    return improvements

def analyze_campaign_performance(campaign_data: CampaignData) -> dict:
    """Analyze campaign performance and identify issues"""
    issues = []
    strengths = []
    
    # Benchmarks (industry averages)
    benchmarks = {
        'open_rate': 22.0,
        'click_rate': 3.5,
        'conversion_rate': 2.0,
        'bounce_rate': 2.0,
        'unsubscribe_rate': 0.5
    }
    
    # Analyze each metric
    if campaign_data.open_rate < benchmarks['open_rate']:
        issues.append(f"Open rate ({campaign_data.open_rate}%) is below industry average ({benchmarks['open_rate']}%)")
    else:
        strengths.append(f"Strong open rate ({campaign_data.open_rate}%)")
        
    if campaign_data.click_rate < benchmarks['click_rate']:
        issues.append(f"Click rate ({campaign_data.click_rate}%) needs improvement")
    else:
        strengths.append(f"Good click-through rate ({campaign_data.click_rate}%)")
        
    if campaign_data.conversion_rate < benchmarks['conversion_rate']:
        issues.append(f"Conversion rate ({campaign_data.conversion_rate}%) has room for improvement")
    else:
        strengths.append(f"Solid conversion rate ({campaign_data.conversion_rate}%)")
    
    return {
        "issues": issues,
        "strengths": strengths,
        "overall_score": len(strengths) / (len(strengths) + len(issues)) if (len(strengths) + len(issues)) > 0 else 0.5
    }

async def get_ai_recommendations(campaign_data: CampaignData, analysis: dict) -> List[str]:
    """Get AI-powered recommendations"""
    if not openai_client:
        # Fallback recommendations
        return [
            "Optimize subject lines for better open rates",
            "Improve email content relevance and personalization",
            "Test different call-to-action buttons",
            "Segment your audience for better targeting",
            "A/B test send times and frequency"
        ]
    
    try:
        prompt = f"""
        Analyze this email campaign performance and provide 5 specific, actionable recommendations:
        
        Campaign: {campaign_data.campaign_name}
        - Emails sent: {campaign_data.emails_sent:,}
        - Open rate: {campaign_data.open_rate}%
        - Click rate: {campaign_data.click_rate}%
        - Conversion rate: {campaign_data.conversion_rate}%
        - Target: {campaign_data.target_industry or 'General'} industry
        
        Issues identified: {', '.join(analysis['issues'])}
        Strengths: {', '.join(analysis['strengths'])}
        
        Please provide exactly 5 bullet-point recommendations to improve performance:
        """
        
        response = openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an expert email marketing consultant. Provide specific, actionable recommendations."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=500,
            temperature=0.7
        )
        
        recommendations_text = response.choices[0].message.content
        # Parse bullet points
        recommendations = [line.strip('- •').strip() for line in recommendations_text.split('\n') if line.strip() and ('•' in line or '-' in line or line.strip().endswith('.'))[:5]]
        
        return recommendations if recommendations else [
            "Optimize subject lines for better open rates",
            "Improve email content relevance and personalization", 
            "Test different call-to-action buttons",
            "Segment your audience for better targeting",
            "A/B test send times and frequency"
        ]
        
    except Exception as e:
        print(f"OpenAI API error: {e}")
        # Return fallback recommendations
        return [
            "Optimize subject lines for better open rates",
            "Improve email content relevance and personalization",
            "Test different call-to-action buttons", 
            "Segment your audience for better targeting",
            "A/B test send times and frequency"
        ]

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "MailMind AI API", "status": "active", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    """Simple health check endpoint"""
    return {
        "status": "healthy",
        "service": "mailmind-ai-api",
        "openai_configured": bool(openai_client),
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/analyze-campaign", response_model=AnalysisResponse)
async def analyze_campaign(campaign_data: CampaignData):
    """Analyze email campaign performance and provide AI recommendations"""
    try:
        # Perform analysis
        analysis = analyze_campaign_performance(campaign_data)
        
        # Get ML predictions
        predicted_improvements = predict_improvements(campaign_data)
        
        # Get AI recommendations
        recommendations = await get_ai_recommendations(campaign_data, analysis)
        
        # Create summary
        issues_text = f"Issues: {', '.join(analysis['issues'])}" if analysis['issues'] else "No major issues identified"
        strengths_text = f"Strengths: {', '.join(analysis['strengths'])}" if analysis['strengths'] else ""
        summary = f"{issues_text}. {strengths_text}".strip()
        
        return AnalysisResponse(
            campaign_name=campaign_data.campaign_name,
            analysis_summary=summary,
            improvement_recommendations=recommendations,
            predicted_improvements=predicted_improvements,
            confidence_score=analysis['overall_score'],
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.get("/api/campaigns")
async def get_campaigns():
    """Get list of campaigns (placeholder)"""
    return {
        "campaigns": [],
        "message": "Campaign history feature coming soon",
        "timestamp": datetime.now().isoformat()
    }

# CORS middleware for frontend
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Export the app for Vercel
handler = app