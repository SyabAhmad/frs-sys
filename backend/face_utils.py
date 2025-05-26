import face_recognition
import numpy as np
import cv2

def process_face_image(image_data):
    """Process an image and extract face encodings"""
    # Convert image to numpy array
    np_image = np.frombuffer(image_data, np.uint8)
    
    # Use OpenCV to decode the image
    image = cv2.imdecode(np_image, cv2.IMREAD_COLOR)
    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    
    # Find face locations and extract encodings
    face_locations = face_recognition.face_locations(rgb_image)
    
    if not face_locations:
        return None, "No face detected in the image"
    
    face_encodings = face_recognition.face_encodings(rgb_image, face_locations)
    
    if not face_encodings:
        return None, "Failed to encode face"
    
    # Return the first face encoding (assuming one face per image)
    return face_encodings[0], None