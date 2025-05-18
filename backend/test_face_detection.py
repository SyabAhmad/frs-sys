import cv2
import numpy as np
import os
from face_recognition.embedding_service import FaceEmbeddingService
from utils.debug_utils import save_debug_image

def test_face_detection():
    """Test face detection and cropping functionality"""
    service = FaceEmbeddingService()
    
    # Try loading a test image
    # Check a few common locations for test images
    test_image_paths = [
        "test_images/face.jpg",
        "user_images/1.jpg",
        "../frontend/public/assets/sample.jpg"
    ]
    
    image = None
    for path in test_image_paths:
        if os.path.exists(path):
            print(f"Loading test image from {path}")
            image = cv2.imread(path)
            if image is not None:
                break
    
    # If no image found, create a dummy one
    if image is None:
        print("No test image found, using a random image")
        # Create a random image
        image = np.random.randint(0, 255, (400, 400, 3), dtype=np.uint8)
    
    # Create debug directory if it doesn't exist
    os.makedirs("debug_images", exist_ok=True)
    
    # Save original image
    cv2.imwrite("debug_images/original.jpg", image)
    print("Original image saved to debug_images/original.jpg")
    
    # Detect faces
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    faces = service.face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(30, 30)
    )
    
    # Save debug image with face detection visualization
    save_debug_image(image, faces)
    
    # Crop the face
    cropped_face = service.detect_and_crop_face(image)
    
    # Save cropped face
    cv2.imwrite("debug_images/cropped_face.jpg", cropped_face)
    print("Cropped face saved to debug_images/cropped_face.jpg")
    
    # Generate embedding from cropped face
    embedding = service.generate_embedding(image)
    
    print(f"Generated embedding with {len(embedding)} dimensions")
    print(f"First 5 values: {embedding[:5]}")
    
    return True

if __name__ == "__main__":
    test_face_detection()
    print("Test completed!")