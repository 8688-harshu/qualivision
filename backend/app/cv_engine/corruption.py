import cv2
import numpy as np
from PIL import Image, ImageFile
import io

ImageFile.LOAD_TRUNCATED_IMAGES = False

def compute_corruption_metrics(image_bytes: bytes, bgr_img: np.ndarray, gray_img: np.ndarray) -> dict:
    is_corrupt = False
    corruption_reasons = []

    if not image_bytes or len(image_bytes) < 100:
        return {
            "entropy": 0.0,
            "blockiness_index": 0.0,
            "nan_inf_count": 0,
            "is_corrupt": True,
            "reasons": ["Empty or severely truncated byte stream"],
            "corruption_score": 0.0
        }

    try:
        pil_img = Image.open(io.BytesIO(image_bytes))
        pil_img.verify()
    except Exception as e:
        is_corrupt = True
        corruption_reasons.append(f"Image header/decode verification failed: {str(e)}")

    if bgr_img is None or gray_img is None or gray_img.size == 0:
        is_corrupt = True
        corruption_reasons.append("OpenCV matrix decode returned empty or null frame")
        return {
            "entropy": 0.0,
            "blockiness_index": 0.0,
            "nan_inf_count": 0,
            "is_corrupt": True,
            "reasons": corruption_reasons,
            "corruption_score": 0.0
        }

    nan_inf_count = int(np.sum(np.isnan(gray_img)) + np.sum(np.isinf(gray_img)))
    if nan_inf_count > 0:
        is_corrupt = True
        corruption_reasons.append(f"Contains {nan_inf_count} invalid NaN/Inf pixel values")

    hist, _ = np.histogram(gray_img.flatten(), bins=256, range=(0, 256))
    prob = hist / np.sum(hist)
    prob = prob[prob > 0]
    entropy = float(-np.sum(prob * np.log2(prob)))

    if entropy < 0.5:
        is_corrupt = True
        corruption_reasons.append(f"Abnormally low pixel entropy ({round(entropy, 2)}) - blank or corrupted payload")

    h, w = gray_img.shape
    if h >= 16 and w >= 16:
        g1 = gray_img[:, 7::8].astype(np.float64)
        g2 = gray_img[:, 8::8].astype(np.float64)
        min_cols = min(g1.shape[1], g2.shape[1])
        if min_cols > 0:
            diff_x_grid = np.abs(g1[:, :min_cols] - g2[:, :min_cols])
            
            i1 = gray_img[:, 3::8].astype(np.float64)
            i2 = gray_img[:, 4::8].astype(np.float64)
            min_icols = min(i1.shape[1], i2.shape[1], min_cols)
            diff_x_inner = np.abs(i1[:, :min_icols] - i2[:, :min_icols])
            
            blockiness_index = float(np.mean(diff_x_grid[:, :min_icols]) / (np.mean(diff_x_inner) + 1e-5))
        else:
            blockiness_index = 1.0
    else:
        blockiness_index = 1.0

    if blockiness_index > 4.5:
        is_corrupt = True
        corruption_reasons.append(f"Severe JPEG macroblock corruption (Blockiness index {round(blockiness_index, 2)})")

    corruption_score = 0.0 if is_corrupt else float(np.clip(100.0 - (blockiness_index - 1.0) * 10.0, 0.0, 100.0))

    return {
        "entropy": round(entropy, 2),
        "blockiness_index": round(blockiness_index, 2),
        "nan_inf_count": nan_inf_count,
        "is_corrupt": is_corrupt,
        "reasons": corruption_reasons if corruption_reasons else ["None"],
        "corruption_score": round(corruption_score, 1)
    }
