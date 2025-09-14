import React, { useState, useEffect } from 'react';
import Hero from './components/Hero/Hero';
import CampaignForm from './components/CampaignForm/CampaignForm';
import CampaignsGrid from './components/CampaignsGrid/CampaignsGrid';
import CampaignModal from './components/CampaignModal/CampaignModal';
import Description from './components/Description/Description';
import './styles/globals.css';
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
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignAnalysis | null>(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Test connection to backend API
      const response = await fetch(`${API_BASE_URL}/`);
      const data: ApiResponse = await response.json();
      setApiStatus(data);
      
      // Load existing campaigns
      await loadCampaigns();
      setLoading(false);
    } catch (err) {
      console.error('API connection error:', err);
      setError('Failed to connect to backend API');
      setLoading(false);
    }
  };

  const loadCampaigns = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/campaigns`);
      const data = await response.json();
      setCampaigns(data);
    } catch (err) {
      console.error('Failed to load campaigns:', err);
    }
  };

  const handleStartAnalysis = () => {
    setShowForm(true);
  };

  const handleFormSubmit = async (formData: CampaignData) => {
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
        setShowForm(false);
        // Auto-open the newly created campaign
        setSelectedCampaign(analysis);
        // Update API status to reflect new campaign count
        setApiStatus(prev => prev ? { ...prev, total_campaigns: (prev.total_campaigns || 0) + 1 } : null);
      } else {
        throw new Error('Failed to analyze campaign');
      }
    } catch (err) {
      alert('Error analyzing campaign. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
  };

  const handleCampaignClick = (campaign: CampaignAnalysis) => {
    setSelectedCampaign(campaign);
  };

  const handleModalClose = () => {
    setSelectedCampaign(null);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <h2>Connecting to AI Email Analyzer...</h2>
          <p>Initializing backend services</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-screen">
        <div className="error-content">
          <div className="error-icon">❌</div>
          <h2>Connection Failed</h2>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={initializeApp}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <CampaignsGrid campaigns={campaigns} onCampaignClick={handleCampaignClick} />
      <Description />
      
      {showForm && (
        <CampaignForm
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          submitting={submitting}
        />
      )}
      
      <CampaignModal
        campaign={selectedCampaign}
        isOpen={!!selectedCampaign}
        onClose={handleModalClose}
      />
    </div>
  );
}

export default App;