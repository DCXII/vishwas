import cv2
import numpy as np
import os

# Paths to models
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
YUNET_PATH = os.path.join(BASE_DIR, "..", "models", "face_detection_yunet_2023mar.onnx")
SFACE_PATH = os.path.join(BASE_DIR, "..", "models", "face_recognition_sface_2021dec.onnx")

detector = None
recognizer = None

def init_models():
    global detector, recognizer
    if detector is None:
        try:
            detector = cv2.FaceDetectorYN.create(
                YUNET_PATH,
                "",
                (320, 320), # Input size will be updated later
                0.9, # Score threshold
                0.3, # NMS threshold
                5000 # Top K
            )
            print("YuNet detector loaded.")
        except Exception as e:
            print(f"Failed to load YuNet: {e}")

    if recognizer is None:
        try:
            recognizer = cv2.FaceRecognizerSF.create(SFACE_PATH, "")
            print("SFace recognizer loaded.")
        except Exception as e:
            print(f"Failed to load SFace: {e}")

def load_and_encode(image_path):
    """
    Loads an image and returns the face feature (128D or similar).
    """
    init_models()
    if detector is None or recognizer is None:
        print("Models not loaded.")
        return None

    img = cv2.imread(image_path)
    if img is None:
        print(f"Could not read image {image_path}")
        return None
    
    # Resize if too large to speed up detection
    height, width, _ = img.shape
    detector.setInputSize((width, height))
    
    # Detect
    faces = detector.detect(img)
    if faces[1] is None:
        return None
    
    # Take the first face (faces[1] is the results array)
    # Each row is: x, y, w, h, x1, y1, ... (landmarks), score
    face_info = faces[1][0]
    
    # Align and Extract feature
    aligned_face = recognizer.alignCrop(img, face_info)
    feature = recognizer.feature(aligned_face) # Returns numpy array
    
    return feature

def compare_faces(known_feature, unknown_feature):
    """
    Compares two features using Cosine Similarity.
    SFace threshold is typically around 0.363 for Cosine.
    Returns: (match_bool, score)
    """
    init_models()
    if known_feature is None or unknown_feature is None:
        return (False, 0.0)
    
    # Cosine Similarity: 1 means identical, 0 means different
    # cv2.FaceRecognizerSF.match returns match score.
    # Dataset    | Metric | Threshold
    # LFW        | Cosine | 0.363
    # LFW        | L2     | 1.128
    
    score = recognizer.match(known_feature, unknown_feature, cv2.FaceRecognizerSF_FR_COSINE)
    
    # Threshold for match
    is_match = score >= 0.363 
    
    return (is_match, score)
