import React from 'react';
import CampaignCard from '../CampaignCard/CampaignCard';
import './CampaignsGrid.css';

interface CampaignData {
  campaign_name: string;
  emails_sent: number;
  open_rate: number;
  click_rate: number;
  conversion_rate: number;
  target_market?: string;
  target_age_range?: string;
  target_industry?: string;
  target_company_size?: string;
}

interface CampaignAnalysis {
  campaign_id: string;
  campaign_data: CampaignData;
  weak_spots: string[];
  ai_suggestions: string[];
  estimated_improvement: string;
  ml_prediction?: {
    open_rate_improvement_percent: number;
    click_rate_improvement_percent: number;
    conversion_rate_improvement_percent: number;
    predicted_open_rate: number;
    predicted_click_rate: number;
    predicted_conversion_rate: number;
    confidence: string;
  };
  analyzed_at: string;
}

interface CampaignsGridProps {
  campaigns: CampaignAnalysis[];
  onCampaignClick: (campaign: CampaignAnalysis) => void;
}

const CampaignsGrid: React.FC<CampaignsGridProps> = ({ campaigns, onCampaignClick }) => {
  if (campaigns.length === 0) {
    return (
      <section className="campaigns-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">📈 Your Campaign Analyses</h2>
            <p className="section-subtitle">No campaigns analyzed yet</p>
          </div>
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h3 className="empty-title">Ready to Get Started?</h3>
            <p className="empty-description">
              Analyze your first email campaign to get AI-powered insights and improve your marketing ROI.
            </p>
            <button 
              className="btn btn-primary btn-large"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <span>🚀</span>
              Analyze Your First Campaign
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="campaigns-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">
            📈 Your Campaign Analyses
            <span className="campaign-count">({campaigns.length})</span>
          </h2>
          <p className="section-subtitle">
            Click on any campaign card to view detailed analysis and recommendations
          </p>
        </div>
        
        <div className="campaigns-grid">
          {campaigns.map((campaign, index) => (
            <div 
              key={campaign.campaign_id} 
              className="campaign-item"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CampaignCard 
                campaign={campaign} 
                onClick={() => onCampaignClick(campaign)} 
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CampaignsGrid;