import cv2
import numpy as np

def compute_exposure_metrics(bgr_img: np.ndarray, gray_img: np.ndarray) -> dict:
    if gray_img is None or gray_img.size == 0:
        return {
            "mean_luminance": 0.0,
            "median_luminance": 0.0,
            "std_luminance": 0.0,
            "shadow_clipping_pct": 0.0,
            "highlight_clipping_pct": 0.0,
            "dynamic_range": 0.0,
            "exposure_score": 0.0,
            "is_underexposed": False,
            "is_overexposed": False,
            "exposure_state": "INVALID"
        }

    lab_img = cv2.cvtColor(bgr_img, cv2.COLOR_BGR2LAB)
    l_channel = lab_img[:, :, 0].astype(np.float64)

    total_pixels = l_channel.size
    mean_lum = float(np.mean(l_channel))
    median_lum = float(np.median(l_channel))
    std_lum = float(np.std(l_channel))

    shadow_count = float(np.sum(l_channel < 15.0))
    highlight_count = float(np.sum(l_channel > 240.0))

    shadow_pct = shadow_count / total_pixels
    highlight_pct = highlight_count / total_pixels

    p1, p99 = np.percentile(l_channel, [1, 99])
    dynamic_range = float(p99 - p1)

    is_underexposed = (mean_lum < 55.0 and shadow_pct > 0.15) or (shadow_pct > 0.35)
    is_overexposed = (mean_lum > 200.0 and highlight_pct > 0.15) or (highlight_pct > 0.30)

    lum_penalty = abs(mean_lum - 128.0) / 128.0
    clip_penalty = (shadow_pct + highlight_pct) * 2.0
    
    exposure_score = float(np.clip(100.0 * (1.0 - (0.6 * lum_penalty + 0.4 * clip_penalty)), 0.0, 100.0))

    if is_underexposed and is_overexposed:
        exposure_state = "EXTREME_CONTRAST"
    elif is_underexposed:
        exposure_state = "UNDEREXPOSED"
    elif is_overexposed:
        exposure_state = "OVEREXPOSED"
    else:
        exposure_state = "BALANCED"

    return {
        "mean_luminance": round(mean_lum, 1),
        "median_luminance": round(median_lum, 1),
        "std_luminance": round(std_lum, 1),
        "shadow_clipping_pct": round(shadow_pct * 100.0, 2),
        "highlight_clipping_pct": round(highlight_pct * 100.0, 2),
        "dynamic_range": round(dynamic_range, 1),
        "exposure_score": round(exposure_score, 1),
        "is_underexposed": is_underexposed,
        "is_overexposed": is_overexposed,
        "exposure_state": exposure_state
    }
