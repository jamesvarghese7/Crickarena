"""
ML-Powered Lineup Optimizer
Uses scikit-learn to predict player performance and optimize team selection
"""

import sys
import io

# Fix Windows console encoding for Unicode support
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import joblib
import json
from pathlib import Path

class LineupMLModel:
    """
    Machine Learning model for predicting player performance
    Uses ensemble methods for robust predictions
    """
    
    def __init__(self, model_path='./models'):
        self.model_path = Path(model_path)
        self.model_path.mkdir(exist_ok=True)
        
        # Initialize models
        self.performance_model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            min_samples_split=5,
            random_state=42
        )
        
        self.consistency_model = GradientBoostingRegressor(
            n_estimators=50,
            max_depth=5,
            learning_rate=0.1,
            random_state=42
        )
        
        self.scaler = StandardScaler()
        self.feature_names = []
        self.is_trained = False
        
    def extract_features(self, player_data):
        """
        Extract ML features from player data
        
        Features:
        - Career statistics (normalized)
        - Per-match averages
        - Experience level
        - Age factor
        - Position encoding
        - Form indicators
        """
        features = {}
        
        # Handle both nested statistics and flattened format
        if 'statistics' in player_data:
            stats = player_data['statistics']
            matches = stats.get('matchesPlayed', 0)
            runs = stats.get('runsScored', 0)
            wickets = stats.get('wicketsTaken', 0)
            catches = stats.get('catches', 0)
            stumpings = stats.get('stumpings', 0)
        else:
            # Flattened format from Node.js
            matches = player_data.get('matchesPlayed', 0)
            runs = player_data.get('runsScored', 0)
            wickets = player_data.get('wicketsTaken', 0)
            catches = player_data.get('catches', 0)
            stumpings = player_data.get('stumpings', 0)
        
        # Avoid division by zero
        if matches == 0:
            matches = 1
            
        # Performance metrics (normalized per match)
        features['runs_per_match'] = runs / matches
        features['wickets_per_match'] = wickets / matches
        features['catches_per_match'] = catches / matches
        features['stumpings_per_match'] = stumpings / matches
        
        # Total contribution
        features['total_matches'] = matches
        features['total_runs'] = runs
        features['total_wickets'] = wickets
        features['total_dismissals'] = catches + stumpings
        
        # Experience encoding
        experience_map = {
            'beginner': 1,
            '1-2 years': 2,
            '3-5 years': 3,
            '5-10 years': 4,
            '10+ years': 5
        }
        features['experience_level'] = experience_map.get(
            player_data.get('playingExperience', 'beginner'), 1
        )
        
        # Age factor (peak performance curve)
        age = player_data.get('age', 25)
        features['age'] = age
        features['age_squared'] = age ** 2  # Capture non-linear age effect
        
        # Peak age indicator (22-32 is peak for cricket)
        features['is_peak_age'] = 1 if 22 <= age <= 32 else 0
        
        # Position one-hot encoding
        position = player_data.get('position', '').lower()
        features['is_batsman'] = 1 if 'batsman' in position else 0
        features['is_bowler'] = 1 if 'bowler' in position else 0
        features['is_allrounder'] = 1 if 'all-rounder' in position else 0
        features['is_wicketkeeper'] = 1 if 'wicket-keeper' in position else 0
        
        # Batting style encoding
        batting_style = player_data.get('battingStyle', 'right-handed')
        features['is_left_handed_bat'] = 1 if 'left' in batting_style.lower() else 0
        
        # Bowling style encoding
        bowling_style = player_data.get('bowlingStyle', 'none').lower()
        features['is_fast_bowler'] = 1 if 'fast' in bowling_style else 0
        features['is_spin_bowler'] = 1 if 'spin' in bowling_style else 0
        
        # Composite features
        # Batting impact: runs weighted by consistency
        if matches >= 5:
            features['batting_impact'] = features['runs_per_match'] * min(matches / 10, 2)
        else:
            features['batting_impact'] = features['runs_per_match'] * 0.5
            
        # Bowling impact: wickets weighted by consistency
        if matches >= 5:
            features['bowling_impact'] = features['wickets_per_match'] * min(matches / 10, 2)
        else:
            features['bowling_impact'] = features['wickets_per_match'] * 0.5
            
        # All-rounder score: combined batting and bowling
        features['allrounder_score'] = (
            features['runs_per_match'] * 0.1 +  # Normalize runs (roughly /10)
            features['wickets_per_match'] * 5    # Amplify wickets
        )
        
        # Fielding contribution
        features['fielding_score'] = (
            features['catches_per_match'] * 2 +
            features['stumpings_per_match'] * 3
        )
        
        # Experience-weighted performance
        features['weighted_performance'] = (
            (features['runs_per_match'] + features['wickets_per_match'] * 10) *
            (1 + features['experience_level'] * 0.1)
        )
        
        return features
    
    def prepare_dataset(self, players_data, match_outcomes=None):
        """
        Convert player data to ML-ready format
        
        Args:
            players_data: List of player dictionaries
            match_outcomes: Optional list of match results for training
            
        Returns:
            X: Feature matrix
            y: Target variable (if outcomes provided)
        """
        feature_list = []
        targets = []
        
        for idx, player in enumerate(players_data):
            features = self.extract_features(player)
            feature_list.append(features)
            
            # If we have match outcomes, calculate actual performance
            if match_outcomes and idx < len(match_outcomes):
                outcome = match_outcomes[idx]
                # Target: normalized performance score (0-100)
                target = self._calculate_performance_target(player, outcome)
                targets.append(target)
        
        # Convert to DataFrame
        df = pd.DataFrame(feature_list)
        
        # Store feature names for later use
        self.feature_names = df.columns.tolist()
        
        X = df.values
        y = np.array(targets) if targets else None
        
        return X, y, df.columns
    
    def _calculate_performance_target(self, player, outcome):
        """
        Calculate target performance score from match outcome
        This is what we're trying to predict
        """
        # Get statistics (either from nested stats object or top-level)
        if 'statistics' in player:
            stats = player.get('statistics', {})
            matches = stats.get('matchesPlayed', 1)
            runs = stats.get('runsScored', 0)
            wickets = stats.get('wicketsTaken', 0)
            catches = stats.get('catches', 0)
        else:
            # Flattened format from Node.js
            matches = player.get('matchesPlayed', 1)
            runs = player.get('runsScored', 0)
            wickets = player.get('wicketsTaken', 0)
            catches = player.get('catches', 0)
        
        if matches == 0:
            matches = 1
        
        # Weighted performance calculation
        batting_score = (runs / matches) / 30 * 100
        bowling_score = (wickets / matches) / 2 * 100
        fielding_score = (catches / matches) / 0.5 * 100
        
        # Position-weighted combination
        position = player.get('position', '').lower()
        if 'batsman' in position:
            score = batting_score * 0.7 + bowling_score * 0.1 + fielding_score * 0.2
        elif 'bowler' in position:
            score = batting_score * 0.1 + bowling_score * 0.7 + fielding_score * 0.2
        elif 'all-rounder' in position:
            score = batting_score * 0.4 + bowling_score * 0.4 + fielding_score * 0.2
        elif 'wicket-keeper' in position:
            score = batting_score * 0.4 + fielding_score * 0.6
        else:
            score = (batting_score + bowling_score + fielding_score) / 3
        
        return min(max(score, 0), 100)  # Clip to 0-100
    
    def train(self, players_data, match_outcomes=None, test_size=0.2):
        """
        Train the ML models
        
        Args:
            players_data: List of player dictionaries with statistics
            match_outcomes: Optional match results for supervised learning
            test_size: Proportion of data for testing
            
        Returns:
            training_metrics: Dictionary with performance metrics
        """
        # Prepare data
        X, y, feature_names = self.prepare_dataset(players_data, match_outcomes)
        
        if y is None:
            # Generate synthetic targets from existing data
            print("No match outcomes provided. Generating synthetic targets...", file=sys.stderr)
            y = np.array([
                self._calculate_performance_target(p, None) 
                for p in players_data
            ])
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Split data
        if len(X) > 10:  # Only split if we have enough data
            X_train, X_test, y_train, y_test = train_test_split(
                X_scaled, y, test_size=test_size, random_state=42
            )
        else:
            X_train = X_test = X_scaled
            y_train = y_test = y
        
        # Train performance model
        self.performance_model.fit(X_train, y_train)
        perf_score = self.performance_model.score(X_test, y_test)
        
        # Train consistency model
        self.consistency_model.fit(X_train, y_train)
        cons_score = self.consistency_model.score(X_test, y_test)
        
        self.is_trained = True
        
        # Feature importance
        feature_importance = dict(zip(
            feature_names,
            self.performance_model.feature_importances_
        ))
        
        # Sort by importance
        sorted_features = sorted(
            feature_importance.items(),
            key=lambda x: x[1],
            reverse=True
        )
        
        metrics = {
            'performance_model_score': float(perf_score),
            'consistency_model_score': float(cons_score),
            'n_samples': len(X),
            'n_features': len(feature_names),
            'top_features': sorted_features[:10],
            'model_type': 'RandomForest + GradientBoosting Ensemble'
        }
        
        print(f"\n[SUCCESS] Model Training Complete!", file=sys.stderr)
        print(f"   Performance Model R² Score: {perf_score:.3f}", file=sys.stderr)
        print(f"   Consistency Model R² Score: {cons_score:.3f}", file=sys.stderr)
        print(f"   Samples: {len(X)}, Features: {len(feature_names)}", file=sys.stderr)
        
        return metrics
    
    def predict(self, players_data):
        """
        Predict performance scores for players
        
        Args:
            players_data: List of player dictionaries
            
        Returns:
            predictions: List of predicted scores with confidence
        """
        if not self.is_trained:
            raise ValueError("Model not trained. Call train() first.")
        
        # Prepare features
        X, _, _ = self.prepare_dataset(players_data)
        X_scaled = self.scaler.transform(X)
        
        # Get predictions from both models
        perf_predictions = self.performance_model.predict(X_scaled)
        cons_predictions = self.consistency_model.predict(X_scaled)
        
        # Ensemble: average the predictions
        ensemble_predictions = (perf_predictions + cons_predictions) / 2
        
        # Calculate confidence based on model agreement
        confidence = 100 - np.abs(perf_predictions - cons_predictions)
        
        predictions = []
        for idx, (pred, conf) in enumerate(zip(ensemble_predictions, confidence)):
            predictions.append({
                'player_id': players_data[idx].get('_id', idx),
                'predicted_score': float(np.clip(pred, 0, 100)),
                'confidence': float(np.clip(conf, 0, 100)),
                'performance_pred': float(perf_predictions[idx]),
                'consistency_pred': float(cons_predictions[idx])
            })
        
        return predictions
    
    def save_model(self, filename='lineup_ml_model.pkl'):
        """Save trained model to disk"""
        if not self.is_trained:
            raise ValueError("Cannot save untrained model")
        
        model_data = {
            'performance_model': self.performance_model,
            'consistency_model': self.consistency_model,
            'scaler': self.scaler,
            'feature_names': self.feature_names,
            'is_trained': self.is_trained
        }
        
        filepath = self.model_path / filename
        joblib.dump(model_data, filepath)
        print(f"[SUCCESS] Model saved to {filepath}", file=sys.stderr)
        
        return str(filepath)
    
    def load_model(self, filename='lineup_ml_model.pkl', silent=False):
        """Load trained model from disk"""
        filepath = self.model_path / filename
        
        if not filepath.exists():
            raise FileNotFoundError(f"Model file not found: {filepath}")
        
        model_data = joblib.load(filepath)
        
        self.performance_model = model_data['performance_model']
        self.consistency_model = model_data['consistency_model']
        self.scaler = model_data['scaler']
        self.feature_names = model_data['feature_names']
        self.is_trained = model_data['is_trained']
        
        if not silent:
            print(f"[SUCCESS] Model loaded from {filepath}", file=sys.stderr)
        
    def get_feature_importance(self):
        """Get feature importance from the trained model"""
        if not self.is_trained:
            return {}
        
        importance = dict(zip(
            self.feature_names,
            self.performance_model.feature_importances_
        ))
        
        return dict(sorted(importance.items(), key=lambda x: x[1], reverse=True))


def main():
    """
    Command-line interface for the ML model
    
    Usage:
        python lineup_ml_model.py train <players_data.json>
        python lineup_ml_model.py predict <players_data.json>
    """
    if len(sys.argv) < 3:
        print("Usage:")
        print("  Train: python lineup_ml_model.py train <players_data.json>")
        print("  Predict: python lineup_ml_model.py predict <players_data.json>")
        sys.exit(1)
    
    command = sys.argv[1]
    data_file = sys.argv[2]
    
    # Load player data
    with open(data_file, 'r') as f:
        players_data = json.load(f)
    
    model = LineupMLModel()
    
    if command == 'train':
        # Train model
        metrics = model.train(players_data)
        model.save_model()
        
        # Output metrics as JSON
        print("\n" + json.dumps(metrics, indent=2))
        
    elif command == 'predict':
        # Load existing model (silent mode to avoid polluting JSON output)
        try:
            model.load_model(silent=True)
        except FileNotFoundError:
            print("[ERROR] No trained model found. Training new model...", file=sys.stderr)
            model.train(players_data)
            model.save_model()
        
        # Make predictions
        predictions = model.predict(players_data)
        
        # Output as JSON (only thing written to stdout)
        print(json.dumps(predictions, indent=2))
        
    else:
        print(f"❌ Unknown command: {command}")
        sys.exit(1)


if __name__ == '__main__':
    main()
