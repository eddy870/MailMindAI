import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import './App.css';

interface ApiResponse {
  message: string;
  status: string;
  timestamp: string;
  version: string;
  openai_status?: string;
  ai_enabled?: boolean;
  total_campaigns?: number;
}

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

// API base URL - works for both local development and Vercel deployment
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:8000';

function App() {
  const [apiStatus, setApiStatus] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<CampaignAnalysis[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{[key: string]: {[section: string]: boolean}}>({});
  const [formData, setFormData] = useState<CampaignData>({
    campaign_name: '',
    emails_sent: 0,
    open_rate: 0,
    click_rate: 0,
    conversion_rate: 0
  });

  const toggleSection = (campaignId: string, section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [campaignId]: {
        ...prev[campaignId],
        [section]: !prev[campaignId]?.[section]
      }
    }));
  };

  useEffect(() => {
    // Test connection to backend API
    fetch(`${API_BASE_URL}/`)
      .then(response => response.json())
      .then((data: ApiResponse) => {
        setApiStatus(data);
        setLoading(false);
        loadCampaigns();
      })
      .catch(err => {
        console.error('API connection error:', err);
        setError('Failed to connect to backend API');
        setLoading(false);
      });
  }, []);

  const loadCampaigns = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/campaigns`);
      const data = await response.json();
      setCampaigns(data);
    } catch (err) {
      console.error('Failed to load campaigns:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/analyze-campaign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        const analysis = await response.json();
        setCampaigns([analysis, ...campaigns]);
        setFormData({
          campaign_name: '',
          emails_sent: 0,
          open_rate: 0,
          click_rate: 0,
          conversion_rate: 0
        });
        setShowForm(false);
      } else {
        throw new Error('Failed to analyze campaign');
      }
    } catch (err) {
      alert('Error analyzing campaign. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚀 AI Email Campaign Analyzer</h1>
        <p>Performance analysis and AI-powered recommendations</p>
        
        <div className="status-card">
          <h3>Backend API Status</h3>
          {loading && <p>Connecting to backend...</p>}
          {error && <p style={{color: '#ff6b6b'}}>❌ {error}</p>}
          {apiStatus && (
            <div>
              <p style={{color: '#51cf66'}}>✅ API Connected</p>
              <p>Status: {apiStatus.status}</p>
              {apiStatus.ai_enabled !== undefined && (
                <p style={{color: apiStatus.ai_enabled ? '#51cf66' : '#ffd43b'}}>
                  🤖 AI: {apiStatus.ai_enabled ? 'Real OpenAI GPT Enabled' : 'Fallback Mode (No API Key)'}
                </p>
              )}
              {apiStatus.total_campaigns !== undefined && (
                <p style={{color: '#61dafb'}}>
                  💾 Database: {apiStatus.total_campaigns} campaigns stored
                </p>
              )}
              <p>Last checked: {new Date(apiStatus.timestamp).toLocaleTimeString()}</p>
            </div>
          )}
        </div>

        {!loading && !error && (
          <>
            <div className="action-buttons">
              <button 
                className="primary-button" 
                onClick={() => setShowForm(!showForm)}
                disabled={submitting}
              >
                {showForm ? 'Cancel' : '📊 Analyze New Campaign'}
              </button>
            </div>

            {showForm && (
              <div className="campaign-form">
                <h3>📝 Campaign Data</h3>
                <form onSubmit={handleSubmit}>
                  <input
                    type="text"
                    placeholder="Campaign Name"
                    value={formData.campaign_name}
                    onChange={(e) => setFormData({...formData, campaign_name: e.target.value})}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Emails Sent"
                    value={formData.emails_sent || ''}
                    onChange={(e) => setFormData({...formData, emails_sent: parseInt(e.target.value) || 0})}
                    required
                    min="1"
                  />
                  <input
                    type="number"
                    placeholder="Open Rate %"
                    value={formData.open_rate || ''}
                    onChange={(e) => setFormData({...formData, open_rate: parseFloat(e.target.value) || 0})}
                    required
                    min="0"
                    max="100"
                    step="0.1"
                  />
                  <input
                    type="number"
                    placeholder="Click Rate %"
                    value={formData.click_rate || ''}
                    onChange={(e) => setFormData({...formData, click_rate: parseFloat(e.target.value) || 0})}
                    required
                    min="0"
                    max="100"
                    step="0.1"
                  />
                  <input
                    type="number"
                    placeholder="Conversion Rate %"
                    value={formData.conversion_rate || ''}
                    onChange={(e) => setFormData({...formData, conversion_rate: parseFloat(e.target.value) || 0})}
                    required
                    min="0"
                    max="100"
                    step="0.1"
                  />
                  
                  <h4 style={{marginTop: '20px', marginBottom: '10px', fontSize: '16px'}}>🎯 Target Market (Optional - Improves ML Predictions)</h4>
                  
                  <input
                    type="text"
                    placeholder="Target Market (e.g., B2B SaaS professionals, E-commerce shoppers)"
                    value={formData.target_market || ''}
                    onChange={(e) => setFormData({...formData, target_market: e.target.value})}
                  />
                  
                  <select
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
                  
                  <select
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
                  
                  <select
                    value={formData.target_company_size || ''}
                    onChange={(e) => setFormData({...formData, target_company_size: e.target.value})}
                  >
                    <option value="">Select Company Size</option>
                    <option value="Startup">Startup (1-10 employees)</option>
                    <option value="SMB">Small/Medium Business (11-500 employees)</option>
                    <option value="Enterprise">Enterprise (500+ employees)</option>
                  </select>
                  
                  <button type="submit" disabled={submitting} className="primary-button">
                    {submitting ? 'Analyzing...' : '🔍 Analyze Campaign'}
                  </button>
                </form>
              </div>
            )}

            <div className="campaigns-section">
              <h3>📈 Campaign Analyses ({campaigns.length})</h3>
              {campaigns.length === 0 ? (
                <p style={{opacity: 0.7}}>No campaigns analyzed yet. Add one above!</p>
              ) : (
                campaigns.map((campaign) => (
                  <div key={campaign.campaign_id} className="campaign-card">
                    <h4>📧 {campaign.campaign_data.campaign_name}</h4>
                    <div className="campaign-metrics">
                      <span>📨 {campaign.campaign_data.emails_sent} emails</span>
                      <span>📖 {campaign.campaign_data.open_rate}% open</span>
                      <span>👆 {campaign.campaign_data.click_rate}% click</span>
                      <span>💰 {campaign.campaign_data.conversion_rate}% convert</span>
                    </div>
                    
                    {(campaign.campaign_data.target_market || campaign.campaign_data.target_industry || 
                      campaign.campaign_data.target_age_range || campaign.campaign_data.target_company_size) && (
                      <div className="target-market-info">
                        <button 
                          className="collapsible-header"
                          onClick={() => toggleSection(campaign.campaign_id, 'target')}
                        >
                          <strong>🎯 Target Market</strong>
                          <span>{expandedSections[campaign.campaign_id]?.target ? '▼' : '▶'}</span>
                        </button>
                        {expandedSections[campaign.campaign_id]?.target && (
                          <div className="target-details">
                            {campaign.campaign_data.target_market && 
                             campaign.campaign_data.target_market.length < 100 && (
                              <span>📊 {campaign.campaign_data.target_market}</span>
                            )}
                            {campaign.campaign_data.target_age_range && (
                              <span>👥 {campaign.campaign_data.target_age_range}</span>
                            )}
                            {campaign.campaign_data.target_industry && (
                              <span>🏢 {campaign.campaign_data.target_industry}</span>
                            )}
                            {campaign.campaign_data.target_company_size && (
                              <span>🏗️ {campaign.campaign_data.target_company_size}</span>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="weak-spots">
                      <strong>⚠️ Areas for Improvement:</strong>
                      <ul>
                        {campaign.weak_spots.map((spot, idx) => (
                          <li key={idx}>{spot}</li>
                        ))}
                      </ul>
                    </div>
                    
                                        <div className="ai-suggestions">
                      <button 
                        className="collapsible-header"
                        onClick={() => toggleSection(campaign.campaign_id, 'ai')}
                      >
                        <strong>🤖 AI Recommendations</strong>
                        <span>{expandedSections[campaign.campaign_id]?.ai ? '▼' : '▶'}</span>
                      </button>
                      {expandedSections[campaign.campaign_id]?.ai && (
                        <div className="ai-content">
                          <ReactMarkdown>
                            {Array.isArray(campaign.ai_suggestions) 
                              ? campaign.ai_suggestions.join('\n\n') 
                              : campaign.ai_suggestions}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                    
                    {campaign.ml_prediction && (
                      <div className="ml-predictions">
                        <h5>🤖 ML Predictions (Confidence: {campaign.ml_prediction.confidence})</h5>
                        {campaign.ml_prediction.confidence !== 'Low' && (
                          <div className="prediction-metrics">
                            <div className="prediction-row">
                              <span>📖 Open Rate:</span>
                              <span>{campaign.campaign_data.open_rate}% → {campaign.ml_prediction.predicted_open_rate}% 
                                (+{campaign.ml_prediction.open_rate_improvement_percent}%)</span>
                            </div>
                            <div className="prediction-row">
                              <span>👆 Click Rate:</span>
                              <span>{campaign.campaign_data.click_rate}% → {campaign.ml_prediction.predicted_click_rate}% 
                                (+{campaign.ml_prediction.click_rate_improvement_percent}%)</span>
                            </div>
                            <div className="prediction-row">
                              <span>💰 Conversion Rate:</span>
                              <span>{campaign.campaign_data.conversion_rate}% → {campaign.ml_prediction.predicted_conversion_rate}% 
                                (+{campaign.ml_prediction.conversion_rate_improvement_percent}%)</span>
                            </div>
                          </div>
                        )}
                        {campaign.ml_prediction.confidence === 'Low' && (
                          <p style={{opacity: 0.7, fontSize: '14px'}}>
                            💡 Add more campaigns to get more accurate ML predictions!
                          </p>
                        )}
                      </div>
                    )}
                    
                    <div className="improvement-estimate">
                      <strong>🎯 Potential: {campaign.estimated_improvement}</strong>
                    </div>
                    
                    <div className="analysis-date">
                      Analyzed: {new Date(campaign.analyzed_at).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </header>
    </div>
  );
}

export default App;
