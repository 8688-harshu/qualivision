import cv2
import numpy as np

def generate_quality_heatmap(bgr_img: np.ndarray, gray_img: np.ndarray, defect_mask: np.ndarray = None) -> np.ndarray:
    """
    Generates a colorized visual quality heatmap overlay:
    - High degradation / defects represented in Red / Yellow
    - High quality regions represented in Cool Cyan / Blue
    Returns BGR image blended with heatmap.
    """
    if bgr_img is None or gray_img is None:
        return np.zeros((100, 100, 3), dtype=np.uint8)

    h, w = gray_img.shape
    
    # 1. Local Blur Map (Inverse of local Laplacian variance)
    lap = cv2.Laplacian(gray_img, cv2.CV_32F)
    local_blur = cv2.GaussianBlur(np.abs(lap), (15, 15), 0)
    max_blur = np.max(local_blur) + 1e-5
    blur_degradation = 1.0 - (local_blur / max_blur)

    # 2. Local Noise Map (Local median residual magnitude)
    median_blur = cv2.medianBlur(gray_img, 5)
    local_noise = cv2.GaussianBlur(cv2.absdiff(gray_img, median_blur).astype(np.float32), (15, 15), 0)
    max_noise = np.max(local_noise) + 1e-5
    noise_degradation = local_noise / max_noise

    # 3. Local Exposure Anomaly Map
    lab = cv2.cvtColor(bgr_img, cv2.COLOR_BGR2LAB)
    l_chan = lab[:, :, 0].astype(np.float32)
    exp_anomaly = np.abs(l_chan - 128.0) / 128.0

    # 4. Local Defect Mask (if present)
    if defect_mask is not None and defect_mask.shape == (h, w):
        defect_degradation = (defect_mask.astype(np.float32) / 255.0)
    else:
        defect_degradation = np.zeros((h, w), dtype=np.float32)

    # Combine localized degradations into normalized quality anomaly map [0.0, 1.0]
    combined_anomaly = (
        0.3 * blur_degradation +
        0.25 * noise_degradation +
        0.25 * exp_anomaly +
        0.4 * defect_degradation
    )

    combined_anomaly = np.clip(combined_anomaly, 0.0, 1.0)
    anomaly_uint8 = (combined_anomaly * 255.0).astype(np.uint8)

    # Apply Jet Colormap (Blue=Good, Green/Yellow=Moderate, Red=Severe Degradation/Defect)
    heatmap_color = cv2.applyColorMap(anomaly_uint8, cv2.COLORMAP_JET)

    # Blend original image with heatmap (65% original, 35% heatmap)
    blended = cv2.addWeighted(bgr_img, 0.65, heatmap_color, 0.35, 0)

    # Draw bright highlight contours around severe defects
    if defect_mask is not None:
        contours, _ = cv2.findContours(defect_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        cv2.drawContours(blended, contours, -1, (0, 0, 255), 2) # Crimson red border

    return blended
