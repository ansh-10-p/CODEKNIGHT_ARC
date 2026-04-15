from flask import Flask, request, jsonify
import joblib
import pandas as pd
import os
import time
from pathlib import Path
from dotenv import load_dotenv
from utils.explainability import get_explanation

from dotenv import find_dotenv

load_dotenv(find_dotenv())

app = Flask(__name__)

MODEL_PATH = os.getenv('MODEL_PATH', 'model/best_model.pkl')
SCALER_PATH = os.getenv('SCALER_PATH', 'model/scaler.pkl')
LE_PATH = os.getenv('LABEL_ENCODER_PATH', 'model/label_encoder.pkl')
METADATA_PATH = os.getenv('METADATA_PATH', 'model/metadata.pkl')
PORT = int(os.getenv('PORT_ML', os.getenv('ML_PORT', '5002')))

MODEL_FILES = {
    'model': MODEL_PATH,
    'scaler': SCALER_PATH,
    'label_encoder': LE_PATH,
    'metadata': METADATA_PATH,
}

model = None
scaler = None
le = None
metadata = None


def get_missing_files(paths):
    return [name for name, path in paths.items() if not Path(path).exists()]


def load_model_artifacts():
    global model, scaler, le, metadata
    missing = get_missing_files(MODEL_FILES)
    if missing:
        app.logger.warning('Model artifacts missing at startup: %s', missing)
        deadline = time.time() + 30
        while time.time() < deadline:
            missing = get_missing_files(MODEL_FILES)
            if not missing:
                break
            time.sleep(2)

    missing = get_missing_files(MODEL_FILES)
    if missing:
        raise RuntimeError(
            'Model artifacts not found after waiting. Ensure training is complete and ' 
            'model files exist: ' + ', '.join(missing)
        )

    app.logger.info('Loading model artifacts from disk...')
    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    le = joblib.load(LE_PATH)
    metadata = joblib.load(METADATA_PATH)
    app.logger.info('Model loaded: %s', metadata.get('model_name', 'unknown'))


try:
    load_model_artifacts()
except Exception as exc:
    app.logger.error('Failed to load ML model at startup: %s', exc)
    raise


@app.route('/health', methods=['GET'])
def health():
    return jsonify(
        status='ok' if model is not None else 'unhealthy',
        modelLoaded=model is not None,
        modelName=metadata.get('model_name') if metadata else None,
    ), (200 if model is not None else 503)


@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({'error': 'Model not loaded. Ensure training is complete.'}), 503

    try:
        data = request.get_json(force=True)
        required_features = metadata['features']

        missing_features = [feature for feature in required_features if feature not in data]
        if missing_features:
            return jsonify({'error': f"Missing required features: {', '.join(missing_features)}"}), 400

        input_data = [data[f] for f in required_features]
        input_df = pd.DataFrame([input_data], columns=required_features)
        input_scaled = scaler.transform(input_df)

        prediction_encoded = model.predict(input_scaled)[0]
        prediction_label = le.inverse_transform([prediction_encoded])[0]

        confidence_str = 'N/A'
        if hasattr(model, 'predict_proba'):
            probabilities = model.predict_proba(input_scaled)[0]
            confidence_str = f"{int(max(probabilities) * 100)}%"

        reason_list = get_explanation(data, prediction_label)

        return jsonify({
            'prediction': prediction_label,
            'confidence': confidence_str,
            'reason': reason_list,
        })
    except Exception as exc:
        app.logger.exception('Prediction request failed: %s', exc)
        return jsonify({'error': str(exc)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=PORT, debug=False)
