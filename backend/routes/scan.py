from flask import Blueprint, request, jsonify, current_app
import numpy as np
import face_recognition
from database import get_db_connection
from face_utils import process_image_with_multiple_faces
from psycopg2.extras import RealDictCursor

scan_bp = Blueprint('scan', __name__)

@scan_bp.route('/api/scan', methods=['POST'])
def scan_face():
    # Check if the image is in the request
    if 'faceImage' not in request.files:
        return jsonify({"error": "No face image part in the request"}), 400
    
    file = request.files['faceImage']
    if file.filename == '':
        return jsonify({"error": "No selected face image file"}), 400

    try:
        # Process the image to get multiple face encodings
        image_data = file.read()
        face_encodings, face_locations, error = process_image_with_multiple_faces(image_data)
        
        if error:
            return jsonify({"error": error}), 400
        
        if len(face_encodings) == 0:
            return jsonify({"error": "No faces detected in the image"}), 400
            
        # Query the database for matching faces
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Get all people with their face encodings
        cur.execute("SELECT id, full_name, department, email, phone_number, face_embedding FROM people_records")
        people_records = cur.fetchall()
        
        # Convert DB face encodings to numpy arrays for comparison
        stored_encodings = []
        stored_people = []
        
        for person in people_records:
            stored_encodings.append(np.array(person["face_embedding"]))
            stored_people.append(person)
        
        # List to hold all recognized faces
        recognized_faces = []
        
        # Define a confidence threshold (lower distance = higher confidence)
        threshold = 0.6  # Adjust based on your needs
        
        # For each detected face
        for i, face_encoding in enumerate(face_encodings):
            # Calculate all distances
            if stored_encodings:  # Check if there are any stored encodings
                face_distances = face_recognition.face_distance(stored_encodings, face_encoding)
                
                # Find the best match (minimum distance)
                best_match_index = np.argmin(face_distances)
                best_match_distance = face_distances[best_match_index]
                
                # If the match is good enough
                if best_match_distance < threshold:
                    # Calculate confidence score
                    confidence = 1 - best_match_distance
                    best_match = stored_people[best_match_index]
                    
                    # Add location information for UI positioning
                    top, right, bottom, left = face_locations[i]
                    
                    # Add this person to the results with default values for NULL
                    recognized_faces.append({
                        "id": best_match["id"],
                        "full_name": best_match["full_name"] or "",
                        "department": best_match["department"] or "",
                        "email": best_match["email"] or "",
                        "phone_number": best_match["phone_number"] or "",
                        "confidence": float(confidence),  # Ensure it's a float
                        "face_location": {
                            "top": int(top),
                            "right": int(right),
                            "bottom": int(bottom),
                            "left": int(left)
                        }
                    })
        
        # Return the results
        if recognized_faces:
            return jsonify(recognized_faces), 200
        else:
            return jsonify({"error": "No matching faces found in database"}), 404
            
    except Exception as e:
        current_app.logger.error(f"Error scanning faces: {e}")
        return jsonify({"error": f"An error occurred during face scanning: {str(e)}"}), 500
    finally:
        if 'conn' in locals() and conn:
            cur.close()
            conn.close()