import cv2
import numpy as np
import os

# Paths to ONNX models
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, '..', 'face_detection_model', '1', 'models')
YUNET_PATH = os.path.join(MODELS_DIR, 'face_detection_yunet_2023mar.onnx')
SFACE_PATH = os.path.join(MODELS_DIR, 'face_recognition_sface_2021dec.onnx')

detector = None
recognizer = None

def init_models():
    global detector, recognizer
    if detector is None:
        try:
            detector = cv2.FaceDetectorYN.create(
                YUNET_PATH,
                "",
                (320, 320),
                0.9,
                0.3,
                5000
            )
            print(f"YuNet detector loaded from {YUNET_PATH}")
        except Exception as e:
            print(f"Failed to load YuNet: {e}")

    if recognizer is None:
        try:
            recognizer = cv2.FaceRecognizerSF.create(SFACE_PATH, "")
            print(f"SFace recognizer loaded from {SFACE_PATH}")
        except Exception as e:
            print(f"Failed to load SFace: {e}")

def load_and_encode(image_path):
    """Load an image and return the face feature vector."""
    init_models()
    if detector is None or recognizer is None:
        print("Models not loaded.")
        return None

    img = cv2.imread(image_path)
    if img is None:
        print(f"Could not read image {image_path}")
        return None

    height, width, _ = img.shape
    detector.setInputSize((width, height))

    faces = detector.detect(img)
    if faces[1] is None:
        return None

    face_info = faces[1][0]
    aligned_face = recognizer.alignCrop(img, face_info)
    feature = recognizer.feature(aligned_face)

    return feature

def compare_faces(known_feature, unknown_feature):
    """Compare two face features using Cosine Similarity. Threshold: 0.363"""
    init_models()
    if known_feature is None or unknown_feature is None:
        return (False, 0.0)

    score = recognizer.match(known_feature, unknown_feature, cv2.FaceRecognizerSF_FR_COSINE)
    is_match = score >= 0.363

    return (is_match, score)
