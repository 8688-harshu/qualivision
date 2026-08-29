import os
import numpy as np
from app.ml_engine.feature_extractor import extract_feature_vector, FEATURE_NAMES

WEIGHTS_FILE = os.path.join(os.path.dirname(__file__), "model_weights.npz")
MODEL_FILE = os.path.join(os.path.dirname(__file__), "model.joblib")

class QualityModelEvaluator:
    def __init__(self):
        self.model = None
        self.np_trees = None
        self.load_model()

    def load_model(self):
        if os.path.exists(WEIGHTS_FILE):
            try:
                npz = np.load(WEIGHTS_FILE, allow_pickle=True)
                self.np_trees = {
                    "children_left": npz["children_left"],
                    "children_right": npz["children_right"],
                    "feature": npz["feature"],
                    "threshold": npz["threshold"],
                    "value": npz["value"]
                }
                return
            except Exception:
                pass

        if os.path.exists(MODEL_FILE):
            try:
                import joblib
                data = joblib.load(MODEL_FILE)
                self.model = data.get("model")
            except Exception:
                pass

    def _predict_proba_numpy(self, X: np.ndarray) -> np.ndarray:
        cl = self.np_trees["children_left"]
        cr = self.np_trees["children_right"]
        feat = self.np_trees["feature"]
        th = self.np_trees["threshold"]
        val = self.np_trees["value"]
        
        n_trees = len(cl)
        n_classes = val[0].shape[1] if len(val[0].shape) > 1 else len(val[0])
        tree_probs = np.zeros((n_trees, n_classes), dtype=np.float64)
        
        for t in range(n_trees):
            node = 0
            t_cl = cl[t]
            t_cr = cr[t]
            t_feat = feat[t]
            t_th = th[t]
            t_val = val[t]
            
            while t_cl[node] != -1:
                f_idx = t_feat[node]
                thresh = t_th[node]
                if X[0, f_idx] <= thresh:
                    node = t_cl[node]
                else:
                    node = t_cr[node]
            node_dist = t_val[node]
            total = np.sum(node_dist)
            tree_probs[t] = node_dist / (total if total > 0 else 1.0)
            
        return np.mean(tree_probs, axis=0)

    def predict(self, cv_metrics: dict) -> dict:
        feat_vec = extract_feature_vector(cv_metrics).reshape(1, -1)

        sharpness_score = cv_metrics["sharpness"]["sharpness_score"]
        exposure_score = cv_metrics["exposure"]["exposure_score"]
        noise_score = cv_metrics["noise"]["noise_score"]
        corruption_score = cv_metrics["corruption"]["corruption_score"]
        defect_score = cv_metrics["defects"]["defect_score"]

        quality_score = float(
            0.25 * sharpness_score +
            0.20 * exposure_score +
            0.20 * noise_score +
            0.20 * defect_score +
            0.15 * corruption_score
        )

        confidence = 0.85
        pred_label_idx = 0 if quality_score >= 75 else (1 if quality_score >= 45 else 2)

        if self.np_trees is not None:
            try:
                probs = self._predict_proba_numpy(feat_vec)
                pred_label_idx = int(np.argmax(probs))
                confidence = float(probs[pred_label_idx])
            except Exception:
                pass
        elif self.model is not None:
            try:
                probs = self.model.predict_proba(feat_vec)[0]
                pred_label_idx = int(np.argmax(probs))
                confidence = float(probs[pred_label_idx])
            except Exception:
                pass

        is_corrupt = cv_metrics["corruption"]["is_corrupt"]
        has_defects = cv_metrics["defects"]["has_defects"]

        if is_corrupt:
            quality_label = "DEFECTIVE"
            quality_score = min(quality_score, 25.0)
        elif has_defects and pred_label_idx == 0:
            quality_label = "DEGRADED"
            quality_score = min(quality_score, 65.0)
        else:
            quality_label = ["ACCEPTABLE", "DEGRADED", "DEFECTIVE"][pred_label_idx]

        quality_score = float(np.clip(quality_score, 0.0, 100.0))

        issues = []
        
        if cv_metrics["sharpness"]["is_blurry"]:
            lap_var = cv_metrics["sharpness"]["laplacian_var"]
            severity = "critical" if lap_var < 50 else ("high" if lap_var < 90 else "medium")
            conf = float(np.clip(1.0 - (lap_var / 200.0), 0.65, 0.98))
            issues.append({
                "type": "blur",
                "severity": severity,
                "confidence": round(conf, 2),
                "description": f"Insufficient sharpness detected (Laplacian variance: {lap_var}, score: {sharpness_score}/100)"
            })

        exp_state = cv_metrics["exposure"]["exposure_state"]
        if exp_state == "UNDEREXPOSED":
            shadow_pct = cv_metrics["exposure"]["shadow_clipping_pct"]
            severity = "high" if shadow_pct > 30 else "medium"
            conf = float(np.clip(shadow_pct / 40.0 + 0.5, 0.60, 0.95))
            issues.append({
                "type": "underexposure",
                "severity": severity,
                "confidence": round(conf, 2),
                "description": f"Image is underexposed with {shadow_pct}% shadow clipping"
            })
        elif exp_state == "OVEREXPOSED":
            highlight_pct = cv_metrics["exposure"]["highlight_clipping_pct"]
            severity = "high" if highlight_pct > 25 else "medium"
            conf = float(np.clip(highlight_pct / 35.0 + 0.5, 0.60, 0.95))
            issues.append({
                "type": "overexposure",
                "severity": severity,
                "confidence": round(conf, 2),
                "description": f"Image is overexposed with {highlight_pct}% highlight clipping"
            })

        if cv_metrics["noise"]["is_noisy"]:
            noise_std = cv_metrics["noise"]["noise_std"]
            severity = "critical" if noise_std > 20 else ("high" if noise_std > 12 else "medium")
            conf = float(np.clip(noise_std / 25.0 + 0.5, 0.65, 0.96))
            issues.append({
                "type": "noise",
                "severity": severity,
                "confidence": round(conf, 2),
                "description": f"High image noise detected (Residual std: {noise_std}, SNR: {cv_metrics['noise']['snr_db']} dB)"
            })

        if cv_metrics["defects"]["has_defects"]:
            defect_cnt = cv_metrics["defects"]["defect_count"]
            area_pct = cv_metrics["defects"]["defect_area_pct"]
            severity = "critical" if (defect_cnt >= 4 or area_pct > 1.0) else "high"
            issues.append({
                "type": "visual_defect",
                "severity": severity,
                "confidence": 0.88,
                "description": f"Visual surface defects detected ({defect_cnt} regions, {area_pct}% of total image area)"
            })

        if is_corrupt:
            reasons = ", ".join(cv_metrics["corruption"]["reasons"])
            issues.append({
                "type": "image_corruption",
                "severity": "critical",
                "confidence": 0.99,
                "description": f"Severe image corruption or decoding anomaly ({reasons})"
            })

        explainability = {
            "model_confidence": round(confidence, 2),
            "decision_factors": [
                {"factor": "Sharpness", "score": sharpness_score, "weight": 0.25, "impact": "negative" if cv_metrics["sharpness"]["is_blurry"] else "positive"},
                {"factor": "Exposure Balance", "score": exposure_score, "weight": 0.20, "impact": "negative" if exp_state != "BALANCED" else "positive"},
                {"factor": "Noise Level", "score": noise_score, "weight": 0.20, "impact": "negative" if cv_metrics["noise"]["is_noisy"] else "positive"},
                {"factor": "Surface Integrity", "score": defect_score, "weight": 0.20, "impact": "negative" if has_defects else "positive"},
                {"factor": "Structure & Decoding", "score": corruption_score, "weight": 0.15, "impact": "negative" if is_corrupt else "positive"}
            ]
        }

        return {
            "quality_score": round(quality_score),
            "quality_label": quality_label,
            "issues": issues,
            "explainability": explainability
        }

evaluator_instance = QualityModelEvaluator()
