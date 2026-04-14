import pandas as pd
import numpy as np
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report

def train_model():
    # 1. Load Dataset
    data_path = 'data/Student_Performance.csv'
    if not os.path.exists(data_path):
        print(f"Error: {data_path} not found.")
        return

    df = pd.read_csv(data_path)
    print("Dataset Loaded Successfully.")

    # 2. Data Preprocessing
    # Handle missing values (if any)
    df = df.dropna()

    # Create synthetic 'attendance' column (Requested by user as it was missing)
    # Generate random attendance between 40 and 100, correlated slightly with Performance Index
    np.random.seed(42)
    df['attendance'] = np.clip(np.random.normal(70, 15, len(df)) + (df['Performance Index'] - 50) * 0.2, 40, 100)

    # Map existing columns to requested names
    # study_hours -> Hours Studied
    # internal_marks -> Previous Scores
    # assignments -> Sample Question Papers Practiced
    df.rename(columns={
        'Hours Studied': 'study_hours',
        'Previous Scores': 'internal_marks',
        'Sample Question Papers Practiced': 'assignments'
    }, inplace=True)

    # 3. Create 'performance_label'
    def label_performance(score):
        if score < 50:
            return "at_risk"
        elif 50 <= score <= 75:
            return "average"
        else:
            return "high_performer"

    df['performance_label'] = df['Performance Index'].apply(label_performance)

    # 4. Feature Selection
    features = ['study_hours', 'attendance', 'internal_marks', 'assignments']
    X = df[features]
    y = df['performance_label']

    # Encode target labels
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)

    # Split dataset
    X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.2, random_state=42)

    # Normalize numerical features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # 5. Model Training
    models = {
        'Logistic Regression': LogisticRegression(max_iter=1000),
        'Decision Tree': DecisionTreeClassifier(random_state=42)
    }

    best_model = None
    best_accuracy = 0
    best_model_name = ""

    print("\nModel Evaluation:")
    for name, model in models.items():
        model.fit(X_train_scaled, y_train)
        y_pred = model.predict(X_test_scaled)
        acc = accuracy_score(y_test, y_pred)
        
        print(f"\n--- {name} ---")
        print(f"Accuracy: {acc:.4f}")
        print("Confusion Matrix:")
        print(confusion_matrix(y_test, y_pred))
        print("Classification Report:")
        print(classification_report(y_test, y_pred, target_names=le.classes_))

        if acc > best_accuracy:
            best_accuracy = acc
            best_model = model
            best_model_name = name

    print(f"\nBest Model Selected: {best_model_name} with Accuracy: {best_accuracy:.4f}")

    # 6. Save Best Model and Scaler
    os.makedirs('model', exist_ok=True)
    joblib.dump(best_model, 'model/best_model.pkl')
    joblib.dump(scaler, 'model/scaler.pkl')
    joblib.dump(le, 'model/label_encoder.pkl')
    
    # Save feature names and model name for later use
    joblib.dump({
        'features': features,
        'model_name': best_model_name,
        'classes': le.classes_.tolist()
    }, 'model/metadata.pkl')

    print("\nModel and artifacts saved to 'model/' directory.")

if __name__ == "__main__":
    train_model()
