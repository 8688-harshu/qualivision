import cv2
import numpy as np

def compute_noise_metrics(gray_img: np.ndarray) -> dict:
    if gray_img is None or gray_img.size == 0:
        return {
            "noise_std": 0.0,
            "snr_db": 0.0,
            "hf_noise_energy": 0.0,
            "noise_score": 100.0,
            "is_noisy": False
        }

    img_float = gray_img.astype(np.float64)

    denoised = cv2.medianBlur(gray_img, 3).astype(np.float64)
    noise_residual = img_float - denoised
    
    abs_residual = np.abs(noise_residual)
    median_abs = float(np.median(abs_residual))
    noise_std = median_abs / 0.6745 if median_abs > 0 else float(np.std(noise_residual))

    signal_power = np.mean(denoised ** 2) + 1e-8
    noise_power = (noise_std ** 2) + 1e-8
    snr_db = float(10.0 * np.log10(signal_power / noise_power))

    hf_noise_energy = float(np.std(cv2.Laplacian(noise_residual, cv2.CV_64F)))

    penalty = np.clip((noise_std - 2.5) / 20.0, 0.0, 1.0)
    noise_score = float(np.clip(100.0 * (1.0 - penalty), 0.0, 100.0))

    is_noisy = noise_std > 8.0 or snr_db < 22.0

    return {
        "noise_std": round(noise_std, 2),
        "snr_db": round(snr_db, 1),
        "hf_noise_energy": round(hf_noise_energy, 2),
        "noise_score": round(noise_score, 1),
        "is_noisy": is_noisy
    }
