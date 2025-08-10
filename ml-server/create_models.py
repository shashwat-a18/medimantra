"""
Simple script to recreate ML models for MediMantra
Created by: Shashwat Awasthi
GitHub: https://github.com/shashwat-a18
LinkedIn: https://www.linkedin.com/in/shashwat-awasthi18/
"""

import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.dummy import DummyClassifier
import os

def create_dummy_models():
    """Create dummy models for development/testing"""
    
    # Create models directory if it doesn't exist
    os.makedirs('models', exist_ok=True)
    
    # Diabetes model (8 features)
    diabetes_model = RandomForestClassifier(n_estimators=10, random_state=42)
    # Dummy data for training
    X_diabetes = np.random.rand(100, 8)
    y_diabetes = np.random.randint(0, 2, 100)
    diabetes_model.fit(X_diabetes, y_diabetes)
    joblib.dump(diabetes_model, 'models/diabetes.pkl')
    print("✅ Created diabetes model")
    
    # Heart disease model (13 features)
    heart_model = RandomForestClassifier(n_estimators=10, random_state=42)
    X_heart = np.random.rand(100, 13)
    y_heart = np.random.randint(0, 2, 100)
    heart_model.fit(X_heart, y_heart)
    joblib.dump(heart_model, 'models/heart.pkl')
    print("✅ Created heart disease model")
    
    # Stroke model (10 features to match frontend)
    stroke_model = RandomForestClassifier(n_estimators=10, random_state=42)
    X_stroke = np.random.rand(100, 10)  # Changed from 11 to 10
    y_stroke = np.random.randint(0, 2, 100)
    stroke_model.fit(X_stroke, y_stroke)
    joblib.dump(stroke_model, 'models/stroke.pkl')
    print("✅ Created stroke model")
    
    print("\n🎉 All models created successfully!")
    print("Note: These are dummy models for development. Replace with real trained models for production.")

if __name__ == "__main__":
    create_dummy_models()
