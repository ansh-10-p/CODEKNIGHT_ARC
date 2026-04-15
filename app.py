from flask import Flask, request, jsonify
import joblib
import pandas as pd
import os
from utils.explainability import get_explanation

app = Flask(__name__)

# Model loading paths
MODEL_PATH = 'model/best_model.pkl'
SCALER_PATH = 'model/scaler.pkl'
LE_PATH = 'model/label_encoder.pkl'
METADATA_PATH = 'model/metadata.pkl'

# Check if model files exist
if not all(os.path.exists(p) for p in [MODEL_PATH, SCALER_PATH, LE_PATH, METADATA_PATH]):
    print("Warning: Model artifacts not found. Please run 'python3 utils/train.py' first.")
    model, scaler, le, metadata = None, None, None, None
else:
    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    le = joblib.load(LE_PATH)
    metadata = joblib.load(METADATA_PATH)
    print(f"Model loaded: {metadata['model_name']}")

@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({"error": "Model not loaded. Ensure training is complete."}), 500

    try:
        data = request.get_json()
        
        # Required features: study_hours, attendance, internal_marks, assignments
        required_features = metadata['features']
        
        # Validate input
        for feature in required_features:
            if feature not in data:
                return jsonify({"error": f"Missing required feature: {feature}"}), 400

        # Prepare input for prediction
        # Ensure features are in the correct order as trained
        input_data = [data[f] for f in required_features]
        input_df = pd.DataFrame([input_data], columns=required_features)
        
        # Scale the input
        input_scaled = scaler.transform(input_df)
        
        # Predict
        prediction_encoded = model.predict(input_scaled)[0]
        prediction_label = le.inverse_transform([prediction_encoded])[0]
        
        # Get confidence (if model supports predict_proba)
        confidence_str = "N/A"
        if hasattr(model, 'predict_proba'):
            probabilities = model.predict_proba(input_scaled)[0]
            confidence_val = max(probabilities) * 100
            confidence_str = f"{int(confidence_val)}%"
        
        # Generate explanation
        reason_list = get_explanation(data, prediction_label)
        
        return jsonify({
            "prediction": prediction_label,
            "confidence": confidence_str,
            "reason": reason_list
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Running on 0.0.0.0 to make it accessible if needed
    # Default port is 5001, but can be overridden with PORT env var
    port = int(os.getenv('PORT', '5001'))
    app.run(host='0.0.0.0', port=port, debug=True)
