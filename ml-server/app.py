
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import os
import numpy as np
import pandas as pd
from explainability.shap_utils import get_shap_explanation

app = Flask(__name__)
CORS(app)

# Model registry
MODEL_PATHS = {
    'diabetes': os.path.join('models', 'diabetes.pkl'),
    'heart': os.path.join('models', 'heart.pkl'),
    'stroke': os.path.join('models', 'stroke.pkl')
}

MODELS = {}

def load_model(model_type):
    if model_type not in MODELS:
        model_path = MODEL_PATHS.get(model_type)
        if not model_path or not os.path.exists(model_path):
            # Create a dummy model for development if model file doesn't exist
            print(f"Warning: Model file for {model_type} not found. Creating dummy model for development.")
            from sklearn.dummy import DummyClassifier
            MODELS[model_type] = DummyClassifier(strategy='constant', constant=0)
            return MODELS[model_type]
        MODELS[model_type] = joblib.load(model_path)
    return MODELS[model_type]

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    model_type = data.get('model_type')
    input_data = data.get('input_data')
    feature_names = data.get('feature_names')
    if not model_type or not input_data:
        return jsonify({'error': 'model_type and input_data are required'}), 400
    try:
        model = load_model(model_type)
        X = pd.DataFrame([input_data], columns=feature_names) if feature_names else pd.DataFrame([input_data])
        prediction = model.predict(X)[0]
        shap_result = get_shap_explanation(model, X, feature_names)
        return jsonify({
            'prediction': int(prediction) if isinstance(prediction, (np.integer, int)) else prediction,
            'shap': shap_result
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health')
def health():
    return jsonify({
        'status': 'healthy',
        'message': 'ML Server for Medical Health Tracker – Pro',
        'models': list(MODEL_PATHS.keys()),
        'timestamp': pd.Timestamp.now().isoformat()
    })

@app.route('/')
def index():
    return 'ML Server for Medical Health Tracker – Pro'

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port)
