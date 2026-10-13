import os
import requests
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score
import joblib

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
DATA_PATH = os.path.join(DATA_DIR, "ai4i2020.csv")
MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "model.joblib")
DATASET_URL = "https://archive.ics.uci.edu/ml/machine-learning-databases/00601/ai4i2020.csv"

def download_dataset():
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)
        
    if not os.path.exists(DATA_PATH):
        print(f"Downloading AI4I dataset from {DATASET_URL}...")
        response = requests.get(DATASET_URL)
        if response.status_code == 200:
            with open(DATA_PATH, "wb") as f:
                f.write(response.content)
            print("Dataset downloaded and saved to:", DATA_PATH)
        else:
            raise Exception(f"Failed to download dataset. HTTP Status: {response.status_code}")
    else:
        print("Dataset already exists locally at:", DATA_PATH)

def train_model():
    download_dataset()
    
    print("Loading dataset...")
    df = pd.read_csv(DATA_PATH)
    
    # Feature columns mapping
    # The dataset has:
    # 'Air temperature [K]', 'Process temperature [K]', 'Rotational speed [rpm]', 'Torque [Nm]', 'Tool wear [min]'
    feature_cols = [
        'Air temperature [K]', 
        'Process temperature [K]', 
        'Rotational speed [rpm]', 
        'Torque [Nm]', 
        'Tool wear [min]'
    ]
    
    target_col = 'Machine failure'
    
    # Check if columns exist
    for col in feature_cols + [target_col]:
        if col not in df.columns:
            # Sometime columns have slightly different names, let's fix them or print warning
            print(f"Columns in dataset: {df.columns.tolist()}")
            raise ValueError(f"Required column '{col}' is missing from the dataset.")

    X = df[feature_cols]
    y = df[target_col]
    
    # Split for validation
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    print(f"Training Random Forest Classifier (train size: {len(X_train)}, test size: {len(X_test)})...")
    # Using class_weight='balanced' since predictive maintenance datasets are highly imbalanced
    rf = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42, class_weight='balanced')
    rf.fit(X_train, y_train)
    
    # Predict & Evaluate
    y_pred = rf.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    print("\nModel Evaluation:")
    print("Accuracy Score:", accuracy)
    print("\nClassification Report:\n", classification_report(y_test, y_pred))
    
    # Save the model
    # We will save a dictionary containing the model itself and feature metadata for convenience
    model_metadata = {
        "model": rf,
        "features": feature_cols,
        "accuracy": accuracy
    }
    
    joblib.dump(model_metadata, MODEL_PATH)
    print(f"Model successfully saved to {MODEL_PATH}")

if __name__ == "__main__":
    train_model()
