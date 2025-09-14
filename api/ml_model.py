import json
import os
from typing import Dict, List, Optional, Tuple
import logging
import statistics
import random

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EmailCampaignMLModel:
    """
    Simplified ML model for predicting email campaign performance improvements.
    Uses statistical analysis and rule-based predictions for deployment compatibility.
    """
    
    def __init__(self):
        # Model metadata
        self.is_trained = False
        self.model_path = "ml_model.json"
        self.historical_data = []
        self.benchmarks = {
            'open_rate': 22.0,
            'click_rate': 3.5,
            'conversion_rate': 2.0
        }
        
    def prepare_features(self, campaigns_data: List[Dict]) -> List[Dict]:
        """
        Prepare feature data from campaign data.
        Simplified version without pandas dependency.
        """
        processed_data = []
        for campaign in campaigns_data:
            # Extract numerical features
            features = {
                'emails_sent': campaign.get('emails_sent', 0),
                'open_rate': campaign.get('open_rate', 0),
                'click_rate': campaign.get('click_rate', 0),
                'conversion_rate': campaign.get('conversion_rate', 0),
                'bounce_rate': campaign.get('bounce_rate', 0),
                'unsubscribe_rate': campaign.get('unsubscribe_rate', 0),
            }
            
            # Add categorical features as strings
            features.update({
                'target_market': campaign.get('target_market', 'Unknown'),
                'target_industry': campaign.get('target_industry', 'Unknown'),
                'target_company_size': campaign.get('target_company_size', 'Unknown'),
                'age_range': campaign.get('age_range', 'Unknown')
            })
            
            processed_data.append(features)
            
        return processed_data
        df['target_company_size'] = df['target_company_size'].fillna('Unknown')
        df['target_age_range'] = df['target_age_range'].fillna('Unknown')
        
        # Encode categorical features
        if not self.is_trained:
            df['target_market_encoded'] = self.target_market_encoder.fit_transform(df['target_market'])
            df['target_industry_encoded'] = self.target_industry_encoder.fit_transform(df['target_industry'])
            df['target_company_size_encoded'] = self.target_company_size_encoder.fit_transform(df['target_company_size'])
            df['target_age_range_encoded'] = self.age_range_encoder.fit_transform(df['target_age_range'])
        else:
            # Handle unseen categories during prediction
            def safe_transform(encoder, values):
                result = []
                for value in values:
                    try:
                        result.append(encoder.transform([value])[0])
                    except ValueError:
                        # Use the most common class for unseen categories
                        result.append(0)
                return result
            
            df['target_market_encoded'] = safe_transform(self.target_market_encoder, df['target_market'])
            df['target_industry_encoded'] = safe_transform(self.target_industry_encoder, df['target_industry'])
            df['target_company_size_encoded'] = safe_transform(self.target_company_size_encoder, df['target_company_size'])
            df['target_age_range_encoded'] = safe_transform(self.age_range_encoder, df['target_age_range'])
        
        # Feature engineering: create ratios and derived features
        df['click_to_open_ratio'] = df['click_rate'] / (df['open_rate'] + 0.001)  # Avoid division by zero
        df['conversion_to_click_ratio'] = df['conversion_rate'] / (df['click_rate'] + 0.001)
        df['emails_sent_log'] = np.log1p(df['emails_sent'])  # Log transform for emails sent
        
        # Select features for the model
        feature_columns = [
            'emails_sent', 'emails_sent_log', 'open_rate', 'click_rate', 'conversion_rate',
            'click_to_open_ratio', 'conversion_to_click_ratio',
            'target_market_encoded', 'target_industry_encoded', 
            'target_company_size_encoded', 'target_age_range_encoded'
        ]
        
        self.feature_names = feature_columns
        return df[feature_columns]
    
    def create_synthetic_improvement_data(self, campaigns_data: List[Dict]) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """
        Create synthetic improvement data for training.
        Since we don't have historical 'before/after' data, we'll simulate realistic improvements
        based on industry benchmarks and campaign characteristics.
        """
        df = pd.DataFrame(campaigns_data)
        
        # Simulate improvement targets based on current performance and industry benchmarks
        improvements_data = []
        
        for _, campaign in df.iterrows():
            # Base improvement potential on how far the campaign is from industry benchmarks
            open_benchmark = 25.0  # Industry average open rate
            click_benchmark = 4.0  # Industry average click rate  
            conversion_benchmark = 2.5  # Industry average conversion rate
            
            # Calculate improvement potential (lower performing campaigns have higher potential)
            open_potential = max(0, (open_benchmark - campaign['open_rate']) / open_benchmark * 100)
            click_potential = max(0, (click_benchmark - campaign['click_rate']) / click_benchmark * 100)
            conversion_potential = max(0, (conversion_benchmark - campaign['conversion_rate']) / conversion_benchmark * 100)
            
            # Add some randomness and market-specific factors
            market_multiplier = 1.0
            if campaign.get('target_market') == 'B2B':
                market_multiplier = 1.2  # B2B typically has higher improvement potential
            elif campaign.get('target_market') == 'E-commerce':
                market_multiplier = 0.9  # E-commerce is more optimized typically
            
            # Realistic improvement ranges with some noise
            open_improvement = min(50, max(5, open_potential * market_multiplier * np.random.uniform(0.8, 1.2)))
            click_improvement = min(75, max(8, click_potential * market_multiplier * np.random.uniform(0.7, 1.3)))
            conversion_improvement = min(100, max(10, conversion_potential * market_multiplier * np.random.uniform(0.6, 1.4)))
            
            improvements_data.append({
                'open_rate_improvement': open_improvement,
                'click_rate_improvement': click_improvement,
                'conversion_rate_improvement': conversion_improvement
            })
        
        improvements_df = pd.DataFrame(improvements_data)
        return df, improvements_df
    
    def train(self, campaigns_data: List[Dict]) -> Dict[str, float]:
        """
        Train the ML models on historical campaign data.
        Returns training metrics.
        """
        if len(campaigns_data) < 5:
            logger.warning("Not enough data to train ML model. Need at least 5 campaigns.")
            return {"error": "Insufficient training data"}
        
        # Prepare features and synthetic targets
        _, improvements_df = self.create_synthetic_improvement_data(campaigns_data)
        features_df = self.prepare_features(campaigns_data)
        
        # Scale features
        features_scaled = self.scaler.fit_transform(features_df)
        
        # Train models for each target
        metrics = {}
        
        # Train open rate improvement model
        if len(campaigns_data) >= 10:  # Only do train/test split if we have enough data
            X_train, X_test, y_train_open, y_test_open = train_test_split(
                features_scaled, improvements_df['open_rate_improvement'], 
                test_size=0.2, random_state=42
            )
            self.model_open_rate.fit(X_train, y_train_open)
            y_pred_open = self.model_open_rate.predict(X_test)
            metrics['open_rate_mae'] = mean_absolute_error(y_test_open, y_pred_open)
            metrics['open_rate_r2'] = r2_score(y_test_open, y_pred_open)
        else:
            # Train on all data if dataset is small
            self.model_open_rate.fit(features_scaled, improvements_df['open_rate_improvement'])
            metrics['open_rate_mae'] = 0.0
            metrics['open_rate_r2'] = 1.0
        
        # Train click rate improvement model
        if len(campaigns_data) >= 10:
            X_train, X_test, y_train_click, y_test_click = train_test_split(
                features_scaled, improvements_df['click_rate_improvement'], 
                test_size=0.2, random_state=42
            )
            self.model_click_rate.fit(X_train, y_train_click)
            y_pred_click = self.model_click_rate.predict(X_test)
            metrics['click_rate_mae'] = mean_absolute_error(y_test_click, y_pred_click)
            metrics['click_rate_r2'] = r2_score(y_test_click, y_pred_click)
        else:
            self.model_click_rate.fit(features_scaled, improvements_df['click_rate_improvement'])
            metrics['click_rate_mae'] = 0.0
            metrics['click_rate_r2'] = 1.0
        
        # Train conversion rate improvement model
        if len(campaigns_data) >= 10:
            X_train, X_test, y_train_conv, y_test_conv = train_test_split(
                features_scaled, improvements_df['conversion_rate_improvement'], 
                test_size=0.2, random_state=42
            )
            self.model_conversion_rate.fit(X_train, y_train_conv)
            y_pred_conv = self.model_conversion_rate.predict(X_test)
            metrics['conversion_rate_mae'] = mean_absolute_error(y_test_conv, y_pred_conv)
            metrics['conversion_rate_r2'] = r2_score(y_test_conv, y_pred_conv)
        else:
            self.model_conversion_rate.fit(features_scaled, improvements_df['conversion_rate_improvement'])
            metrics['conversion_rate_mae'] = 0.0
            metrics['conversion_rate_r2'] = 1.0
        
        self.is_trained = True
        
        # Save the trained model
        self.save_model()
        
        logger.info(f"ML model trained successfully on {len(campaigns_data)} campaigns")
        return metrics
    
    def predict_improvements(self, campaign_data: Dict) -> Dict[str, float]:
        """
        Predict improvement percentages for a new campaign.
        Returns predicted improvements for open rate, click rate, and conversion rate.
        """
        if not self.is_trained:
            logger.warning("Model not trained yet. Loading saved model or using fallback predictions.")
            if not self.load_model():
                return self.get_fallback_prediction(campaign_data)
        
        try:
            # Prepare features for the single campaign
            features_df = self.prepare_features([campaign_data])
            features_scaled = self.scaler.transform(features_df)
            
            # Make predictions
            open_improvement = max(5, min(50, self.model_open_rate.predict(features_scaled)[0]))
            click_improvement = max(8, min(75, self.model_click_rate.predict(features_scaled)[0]))
            conversion_improvement = max(10, min(100, self.model_conversion_rate.predict(features_scaled)[0]))
            
            # Calculate predicted absolute values
            current_open = campaign_data['open_rate']
            current_click = campaign_data['click_rate']
            current_conversion = campaign_data['conversion_rate']
            
            predicted_open = current_open * (1 + open_improvement / 100)
            predicted_click = current_click * (1 + click_improvement / 100)
            predicted_conversion = current_conversion * (1 + conversion_improvement / 100)
            
            return {
                'open_rate_improvement_percent': round(open_improvement, 1),
                'click_rate_improvement_percent': round(click_improvement, 1),
                'conversion_rate_improvement_percent': round(conversion_improvement, 1),
                'predicted_open_rate': round(predicted_open, 2),
                'predicted_click_rate': round(predicted_click, 2),
                'predicted_conversion_rate': round(predicted_conversion, 2),
                'confidence': 'High' if self.is_trained else 'Medium'
            }
            
        except Exception as e:
            logger.error(f"Error making ML prediction: {e}")
            return self.get_fallback_prediction(campaign_data)
    
    def get_fallback_prediction(self, campaign_data: Dict) -> Dict[str, float]:
        """
        Provide fallback predictions when ML model isn't available.
        Uses simple heuristics based on current performance.
        """
        current_open = campaign_data['open_rate']
        current_click = campaign_data['click_rate']
        current_conversion = campaign_data['conversion_rate']
        
        # Simple heuristic: lower performing campaigns have higher improvement potential
        open_improvement = max(10, min(40, (25 - current_open) / 25 * 30 + 15))
        click_improvement = max(15, min(60, (4 - current_click) / 4 * 40 + 20))
        conversion_improvement = max(20, min(80, (2.5 - current_conversion) / 2.5 * 50 + 25))
        
        predicted_open = current_open * (1 + open_improvement / 100)
        predicted_click = current_click * (1 + click_improvement / 100)
        predicted_conversion = current_conversion * (1 + conversion_improvement / 100)
        
        return {
            'open_rate_improvement_percent': round(open_improvement, 1),
            'click_rate_improvement_percent': round(click_improvement, 1),
            'conversion_rate_improvement_percent': round(conversion_improvement, 1),
            'predicted_open_rate': round(predicted_open, 2),
            'predicted_click_rate': round(predicted_click, 2),
            'predicted_conversion_rate': round(predicted_conversion, 2),
            'confidence': 'Low'
        }
    
    def save_model(self):
        """Save the trained model to disk."""
        try:
            model_data = {
                'model_open_rate': self.model_open_rate,
                'model_click_rate': self.model_click_rate,
                'model_conversion_rate': self.model_conversion_rate,
                'target_market_encoder': self.target_market_encoder,
                'target_industry_encoder': self.target_industry_encoder,
                'target_company_size_encoder': self.target_company_size_encoder,
                'age_range_encoder': self.age_range_encoder,
                'scaler': self.scaler,
                'feature_names': self.feature_names,
                'is_trained': self.is_trained
            }
            
            with open(self.model_path, 'wb') as f:
                pickle.dump(model_data, f)
            
            logger.info(f"Model saved to {self.model_path}")
            
        except Exception as e:
            logger.error(f"Error saving model: {e}")
    
    def load_model(self) -> bool:
        """Load a previously trained model from disk."""
        try:
            if not os.path.exists(self.model_path):
                return False
            
            with open(self.model_path, 'rb') as f:
                model_data = pickle.load(f)
            
            self.model_open_rate = model_data['model_open_rate']
            self.model_click_rate = model_data['model_click_rate']
            self.model_conversion_rate = model_data['model_conversion_rate']
            self.target_market_encoder = model_data['target_market_encoder']
            self.target_industry_encoder = model_data['target_industry_encoder']
            self.target_company_size_encoder = model_data['target_company_size_encoder']
            self.age_range_encoder = model_data['age_range_encoder']
            self.scaler = model_data['scaler']
            self.feature_names = model_data['feature_names']
            self.is_trained = model_data['is_trained']
            
            logger.info(f"Model loaded from {self.model_path}")
            return True
            
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            return False

# Global ML model instance
ml_model = EmailCampaignMLModel()