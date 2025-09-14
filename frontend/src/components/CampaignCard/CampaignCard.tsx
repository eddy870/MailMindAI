import React from 'react';
import './CampaignCard.css';

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

interface CampaignCardProps {
  campaign: CampaignAnalysis;
  onClick: () => void;
}

const CampaignCard: React.FC<CampaignCardProps> = ({ campaign, onClick }) => {
  const getPerformanceScore = () => {
    const { open_rate, click_rate, conversion_rate } = campaign.campaign_data;
    const score = (open_rate + click_rate * 5 + conversion_rate * 10) / 3;
    
    if (score >= 80) return { label: 'Excellent', color: '#10b981', emoji: '🚀' };
    if (score >= 60) return { label: 'Good', color: '#059669', emoji: '✅' };
    if (score >= 40) return { label: 'Average', color: '#f59e0b', emoji: '⚠️' };
    return { label: 'Needs Work', color: '#ef4444', emoji: '🔥' };
  };

  const getMLConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'High': return '#10b981';
      case 'Medium': return '#f59e0b';
      case 'Low': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const performance = getPerformanceScore();
  const hasTargetData = campaign.campaign_data.target_market || 
                       campaign.campaign_data.target_age_range || 
                       campaign.campaign_data.target_industry || 
                       campaign.campaign_data.target_company_size;

  return (
    <div className="campaign-card" onClick={onClick}>
      <div className="campaign-card-header">
        <div className="campaign-card-title">
          <h3>{campaign.campaign_data.campaign_name}</h3>
          <span className="campaign-date">
            {new Date(campaign.analyzed_at).toLocaleDateString()}
          </span>
        </div>
        <div 
          className="performance-badge"
          style={{ backgroundColor: performance.color }}
        >
          <span className="performance-emoji">{performance.emoji}</span>
          <span className="performance-label">{performance.label}</span>
        </div>
      </div>

      <div className="campaign-metrics-grid">
        <div className="metric-item">
          <div className="metric-value">{campaign.campaign_data.emails_sent.toLocaleString()}</div>
          <div className="metric-label">📨 Emails Sent</div>
        </div>
        <div className="metric-item">
          <div className="metric-value">{campaign.campaign_data.open_rate}%</div>
          <div className="metric-label">📖 Open Rate</div>
        </div>
        <div className="metric-item">
          <div className="metric-value">{campaign.campaign_data.click_rate}%</div>
          <div className="metric-label">👆 Click Rate</div>
        </div>
        <div className="metric-item">
          <div className="metric-value">{campaign.campaign_data.conversion_rate}%</div>
          <div className="metric-label">💰 Conversion</div>
        </div>
      </div>

      {hasTargetData && (
        <div className="target-market-preview">
          <div className="target-market-title">🎯 Target Market</div>
          <div className="target-market-tags">
            {campaign.campaign_data.target_age_range && (
              <span className="target-tag">👥 {campaign.campaign_data.target_age_range}</span>
            )}
            {campaign.campaign_data.target_industry && (
              <span className="target-tag">🏢 {campaign.campaign_data.target_industry}</span>
            )}
            {campaign.campaign_data.target_company_size && (
              <span className="target-tag">🏗️ {campaign.campaign_data.target_company_size}</span>
            )}
          </div>
        </div>
      )}

      {campaign.ml_prediction && (
        <div className="ml-prediction-preview">
          <div className="ml-header">
            <span className="ml-icon">🤖</span>
            <span className="ml-title">ML Prediction</span>
            <span 
              className="ml-confidence-badge"
              style={{ backgroundColor: getMLConfidenceColor(campaign.ml_prediction.confidence) }}
            >
              {campaign.ml_prediction.confidence}
            </span>
          </div>
          {campaign.ml_prediction.confidence !== 'Low' && (
            <div className="ml-improvements">
              <div className="ml-improvement">
                📈 Open: +{campaign.ml_prediction.open_rate_improvement_percent}%
              </div>
              <div className="ml-improvement">
                📈 Click: +{campaign.ml_prediction.click_rate_improvement_percent}%
              </div>
            </div>
          )}
        </div>
      )}

      <div className="campaign-card-footer">
        <div className="weak-spots-count">
          ⚠️ {campaign.weak_spots.length} area{campaign.weak_spots.length !== 1 ? 's' : ''} to improve
        </div>
        <div className="view-details">
          <span>View Details</span>
          <span className="arrow">→</span>
        </div>
      </div>

      <div className="card-hover-overlay">
        <div className="hover-text">Click to view detailed analysis</div>
      </div>
    </div>
  );
};

export default CampaignCard;