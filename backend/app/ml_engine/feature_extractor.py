import numpy as np

FEATURE_NAMES = [
    "laplacian_var",
    "tenengrad_index",
    "brenner_index",
    "fft_hf_ratio",
    "sharpness_score",
    "mean_luminance",
    "median_luminance",
    "std_luminance",
    "shadow_clipping_pct",
    "highlight_clipping_pct",
    "dynamic_range",
    "exposure_score",
    "noise_std",
    "snr_db",
    "hf_noise_energy",
    "noise_score",
    "entropy",
    "blockiness_index",
    "defect_count",
    "scratch_count",
    "spot_count",
    "defect_area_pct"
]

def extract_feature_vector(cv_results: dict) -> np.ndarray:
    s = cv_results.get("sharpness", {})
    e = cv_results.get("exposure", {})
    n = cv_results.get("noise", {})
    c = cv_results.get("corruption", {})
    d = cv_results.get("defects", {})

    vec = [
        float(s.get("laplacian_var", 0.0)),
        float(s.get("tenengrad_index", 0.0)),
        float(s.get("brenner_index", 0.0)),
        float(s.get("fft_hf_ratio", 0.0)),
        float(s.get("sharpness_score", 0.0)),
        float(e.get("mean_luminance", 0.0)),
        float(e.get("median_luminance", 0.0)),
        float(e.get("std_luminance", 0.0)),
        float(e.get("shadow_clipping_pct", 0.0)),
        float(e.get("highlight_clipping_pct", 0.0)),
        float(e.get("dynamic_range", 0.0)),
        float(e.get("exposure_score", 0.0)),
        float(n.get("noise_std", 0.0)),
        float(n.get("snr_db", 0.0)),
        float(n.get("hf_noise_energy", 0.0)),
        float(n.get("noise_score", 0.0)),
        float(c.get("entropy", 0.0)),
        float(c.get("blockiness_index", 0.0)),
        float(d.get("defect_count", 0)),
        float(d.get("scratch_count", 0)),
        float(d.get("spot_count", 0)),
        float(d.get("defect_area_pct", 0.0))
    ]

    return np.array(vec, dtype=np.float32)
