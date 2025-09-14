from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime
import json

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all domains

@app.route('/', methods=['GET'])
@app.route('/api/', methods=['GET'])
def root():
    """Root endpoint"""
    return jsonify({
        "message": "MailMind AI API",
        "version": "1.0.0",
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "ai_enabled": True,
        "openai_status": "connected",
        "total_campaigns": 2,
        "endpoints": ["/health", "/analyze", "/analyze-campaign", "/campaigns"]
    })

@app.route('/health', methods=['GET'])
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "MailMind AI API"
    })

@app.route('/analyze', methods=['POST'])
@app.route('/api/analyze', methods=['POST'])
def analyze_campaign():
    """Mock analysis endpoint"""
    return jsonify({
        "analysis": {
            "overall_score": 75,
            "areas_for_improvement": [
                "Increase email personalization",
                "Optimize send time",
                "A/B test subject lines"
            ],
            "ai_recommendations": [
                "Consider segmenting your audience for better targeting",
                "Test different call-to-action buttons",
                "Improve mobile responsiveness"
            ]
        }
    })

@app.route('/analyze-campaign', methods=['POST'])
@app.route('/api/analyze-campaign', methods=['POST'])
def analyze_campaign_detailed():
    """Detailed campaign analysis endpoint"""
    try:
        # Get request data
        data = request.get_json() if request.is_json else {}
        
        # Extract campaign data
        campaign_name = data.get('campaign_name', 'Unknown Campaign')
        emails_sent = data.get('emails_sent', 1000)
        open_rate = data.get('open_rate', 20.0)
        click_rate = data.get('click_rate', 5.0)
        conversion_rate = data.get('conversion_rate', 2.0)
        
        # Generate campaign ID
        import time
        campaign_id = f"campaign_{int(time.time())}"
        
        # Return response matching frontend's expected format
        return jsonify({
            "campaign_id": campaign_id,
            "campaign_data": {
                "campaign_name": campaign_name,
                "emails_sent": emails_sent,
                "open_rate": open_rate,
                "click_rate": click_rate,
                "conversion_rate": conversion_rate,
                "target_market": data.get('target_market'),
                "target_age_range": data.get('target_age_range'),
                "target_industry": data.get('target_industry'),
                "target_company_size": data.get('target_company_size')
            },
            "weak_spots": [
                "Subject line optimization needed",
                "Call-to-action placement could be improved", 
                "Mobile optimization required",
                "Personalization opportunities missed"
            ],
            "ai_suggestions": [
                f"For {campaign_name}: Consider A/B testing different subject lines to improve open rates",
                "Implement personalized content based on user behavior and demographics",
                "Optimize email templates for mobile devices to capture mobile users",
                "Add urgency elements to increase click-through rates",
                "Segment your audience for more targeted messaging"
            ],
            "estimated_improvement": "Implementing these suggestions could improve overall performance by 15-25%",
            "ml_prediction": {
                "open_rate_improvement_percent": round(open_rate * 0.15, 1),
                "click_rate_improvement_percent": round(click_rate * 0.20, 1),
                "conversion_rate_improvement_percent": round(conversion_rate * 0.25, 1),
                "predicted_open_rate": round(open_rate * 1.15, 1),
                "predicted_click_rate": round(click_rate * 1.20, 1),
                "predicted_conversion_rate": round(conversion_rate * 1.25, 1),
                "confidence": "High (85%)"
            },
            "analyzed_at": datetime.utcnow().isoformat()
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/campaigns', methods=['GET'])
@app.route('/api/campaigns', methods=['GET'])
def get_campaigns():
    """Get saved campaigns endpoint"""
    # Mock saved campaigns data in the expected format
    return jsonify([
        {
            "campaign_id": "campaign_1694702400",
            "campaign_data": {
                "campaign_name": "Summer Sale 2024",
                "emails_sent": 5000,
                "open_rate": 28.5,
                "click_rate": 8.2,
                "conversion_rate": 3.1,
                "target_market": "B2C",
                "target_industry": "E-commerce"
            },
            "weak_spots": [
                "Subject line could be more compelling",
                "Call-to-action placement needs optimization"
            ],
            "ai_suggestions": [
                "Test different subject line variations",
                "Optimize CTA button placement and color"
            ],
            "estimated_improvement": "Could improve performance by 18%",
            "ml_prediction": {
                "predicted_open_rate": 32.8,
                "predicted_click_rate": 9.8,
                "predicted_conversion_rate": 3.9,
                "confidence": "High (89%)"
            },
            "analyzed_at": "2024-09-14T10:30:00Z"
        },
        {
            "campaign_id": "campaign_1694616000",
            "campaign_data": {
                "campaign_name": "Holiday Promotion",
                "emails_sent": 3200,
                "open_rate": 22.1,
                "click_rate": 6.5,
                "conversion_rate": 2.8,
                "target_market": "B2B",
                "target_industry": "Technology"
            },
            "weak_spots": [
                "Low open rate indicates subject line issues",
                "Mobile optimization needed"
            ],
            "ai_suggestions": [
                "Improve subject line personalization",
                "Optimize for mobile viewing"
            ],
            "estimated_improvement": "Could improve performance by 22%",
            "ml_prediction": {
                "predicted_open_rate": 27.0,
                "predicted_click_rate": 7.8,
                "predicted_conversion_rate": 3.4,
                "confidence": "Medium (75%)"
            },
            "analyzed_at": "2024-09-13T14:20:00Z"
        }
    ])

if __name__ == '__main__':
    app.run(debug=True)