import face_recognition
import numpy as np
from io import BytesIO
from PIL import Image

def process_face_image(image_data):
    """
    Process an image to extract a single primary face encoding
    Used for enrollment where we expect one clear face
    
    Args:
        image_data (bytes): The raw image data
        
    Returns:
        tuple: (face_encoding, error_message)
    """
    try:
        # Load image from binary data
        image = np.array(Image.open(BytesIO(image_data)))
        
        # Find all face locations in the image
        face_locations = face_recognition.face_locations(image, model="hog")
        
        if not face_locations:
            return None, "No face detected in the image"
        
        if len(face_locations) > 1:
            # For enrollment, we expect one clear face
            # You may choose to accept the largest face instead
            return None, "Multiple faces detected. Please provide an image with only one face."
        
        # Get face encoding for the detected face
        face_encodings = face_recognition.face_encodings(image, face_locations)
        
        if not face_encodings:
            return None, "Could not extract face features. Please try with a clearer image."
        
        # Check if encoding is already a list or needs conversion
        if isinstance(face_encodings[0], np.ndarray):
            return face_encodings[0].tolist(), None
        else:
            return face_encodings[0], None
        
    except Exception as e:
        return None, f"Error processing image: {str(e)}"

def process_image_with_multiple_faces(image_data):
    """
    Process an image to detect and extract multiple face encodings
    Used for recognition where we may have multiple people
    
    Args:
        image_data (bytes): The raw image data
        
    Returns:
        tuple: (face_encodings, face_locations, error_message)
    """
    try:
        # Load image from binary data
        image = np.array(Image.open(BytesIO(image_data)))
        
        # Find all face locations in the image
        face_locations = face_recognition.face_locations(image, model="hog")
        
        if not face_locations:
            return [], [], "No faces detected in the image"
        
        # Get face encodings for the detected faces
        face_encodings = face_recognition.face_encodings(image, face_locations)
        
        if not face_encodings:
            return [], [], "Could not extract face features. Please try with a clearer image."
        
        return face_encodings, face_locations, None
        
    except Exception as e:
        return [], [], f"Error processing image: {str(e)}"