import cv2
import os
import numpy as np
from datetime import datetime

def save_debug_image(image, faces=None, output_dir="debug_images"):
    """
    Save an image with face detection visualization for debugging
    
    Args:
        image: numpy array of the image
        faces: list of face detection results (x, y, w, h)
        output_dir: directory to save debug images
    """
    try:
        # Create output directory if it doesn't exist
        os.makedirs(output_dir, exist_ok=True)
        
        # Create a copy of the image for visualization
        debug_image = image.copy()
        
        # Draw rectangles around detected faces
        if faces is not None and len(faces) > 0:
            for (x, y, w, h) in faces:
                cv2.rectangle(debug_image, (x, y), (x+w, y+h), (0, 255, 0), 2)
        
        # Generate a unique filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{output_dir}/face_debug_{timestamp}.jpg"
        
        # Save the image
        cv2.imwrite(filename, debug_image)
        print(f"Debug image saved to {filename}")
        
        return filename
    except Exception as e:
        print(f"Error saving debug image: {e}")
        return None