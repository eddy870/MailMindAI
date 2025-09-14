import React from 'react';
import './Description.css';

const Description: React.FC = () => {
  const scrollToHero = () => {
    const heroElement = document.querySelector('.hero-clean');
    if (heroElement) {
      heroElement.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    } else {
      // Fallback to scroll to top
      window.scrollTo({ 
        top: 0, 
        behavior: 'smooth' 
      });
    }
  };

  return (
    <section id="how-it-works" className="description-section">
      <div className="container">
        <div className="description-content">
          {/* Main Header */}
          <div className="description-header">
            <h1 className="main-title">Free Email Campaign AI Analyzer</h1>
            <p className="main-subtitle">
              Our free AI analyzer transforms your email campaign data into actionable insights with 
              minimal manual effort needed. It analyzes performance metrics from your campaigns, identifying 
              weak spots and opportunities, instantly providing recommendations that sound 
              genuinely helpful while optimizing your email marketing ROI.
            </p>
          </div>

          {/* How to Use Section */}
          <div className="how-to-section">
            <h2 className="section-title">How to use our Email Campaign AI Analyzer?</h2>
            <p className="section-subtitle">
              Analyze email campaigns effortlessly with our AI analyzer tool in just three simple steps:
            </p>
            
            <div className="steps-grid">
              <div className="step-card">
                <div className="step-number">1</div>
                <h3 className="step-title">Enter your campaign data</h3>
                <p className="step-description">
                  Start by entering your campaign metrics including emails sent, open rates, 
                  click rates, and conversion rates. Upload the campaign data that you would 
                  like to analyze.
                </p>
              </div>

              <div className="step-card">
                <div className="step-number">2</div>
                <h3 className="step-title">Click "Analyze"</h3>
                <p className="step-description">
                  Click the "Analyze" button located at the bottom of the form, and our AI 
                  will instantly analyze your campaign performance and identify improvement opportunities.
                </p>
              </div>

              <div className="step-card">
                <div className="step-number">3</div>
                <h3 className="step-title">Review your insights</h3>
                <p className="step-description">
                  Quickly review the AI-generated analysis to understand your campaign performance. 
                  When the results look good, you can copy them with the "Copy" button or download 
                  for future reference.
                </p>
              </div>
            </div>
          </div>

          {/* Why Use Section */}
          <div className="why-use-section">
            <h2 className="section-title">Why use our Email Campaign AI Analyzer?</h2>
            <p className="section-subtitle">
              Our analyzer was built to effortlessly optimize email campaigns, saving you time.
            </p>
            
            <div className="benefits-container">
              <div className="benefit-content">
                <div className="benefit-badge">Performance</div>
                <h3 className="benefit-title">Analyze to improve your campaign performance</h3>
                <p className="benefit-description">
                  Campaign data that is manually analyzed may cause marketers to miss 
                  optimization opportunities. Our AI analyzer makes your 
                  campaigns more effective, increasing your performance.
                </p>
              </div>
              
              <div className="benefit-visual">
                <div className="analysis-mockup">
                  <div className="mockup-header">
                    <div className="mockup-icon">�</div>
                    <span>Email Analysis for 2024</span>
                  </div>
                  <div className="mockup-content">
                    <div className="metric-row">
                      <span className="metric-label">Our trend analysis for 2024:</span>
                    </div>
                    <div className="metric-row">
                      <span className="metric-text">
                        We performed our trend analysis combining 
                        historical data, qualitative assessments, and 
                        professional knowledge.
                      </span>
                    </div>
                    <div className="action-buttons">
                      <button 
                        className="analyze-btn"
                        onClick={scrollToHero}
                      >
                        ✓ Analyzed
                      </button>
                      <div className="share-icons">
                        <span>📊</span>
                        <span>📈</span>
                        <span>💡</span>
                        <span>⭐</span>
                        <span>📤</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Integration Section */}
          <div className="integration-section">
            <div className="integration-visual">
              <div className="integration-circle">
                <div className="integration-icon email-icon">📧</div>
                <div className="integration-icon analytics-icon">📊</div>
                <div className="integration-icon ai-icon">🤖</div>
                <div className="integration-icon chart-icon">📈</div>
                <div className="integration-icon optimization-icon">⚡</div>
                <div className="integration-icon report-icon">📋</div>
                <div className="center-bot">
                  <div className="bot-face">🤖</div>
                </div>
              </div>
            </div>
            
            <div className="integration-content">
              <div className="integration-badge">Integrations</div>
              <h3 className="integration-title">Get campaign insights wherever you go</h3>
              <p className="integration-description">
                Our analyzer works across all of your favorite platforms and workflows, so you can 
                optimize email campaigns on every platform.
              </p>
              <div className="integration-stats">
                <div className="stat-item">
                  <span className="stat-icon">⭐</span>
                  <span className="stat-text">One of marketer's favorite extension</span>
                  <span className="stat-rating">4.7/5</span>
                  <span className="stat-users">25M+ users</span>
                </div>
              </div>
              <div className="integration-actions">
                <button 
                  className="btn btn-primary"
                  onClick={scrollToHero}
                >
                  Try it free!
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={scrollToHero}
                >
                  Get started
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Description;