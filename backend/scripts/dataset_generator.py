import os
import cv2
import numpy as np
import random

DATASET_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "dataset")
SAMPLES_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "samples")

def create_base_synthetic_image(h=400, w=500, seed=42):
    np.random.seed(seed)
    img = np.zeros((h, w, 3), dtype=np.uint8)
    
    for y in range(h):
        r = int(40 + (y / h) * 120)
        g = int(60 + (y / h) * 80)
        b = int(100 + (y / h) * 100)
        img[y, :] = [b, g, r]

    cv2.circle(img, (w // 3, h // 2), 70, (0, 220, 255), -1)
    cv2.rectangle(img, (w // 2, h // 4), (w // 2 + 140, h // 4 + 100), (255, 100, 50), -1)
    cv2.putText(img, "QualiVision Test Pattern", (30, h - 30), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
    
    for x in range(0, w, 40):
        cv2.line(img, (x, 0), (x, h), (180, 180, 180), 1)
    for y in range(0, h, 40):
        cv2.line(img, (0, y), (w, y), (180, 180, 180), 1)

    return img

def generate_synthetic_dataset():
    os.makedirs(DATASET_DIR, exist_ok=True)
    os.makedirs(SAMPLES_DIR, exist_ok=True)

    categories = {
        "ACCEPTABLE": 80,
        "BLURRY": 60,
        "UNDEREXPOSED": 60,
        "OVEREXPOSED": 60,
        "NOISY": 60,
        "DEFECTIVE": 60,
        "CORRUPT": 40
    }

    count = 0
    for cat, num in categories.items():
        cat_dir = os.path.join(DATASET_DIR, cat)
        os.makedirs(cat_dir, exist_ok=True)

        for i in range(num):
            base_img = create_base_synthetic_image(seed=i + hash(cat) % 10000)
            
            if cat == "ACCEPTABLE":
                img = base_img.copy()
            
            elif cat == "BLURRY":
                ksize = random.choice([15, 21, 27, 35])
                img = cv2.GaussianBlur(base_img, (ksize, ksize), 0)
            
            elif cat == "UNDEREXPOSED":
                factor = random.uniform(0.1, 0.3)
                img = (base_img.astype(np.float32) * factor).astype(np.uint8)
            
            elif cat == "OVEREXPOSED":
                factor = random.uniform(2.2, 3.5)
                img = np.clip(base_img.astype(np.float32) * factor, 0, 255).astype(np.uint8)
            
            elif cat == "NOISY":
                noise_sigma = random.uniform(25, 50)
                gauss = np.random.normal(0, noise_sigma, base_img.shape)
                img = np.clip(base_img.astype(np.float32) + gauss, 0, 255).astype(np.uint8)
            
            elif cat == "DEFECTIVE":
                img = base_img.copy()
                for _ in range(random.randint(2, 5)):
                    pt1 = (random.randint(50, 450), random.randint(50, 350))
                    pt2 = (pt1[0] + random.randint(-120, 120), pt1[1] + random.randint(-120, 120))
                    cv2.line(img, pt1, pt2, (10, 10, 10), random.randint(2, 4))
                for _ in range(random.randint(3, 7)):
                    center = (random.randint(50, 450), random.randint(50, 350))
                    cv2.circle(img, center, random.randint(4, 12), (20, 20, 20), -1)

            elif cat == "CORRUPT":
                encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), random.randint(2, 8)]
                _, encimg = cv2.imencode('.jpg', base_img, encode_param)
                img = cv2.imdecode(encimg, 1)

            filename = f"{cat.lower()}_{i+1:03d}.jpg"
            filepath = os.path.join(cat_dir, filename)
            cv2.imwrite(filepath, img)
            count += 1

            if i == 0:
                sample_path = os.path.join(SAMPLES_DIR, f"sample_{cat.lower()}.jpg")
                cv2.imwrite(sample_path, img)

if __name__ == "__main__":
    generate_synthetic_dataset()
