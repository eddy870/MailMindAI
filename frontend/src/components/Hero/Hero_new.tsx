import React, { useState } from 'react';
import './Hero.css';

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

interface HeroProps {
  onSubmit: (data: CampaignData) => void;
  apiStatus: any;
  submitting: boolean;
}

const Hero: React.FC<HeroProps> = ({ onSubmit, apiStatus, submitting }) => {
  const [formData, setFormData] = useState<CampaignData>({
    campaign_name: '',
    emails_sent: 0,
    open_rate: 0,
    click_rate: 0,
    conversion_rate: 0
  });

  const [activeTab, setActiveTab] = useState<'basic' | 'advanced'>('basic');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (field: keyof CampaignData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const fillSampleData = () => {
    setFormData({
      campaign_name: 'Holiday Sale 2024',
      emails_sent: 10000,
      open_rate: 22.5,
      click_rate: 3.2,
      conversion_rate: 1.8,
      target_market: 'E-commerce customers aged 25-45'
    });
  };

  return (
    <section className="hero-clean">
      <div className="hero-container">
        <div className="hero-header">
          <h1 className="hero-main-title">
            Analyze Email Campaign Performance Instantly With AI
          </h1>
          <p className="hero-subtitle">
            Enter your campaign data below to get AI-powered analysis and improvement recommendations.
          </p>
        </div>

        <div className="hero-form-container">
          <div className="form-tabs">
            <button 
              className={`tab ${activeTab === 'basic' ? 'active' : ''}`}
              onClick={() => setActiveTab('basic')}
            >
              Basic
            </button>
            <button 
              className={`tab ${activeTab === 'advanced' ? 'active' : ''}`}
              onClick={() => setActiveTab('advanced')}
            >
              Advanced
            </button>
          </div>

          <form onSubmit={handleSubmit} className="campaign-analysis-form">
            <div className="form-main-area">
              <div className="form-row-primary">
                <input
                  type="text"
                  placeholder="Enter your campaign name here and press 'Analyze'"
                  value={formData.campaign_name}
                  onChange={(e) => handleInputChange('campaign_name', e.target.value)}
                  className="form-input primary-input"
                  required
                />
              </div>
              
              <div className="form-grid">
                <input
                  type="number"
                  placeholder="Emails Sent"
                  value={formData.emails_sent || ''}
                  onChange={(e) => handleInputChange('emails_sent', parseInt(e.target.value) || 0)}
                  className="form-input"
                  required
                  min="1"
                />
                <input
                  type="number"
                  placeholder="Open Rate %"
                  value={formData.open_rate || ''}
                  onChange={(e) => handleInputChange('open_rate', parseFloat(e.target.value) || 0)}
                  className="form-input"
                  required
                  min="0"
                  max="100"
                  step="0.1"
                />
                <input
                  type="number"
                  placeholder="Click Rate %"
                  value={formData.click_rate || ''}
                  onChange={(e) => handleInputChange('click_rate', parseFloat(e.target.value) || 0)}
                  className="form-input"
                  required
                  min="0"
                  max="100"
                  step="0.1"
                />
                <input
                  type="number"
                  placeholder="Conversion Rate %"
                  value={formData.conversion_rate || ''}
                  onChange={(e) => handleInputChange('conversion_rate', parseFloat(e.target.value) || 0)}
                  className="form-input"
                  required
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>

              {activeTab === 'advanced' && (
                <div className="advanced-fields">
                  <input
                    type="text"
                    placeholder="Target Market (e.g., B2B SaaS professionals, E-commerce shoppers)"
                    value={formData.target_market || ''}
                    onChange={(e) => handleInputChange('target_market', e.target.value)}
                    className="form-input"
                  />
                  <select
                    value={formData.target_age_range || ''}
                    onChange={(e) => handleInputChange('target_age_range', e.target.value)}
                    className="form-input"
                  >
                    <option value="">Select Age Range</option>
                    <option value="18-25">18-25</option>
                    <option value="25-35">25-35</option>
                    <option value="35-45">35-45</option>
                    <option value="45-55">45-55</option>
                    <option value="55-65">55-65</option>
                    <option value="65+">65+</option>
                  </select>
                  <select
                    value={formData.target_industry || ''}
                    onChange={(e) => handleInputChange('target_industry', e.target.value)}
                    className="form-input"
                  >
                    <option value="">Select Industry</option>
                    <option value="Technology">Technology</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Finance">Finance</option>
                    <option value="E-commerce">E-commerce</option>
                    <option value="Education">Education</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              )}

              <div className="form-actions">
                <div className="action-buttons">
                  <button 
                    type="button"
                    className="quick-action-btn"
                    onClick={fillSampleData}
                  >
                    <span>👋</span>
                    Try Sample Data
                  </button>
                  <button 
                    type="button"
                    className="quick-action-btn"
                  >
                    <span>📤</span>
                    Upload CSV
                  </button>
                </div>
                
                <button 
                  type="submit"
                  className="analyze-button"
                  disabled={submitting}
                >
                  {submitting ? 'Analyzing...' : 'Analyze'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {apiStatus && (
          <div className="status-indicator">
            <span className={`status-dot ${apiStatus.ai_enabled ? 'connected' : 'limited'}`}></span>
            AI Analysis {apiStatus.ai_enabled ? 'Ready' : 'Limited Mode'}
          </div>
        )}
      </div>
    </section>
  );
};

export default Hero;