import React, { useEffect, useState } from 'react';
import './LoadingAnimation.css';

interface LoadingAnimationProps {
  isVisible: boolean;
  isComplete: boolean;
  onComplete: () => void;
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ isVisible, isComplete, onComplete }) => {
  const [stage, setStage] = useState<'loading' | 'completing' | 'finished'>('loading');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setStage('loading');
      setProgress(0);
      return;
    }

    // Simulate analysis progress, but don't auto-complete
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          // Stay at 95% and wait for external completion signal
          clearInterval(progressInterval);
          return 95;
        }
        return prev + Math.random() * 10 + 3; // Random progress increments
      });
    }, 300);

    return () => clearInterval(progressInterval);
  }, [isVisible]);

  useEffect(() => {
    if (isComplete && isVisible) {
      setProgress(100);
      setStage('completing');
      // Trigger completion animation
      setTimeout(() => {
        setStage('finished');
        setTimeout(() => {
          onComplete();
        }, 800); // Allow time for final animation
      }, 1000);
    }
  }, [isComplete, isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className={`loading-overlay ${stage}`}>
      <div className="loading-container">
        {/* Email Animation Container */}
        <div className="email-animation-container">
          {/* Multiple email emojis with different animations */}
          {[...Array(8)].map((_, index) => (
            <div
              key={index}
              className={`email-emoji email-${index + 1} ${stage === 'completing' ? 'completing' : ''}`}
              style={{
                animationDelay: `${index * 0.2}s`,
              }}
            >
              📧
            </div>
          ))}
          
          {/* Central AI brain emoji */}
          <div className={`ai-brain ${stage === 'completing' ? 'completing' : ''}`}>
            🧠
          </div>
          
          {/* Scanning lines */}
          <div className="scanning-lines">
            <div className="scan-line scan-line-1"></div>
            <div className="scan-line scan-line-2"></div>
            <div className="scan-line scan-line-3"></div>
          </div>
        </div>

        {/* Progress and Text */}
        <div className="loading-content">
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="progress-text">{Math.round(progress)}%</div>
          </div>
          
          <div className="loading-messages">
            {stage === 'loading' && (
              <div className="message-container">
                {progress < 30 && <p className="loading-message">🔍 Analyzing email campaign data...</p>}
                {progress >= 30 && progress < 60 && <p className="loading-message">🤖 AI processing performance metrics...</p>}
                {progress >= 60 && progress < 90 && <p className="loading-message">📊 Generating improvement suggestions...</p>}
                {progress >= 90 && <p className="loading-message">✨ Finalizing analysis report...</p>}
              </div>
            )}
            
            {stage === 'completing' && (
              <div className="completion-message">
                <p className="success-message">🎉 Analysis Complete!</p>
                <p className="sub-message">Preparing your results...</p>
              </div>
            )}
          </div>
        </div>

        {/* Particle Effects */}
        <div className="particles">
          {[...Array(20)].map((_, index) => (
            <div
              key={index}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingAnimation;
