from .sharpness import compute_sharpness_metrics
from .exposure import compute_exposure_metrics
from .noise import compute_noise_metrics
from .corruption import compute_corruption_metrics
from .defects import compute_defect_metrics
from .heatmap import generate_quality_heatmap

def run_full_cv_analysis(bgr_img, gray_img, raw_bytes: bytes) -> dict:
    sharpness = compute_sharpness_metrics(gray_img)
    exposure = compute_exposure_metrics(bgr_img, gray_img)
    noise = compute_noise_metrics(gray_img)
    corruption = compute_corruption_metrics(raw_bytes, bgr_img, gray_img)
    defects = compute_defect_metrics(bgr_img, gray_img)

    return {
        "sharpness": sharpness,
        "exposure": exposure,
        "noise": noise,
        "corruption": corruption,
        "defects": defects
    }
