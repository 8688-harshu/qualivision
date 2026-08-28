import cv2
import numpy as np

def compute_sharpness_metrics(gray_img: np.ndarray) -> dict:
    if gray_img is None or gray_img.size == 0:
        return {
            "laplacian_var": 0.0,
            "tenengrad_index": 0.0,
            "brenner_index": 0.0,
            "fft_hf_ratio": 0.0,
            "sharpness_score": 0.0,
            "is_blurry": True
        }
    
    laplacian = cv2.Laplacian(gray_img, cv2.CV_64F)
    lap_var = float(np.var(laplacian))

    sobelx = cv2.Sobel(gray_img, cv2.CV_64F, 1, 0, ksize=3)
    sobely = cv2.Sobel(gray_img, cv2.CV_64F, 0, 1, ksize=3)
    tenengrad = float(np.mean(sobelx**2 + sobely**2))

    if gray_img.shape[0] > 2 and gray_img.shape[1] > 2:
        diff_x = (gray_img[:, 2:].astype(np.float64) - gray_img[:, :-2].astype(np.float64)) ** 2
        brenner = float(np.mean(diff_x))
    else:
        brenner = 0.0

    h, w = gray_img.shape
    f = np.fft.fft2(gray_img.astype(np.float64))
    fshift = np.fft.fftshift(f)
    magnitude_spectrum = np.abs(fshift)
    
    cy, cx = h // 2, w // 2
    radius = min(h, w) // 8
    
    y, x = np.ogrid[:h, :w]
    mask_low = (x - cx)**2 + (y - cy)**2 <= radius**2
    
    total_power = np.sum(magnitude_spectrum**2) + 1e-8
    low_freq_power = np.sum(magnitude_spectrum[mask_low]**2)
    high_freq_power = total_power - low_freq_power
    fft_hf_ratio = float(high_freq_power / total_power)

    norm_lap = np.clip(lap_var / 350.0, 0, 2.0)
    norm_ten = np.clip(tenengrad / 1200.0, 0, 2.0)
    norm_fft = np.clip(fft_hf_ratio / 0.8, 0, 1.5)
    
    combined_factor = (0.5 * norm_lap + 0.3 * norm_ten + 0.2 * norm_fft)
    sharpness_score = float(np.clip(100.0 * (1.0 - np.exp(-combined_factor)), 0.0, 100.0))
    
    is_blurry = lap_var < 110.0 or sharpness_score < 45.0

    return {
        "laplacian_var": round(lap_var, 2),
        "tenengrad_index": round(tenengrad, 2),
        "brenner_index": round(brenner, 2),
        "fft_hf_ratio": round(fft_hf_ratio, 4),
        "sharpness_score": round(sharpness_score, 1),
        "is_blurry": is_blurry
    }
