import cv2
import numpy as np

def compute_defect_metrics(bgr_img: np.ndarray, gray_img: np.ndarray) -> dict:
    if gray_img is None or gray_img.size == 0:
        return {
            "defect_count": 0,
            "defect_area_pct": 0.0,
            "scratch_score": 0.0,
            "spot_score": 0.0,
            "defect_score": 100.0,
            "has_defects": False,
            "defect_mask": None
        }

    h, w = gray_img.shape
    total_area = h * w
    defect_mask = np.zeros((h, w), dtype=np.uint8)

    kernel_line = cv2.getStructuringElement(cv2.MORPH_RECT, (15, 3))
    tophat = cv2.morphologyEx(gray_img, cv2.MORPH_TOPHAT, kernel_line)
    blackhat = cv2.morphologyEx(gray_img, cv2.MORPH_BLACKHAT, kernel_line)
    scratch_raw = cv2.add(tophat, blackhat)

    _, scratch_thresh = cv2.threshold(scratch_raw, 40, 255, cv2.THRESH_BINARY)
    scratch_contours, _ = cv2.findContours(scratch_thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    scratch_count = 0
    for cnt in scratch_contours:
        area = cv2.contourArea(cnt)
        if area > 10:
            rect = cv2.minAreaRect(cnt)
            (w_r, h_r) = rect[1]
            if w_r > 0 and h_r > 0:
                aspect = max(w_r, h_r) / min(w_r, h_r)
                if aspect > 3.0 and area < total_area * 0.05:
                    cv2.drawContours(defect_mask, [cnt], -1, 255, -1)
                    scratch_count += 1

    blur_bg = cv2.GaussianBlur(gray_img, (21, 21), 0)
    diff = cv2.absdiff(gray_img, blur_bg)
    _, spot_thresh = cv2.threshold(diff, 35, 255, cv2.THRESH_BINARY)
    
    spot_contours, _ = cv2.findContours(spot_thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    spot_count = 0
    for cnt in spot_contours:
        area = cv2.contourArea(cnt)
        if 8 < area < (total_area * 0.03):
            cv2.drawContours(defect_mask, [cnt], -1, 255, -1)
            spot_count += 1

    defect_pixels = float(np.sum(defect_mask > 0))
    defect_area_pct = float((defect_pixels / total_area) * 100.0)
    total_defect_count = scratch_count + spot_count

    scratch_score = min(100.0, scratch_count * 20.0)
    spot_score = min(100.0, spot_count * 15.0)

    defect_score = float(np.clip(100.0 - (defect_area_pct * 15.0 + total_defect_count * 5.0), 0.0, 100.0))
    has_defects = total_defect_count >= 2 or defect_area_pct > 0.45 or scratch_count >= 1

    return {
        "defect_count": total_defect_count,
        "scratch_count": scratch_count,
        "spot_count": spot_count,
        "defect_area_pct": round(defect_area_pct, 2),
        "scratch_score": round(scratch_score, 1),
        "spot_score": round(spot_score, 1),
        "defect_score": round(defect_score, 1),
        "has_defects": has_defects,
        "defect_mask": defect_mask
    }
