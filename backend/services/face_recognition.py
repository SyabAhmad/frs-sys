import face_recognition
import numpy as np
import io

def load_image_from_stream(file_stream):
    """
    Loads an image from a file stream (e.g., Flask's request.files).
    Returns a NumPy array representation of the image.
    """
    try:
        image = face_recognition.load_image_file(file_stream)
        return image
    except Exception as e:
        print(f"Error loading image from stream: {e}")
        return None

def get_face_encodings_from_image(image_array):
    """
    Detects faces in an image and returns their encodings.
    Args:
        image_array: A NumPy array of the image.
    Returns:
        A list of 128-dimensional face encodings (NumPy arrays).
        Returns an empty list if no faces are found or an error occurs.
    """
    if image_array is None:
        return []
    try:
        # The face_encodings function returns a list of 128-dimensional face encodings
        # for each face in the image.
        face_encodings = face_recognition.face_encodings(image_array)
        return face_encodings
    except Exception as e:
        print(f"Error getting face encodings: {e}")
        return []

def get_face_locations(image_array):
    """
    Detects face locations in an image.
    Args:
        image_array: A NumPy array of the image.
    Returns:
        A list of tuples for face locations (top, right, bottom, left).
        Returns an empty list if no faces are found or an error occurs.
    """
    if image_array is None:
        return []
    try:
        face_locations = face_recognition.face_locations(image_array)
        return face_locations
    except Exception as e:
        print(f"Error getting face locations: {e}")
        return []

if __name__ == '__main__':
    # Example usage (requires a test image file)
    # Create a dummy image file for testing if you don't have one
    # For example, place 'test_image.jpg' in the same directory
    try:
        with open("test_image.jpg", "rb") as f: # Replace with a path to an actual image
            img_array = load_image_from_stream(f)
            if img_array is not None:
                print("Image loaded successfully.")
                
                locations = get_face_locations(img_array)
                print(f"Found {len(locations)} face(s) at locations: {locations}")
                
                encodings = get_face_encodings_from_image(img_array)
                if encodings:
                    print(f"Generated {len(encodings)} face encoding(s).")
                    # Each encoding is a numpy array of 128 numbers
                    print(f"First encoding: {encodings[0][:10]}...") # Print first 10 values
                else:
                    print("No face encodings generated.")
            else:
                print("Failed to load image.")
    except FileNotFoundError:
        print("test_image.jpg not found. Please provide an image for testing.")
    except Exception as e:
        print(f"An error occurred during testing: {e}")