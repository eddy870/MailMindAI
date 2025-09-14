import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import './CampaignModal.css';

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

interface CampaignModalProps {
  campaign: CampaignAnalysis | null;
  isOpen: boolean;
  onClose: () => void;
}

const CampaignModal: React.FC<CampaignModalProps> = ({ campaign, isOpen, onClose }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Small delay to trigger entrance animation
      setTimeout(() => setIsAnimating(true), 50);
    } else {
      setIsAnimating(false);
    }
  }, [isOpen]);

  if (!isOpen || !campaign) return null;

  const getMLConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'High': return '#10b981';
      case 'Medium': return '#f59e0b';
      case 'Low': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const hasTargetData = campaign.campaign_data.target_market || 
                       campaign.campaign_data.target_age_range || 
                       campaign.campaign_data.target_industry || 
                       campaign.campaign_data.target_company_size;

  return (
    <div className={`modal-overlay ${isAnimating ? 'modal-entering' : ''}`} onClick={onClose}>
      <div className={`modal-content ${isAnimating ? 'modal-content-entering' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-section">
            <h2 className="modal-title">{campaign.campaign_data.campaign_name}</h2>
            <p className="modal-subtitle">
              Analyzed on {new Date(campaign.analyzed_at).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <button className="modal-close" onClick={onClose}>
            <span>✕</span>
          </button>
        </div>

        <div className="modal-body">
          {/* Campaign Overview */}
          <section className="modal-section">
            <h3 className="section-title">📊 Your Campaign Overview</h3>
            <div className="overview-summary">
              <p className="overview-text">
                You sent <strong>{campaign.campaign_data.emails_sent.toLocaleString()} emails</strong> and achieved:
              </p>
              <div className="metrics-summary-grid">
                <div className="metric-summary-card">
                  <div className="metric-icon">📧</div>
                  <div className="metric-content">
                    <div className="metric-number">{campaign.campaign_data.open_rate}%</div>
                    <div className="metric-description">of people opened your email</div>
                  </div>
                </div>
                <div className="metric-summary-card">
                  <div className="metric-icon">👆</div>
                  <div className="metric-content">
                    <div className="metric-number">{campaign.campaign_data.click_rate}%</div>
                    <div className="metric-description">clicked on your links</div>
                  </div>
                </div>
                <div className="metric-summary-card">
                  <div className="metric-icon">💰</div>
                  <div className="metric-content">
                    <div className="metric-number">{campaign.campaign_data.conversion_rate}%</div>
                    <div className="metric-description">took the desired action</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Target Market */}
          {hasTargetData && (
            <section className="modal-section">
              <h3 className="section-title">🎯 Target Market Analysis</h3>
              <div className="target-market-detailed">
                {campaign.campaign_data.target_market && 
                 campaign.campaign_data.target_market.length < 100 && (
                  <div className="target-item">
                    <span className="target-icon">📊</span>
                    <span className="target-label">Market Description:</span>
                    <span className="target-value">{campaign.campaign_data.target_market}</span>
                  </div>
                )}
                {campaign.campaign_data.target_age_range && (
                  <div className="target-item">
                    <span className="target-icon">👥</span>
                    <span className="target-label">Age Range:</span>
                    <span className="target-value">{campaign.campaign_data.target_age_range}</span>
                  </div>
                )}
                {campaign.campaign_data.target_industry && (
                  <div className="target-item">
                    <span className="target-icon">🏢</span>
                    <span className="target-label">Industry:</span>
                    <span className="target-value">{campaign.campaign_data.target_industry}</span>
                  </div>
                )}
                {campaign.campaign_data.target_company_size && (
                  <div className="target-item">
                    <span className="target-icon">🏗️</span>
                    <span className="target-label">Company Size:</span>
                    <span className="target-value">{campaign.campaign_data.target_company_size}</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Predicted Results */}
          {campaign.ml_prediction && (
            <section className="modal-section">
              <h3 className="section-title">
                🔮 What You Could Achieve Next
                <span 
                  className="confidence-badge"
                  style={{ backgroundColor: getMLConfidenceColor(campaign.ml_prediction.confidence) }}
                >
                  {campaign.ml_prediction.confidence === 'High' ? '🎯 High Accuracy' : 
                   campaign.ml_prediction.confidence === 'Medium' ? '📊 Good Estimate' : 
                   '📈 Early Prediction'}
                </span>
              </h3>
              {campaign.ml_prediction.confidence !== 'Low' ? (
                <div className="predictions-improved">
                  <p className="predictions-intro">
                    If you implement our recommendations, here's what we predict for your next campaign:
                  </p>
                  <div className="prediction-results">
                    <div className="prediction-card">
                      <div className="prediction-header">
                        <span className="prediction-icon">�</span>
                        <span className="prediction-title">Email Opens</span>
                      </div>
                      <div className="prediction-comparison">
                        <span className="current-value">Current: {campaign.campaign_data.open_rate}%</span>
                        <span className="prediction-arrow">→</span>
                        <span className="predicted-value">Predicted: {campaign.ml_prediction.predicted_open_rate}%</span>
                      </div>
                      <div className="improvement-highlight">
                        +{campaign.ml_prediction.open_rate_improvement_percent}% improvement
                      </div>
                    </div>
                    
                    <div className="prediction-card">
                      <div className="prediction-header">
                        <span className="prediction-icon">👆</span>
                        <span className="prediction-title">Link Clicks</span>
                      </div>
                      <div className="prediction-comparison">
                        <span className="current-value">Current: {campaign.campaign_data.click_rate}%</span>
                        <span className="prediction-arrow">→</span>
                        <span className="predicted-value">Predicted: {campaign.ml_prediction.predicted_click_rate}%</span>
                      </div>
                      <div className="improvement-highlight">
                        +{campaign.ml_prediction.click_rate_improvement_percent}% improvement
                      </div>
                    </div>
                    
                    <div className="prediction-card">
                      <div className="prediction-header">
                        <span className="prediction-icon">💰</span>
                        <span className="prediction-title">Conversions</span>
                      </div>
                      <div className="prediction-comparison">
                        <span className="current-value">Current: {campaign.campaign_data.conversion_rate}%</span>
                        <span className="prediction-arrow">→</span>
                        <span className="predicted-value">Predicted: {campaign.ml_prediction.predicted_conversion_rate}%</span>
                      </div>
                      <div className="improvement-highlight">
                        +{campaign.ml_prediction.conversion_rate_improvement_percent}% improvement
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="low-confidence-message">
                  <div className="confidence-explanation">
                    <h4>🌱 Building Better Predictions</h4>
                    <p>We need more campaign data to give you accurate predictions. Add 3-5 more campaigns to unlock precise ML forecasts!</p>
                    <div className="confidence-benefits">
                      <span>✓ More accurate predictions</span>
                      <span>✓ Personalized recommendations</span>
                      <span>✓ Better campaign optimization</span>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* What Could Be Better */}
          <section className="modal-section">
            <h3 className="section-title">⚠️ What Could Be Better</h3>
            <div className="improvement-areas">
              <p className="improvement-intro">Based on your campaign data, here are areas where you can improve:</p>
              <div className="weak-spots-improved">
                {campaign.weak_spots.map((spot, idx) => (
                  <div key={idx} className="improvement-item">
                    <div className="improvement-icon">💡</div>
                    <div className="improvement-text">{spot}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* AI-Powered Recommendations */}
          <section className="modal-section">
            <h3 className="section-title">🤖 How to Improve Your Next Campaign</h3>
            <div className="recommendations-improved">
              <p className="recommendations-intro">Our AI analyzed your campaign and suggests these specific improvements:</p>
              <div className="ai-recommendations-enhanced">
                <ReactMarkdown>
                  {Array.isArray(campaign.ai_suggestions) 
                    ? campaign.ai_suggestions.join('\n\n') 
                    : campaign.ai_suggestions}
                </ReactMarkdown>
              </div>
            </div>
          </section>

          {/* Expected Impact */}
          <section className="modal-section final-section">
            <h3 className="section-title">🎯 Bottom Line</h3>
            <div className="impact-summary">
              <div className="impact-card">
                <p className="impact-text">{campaign.estimated_improvement}</p>
                <div className="next-steps">
                  <h4>👉 Next Steps:</h4>
                  <ul className="action-items">
                    <li>Review the recommendations above</li>
                    <li>Implement 2-3 key improvements</li>
                    <li>Test your next campaign</li>
                    <li>Compare results and iterate</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CampaignModal;