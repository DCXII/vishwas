import requests
import os

YUNET_URL = "https://github.com/opencv/opencv_zoo/raw/main/models/face_detection_yunet/face_detection_yunet_2023mar.onnx"
SFACE_URL = "https://github.com/opencv/opencv_zoo/raw/main/models/face_recognition_sface/face_recognition_sface_2021dec.onnx"

MODELS_DIR = "models"

def download_file(url, dest_folder):
    if not os.path.exists(dest_folder):
        os.makedirs(dest_folder)
    
    filename = url.split('/')[-1]
    filepath = os.path.join(dest_folder, filename)
    
    if os.path.exists(filepath):
        print(f"{filename} already exists.")
        return filepath
        
    print(f"Downloading {filename}...")
    response = requests.get(url, stream=True)
    if response.status_code == 200:
        with open(filepath, 'wb') as f:
            for chunk in response.iter_content(1024):
                f.write(chunk)
        print("Download complete.")
        return filepath
    else:
        print(f"Failed to download {filename}. HTTP {response.status_code}")
        return None

if __name__ == "__main__":
    download_file(YUNET_URL, MODELS_DIR)
    download_file(SFACE_URL, MODELS_DIR)
