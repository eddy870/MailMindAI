import React, { useState } from 'react';
import './CampaignForm.css';

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

interface CampaignFormProps {
  onSubmit: (data: CampaignData) => void;
  onCancel: () => void;
  submitting: boolean;
}

const CampaignForm: React.FC<CampaignFormProps> = ({ onSubmit, onCancel, submitting }) => {
  const [formData, setFormData] = useState<CampaignData>({
    campaign_name: '',
    emails_sent: 0,
    open_rate: 0,
    click_rate: 0,
    conversion_rate: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="form-overlay" onClick={onCancel}>
      <div className="form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="form-header">
          <h2 className="form-title">📊 Analyze New Campaign</h2>
          <p className="form-subtitle">Enter your campaign metrics to get AI-powered insights</p>
          <button className="form-close" onClick={onCancel}>✕</button>
        </div>
        
        <form className="campaign-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h3 className="section-title">📧 Campaign Metrics</h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Campaign Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Black Friday Newsletter"
                  value={formData.campaign_name}
                  onChange={(e) => setFormData({...formData, campaign_name: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Emails Sent</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g., 10000"
                  value={formData.emails_sent || ''}
                  onChange={(e) => setFormData({...formData, emails_sent: parseInt(e.target.value) || 0})}
                  required
                  min="1"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Open Rate (%)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g., 22.5"
                  value={formData.open_rate || ''}
                  onChange={(e) => setFormData({...formData, open_rate: parseFloat(e.target.value) || 0})}
                  required
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Click Rate (%)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g., 3.2"
                  value={formData.click_rate || ''}
                  onChange={(e) => setFormData({...formData, click_rate: parseFloat(e.target.value) || 0})}
                  required
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Conversion Rate (%)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g., 1.8"
                  value={formData.conversion_rate || ''}
                  onChange={(e) => setFormData({...formData, conversion_rate: parseFloat(e.target.value) || 0})}
                  required
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
            </div>
          </div>
          
          <div className="form-section">
            <h3 className="section-title">🎯 Target Market (Optional - Improves ML Predictions)</h3>
            <div className="form-grid">
              <div className="form-group form-group-wide">
                <label className="form-label">Target Market Description</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., B2B SaaS professionals, E-commerce shoppers"
                  value={formData.target_market || ''}
                  onChange={(e) => setFormData({...formData, target_market: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Age Range</label>
                <select
                  className="form-select"
                  value={formData.target_age_range || ''}
                  onChange={(e) => setFormData({...formData, target_age_range: e.target.value})}
                >
                  <option value="">Select Age Range</option>
                  <option value="18-25">18-25</option>
                  <option value="25-35">25-35</option>
                  <option value="35-45">35-45</option>
                  <option value="45-55">45-55</option>
                  <option value="55-65">55-65</option>
                  <option value="65+">65+</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Industry</label>
                <select
                  className="form-select"
                  value={formData.target_industry || ''}
                  onChange={(e) => setFormData({...formData, target_industry: e.target.value})}
                >
                  <option value="">Select Industry</option>
                  <option value="Technology">Technology</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Finance">Finance</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="Education">Education</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Retail">Retail</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Company Size</label>
                <select
                  className="form-select"
                  value={formData.target_company_size || ''}
                  onChange={(e) => setFormData({...formData, target_company_size: e.target.value})}
                >
                  <option value="">Select Company Size</option>
                  <option value="Startup">Startup (1-10 employees)</option>
                  <option value="SMB">Small/Medium Business (11-500 employees)</option>
                  <option value="Enterprise">Enterprise (500+ employees)</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? (
                <>
                  <span className="spinner"></span>
                  Analyzing...
                </>
              ) : (
                <>
                  <span>🔍</span>
                  Analyze Campaign
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CampaignForm;