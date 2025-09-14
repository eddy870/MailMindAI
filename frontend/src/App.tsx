import React, { useState, useEffect, lazy, Suspense } from 'react';
import Hero from './components/Hero/Hero';
import CampaignModal from './components/CampaignModal/CampaignModal';
import CampaignsGrid from './components/CampaignsGrid/CampaignsGrid';
import LoadingAnimation from './components/LoadingAnimation/LoadingAnimation';
import './styles/globals.css';

// Lazy load non-critical components
const Description = lazy(() => import('./components/Description/Description'));

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
  const [campaigns, setCampaigns] = useState<CampaignAnalysis[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignAnalysis | null>(null);
  const [newAnalysis, setNewAnalysis] = useState<CampaignAnalysis | null>(null);
  const [showLoading, setShowLoading] = useState(false);
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [pendingAnalysis, setPendingAnalysis] = useState<CampaignAnalysis | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Test connection to backend API
        const response = await fetch(`${API_BASE_URL}/`);
        const data: ApiResponse = await response.json();
        setApiStatus(data);
        await loadCampaigns();
      } catch (err) {
        console.error('API connection error:', err);
        // Continue without API connection for demo purposes
      }
    };

    initializeApp();
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

  const handleSubmit = async (campaignData: CampaignData) => {
    setSubmitting(true);
    setShowLoading(true);
    setLoadingComplete(false);
    
    try {
      const response = await fetch(`${API_BASE_URL}/analyze-campaign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(campaignData)
      });
      
      if (response.ok) {
        const analysis = await response.json();
        setCampaigns([analysis, ...campaigns]);
        // Store the analysis to show after loading animation
        setPendingAnalysis(analysis);
        // Signal that the API call is complete
        setLoadingComplete(true);
      } else {
        throw new Error('Failed to analyze campaign');
      }
    } catch (err) {
      alert('Error analyzing campaign. Please try again.');
      setShowLoading(false);
      setLoadingComplete(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoadingComplete = () => {
    setShowLoading(false);
    setLoadingComplete(false);
    if (pendingAnalysis) {
      setNewAnalysis(pendingAnalysis);
      setPendingAnalysis(null);
    }
  };

  const handleCloseModal = () => {
    setSelectedCampaign(null);
    setNewAnalysis(null);
  };

  return (
    <div className="app">
      <Hero 
        onSubmit={handleSubmit}
        apiStatus={apiStatus}
        submitting={submitting}
      />
      
      <main className="main-content">
        <CampaignsGrid 
          campaigns={campaigns}
          onCampaignClick={setSelectedCampaign}
        />
        
        <Suspense fallback={<div className="loading-container">Loading...</div>}>
          <Description />
        </Suspense>
      </main>

      {/* Loading Animation */}
      <LoadingAnimation 
        isVisible={showLoading}
        isComplete={loadingComplete}
        onComplete={handleLoadingComplete}
      />

      {/* Results Modal */}
      {(selectedCampaign || newAnalysis) && (
        <CampaignModal
          campaign={selectedCampaign || newAnalysis}
          isOpen={!!(selectedCampaign || newAnalysis)}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

export default App;