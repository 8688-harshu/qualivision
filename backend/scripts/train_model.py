import os
import sys
import json
import cv2
import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, precision_recall_fscore_support

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.cv_engine import run_full_cv_analysis
from app.ml_engine.feature_extractor import extract_feature_vector, FEATURE_NAMES
from scripts.dataset_generator import generate_synthetic_dataset, DATASET_DIR

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "app", "ml_engine", "model.joblib")
METRICS_PATH = os.path.join(os.path.dirname(__file__), "metrics.json")

LABEL_MAPPING = {
    "ACCEPTABLE": 0,
    "BLURRY": 1,
    "UNDEREXPOSED": 1,
    "OVEREXPOSED": 1,
    "NOISY": 1,
    "DEFECTIVE": 2,
    "CORRUPT": 2
}

LABEL_NAMES = {0: "ACCEPTABLE", 1: "DEGRADED", 2: "DEFECTIVE"}

def train_and_evaluate():
    if not os.path.exists(DATASET_DIR):
        generate_synthetic_dataset()

    X = []
    y = []
    categories = os.listdir(DATASET_DIR)

    for cat in categories:
        cat_dir = os.path.join(DATASET_DIR, cat)
        if not os.path.isdir(cat_dir) or cat not in LABEL_MAPPING:
            continue
        
        label = LABEL_MAPPING[cat]
        for fname in os.listdir(cat_dir):
            if not fname.lower().endswith(('.jpg', '.jpeg', '.png')):
                continue
            
            fpath = os.path.join(cat_dir, fname)
            with open(fpath, "rb") as f:
                raw_bytes = f.read()

            bgr = cv2.imread(fpath)
            if bgr is None:
                continue
            gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)

            cv_res = run_full_cv_analysis(bgr, gray, raw_bytes)
            feat_vec = extract_feature_vector(cv_res)

            X.append(feat_vec)
            y.append(label)

    X = np.array(X)
    y = np.array(y)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)

    clf = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
    clf.fit(X_train, y_train)

    cv_scores = cross_val_score(clf, X_train, y_train, cv=5)
    y_pred = clf.predict(X_test)

    acc = accuracy_score(y_test, y_pred)
    prec, rec, f1, _ = precision_recall_fscore_support(y_test, y_pred, average='weighted')
    cm = confusion_matrix(y_test, y_pred).tolist()

    importances = clf.feature_importances_
    feat_imp = [
        {"feature": FEATURE_NAMES[i], "importance": round(float(importances[i]), 4)}
        for i in np.argsort(importances)[::-1]
    ]

    metrics = {
        "accuracy": round(float(acc), 4),
        "precision": round(float(prec), 4),
        "recall": round(float(rec), 4),
        "f1_score": round(float(f1), 4),
        "cv_mean_accuracy": round(float(np.mean(cv_scores)), 4),
        "cv_std": round(float(np.std(cv_scores)), 4),
        "confusion_matrix": cm,
        "labels": ["ACCEPTABLE", "DEGRADED", "DEFECTIVE"],
        "total_samples": int(X.shape[0]),
        "train_samples": int(X_train.shape[0]),
        "test_samples": int(X_test.shape[0]),
        "feature_importances": feat_imp
    }

    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump({"model": clf, "feature_names": FEATURE_NAMES}, MODEL_PATH)

    with open(METRICS_PATH, "w") as f:
        json.dump(metrics, f, indent=2)

    return metrics

if __name__ == "__main__":
    train_and_evaluate()
