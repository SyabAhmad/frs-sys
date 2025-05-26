from flask import Blueprint, request, jsonify, current_app
import numpy as np
import face_recognition
from database import get_db_connection
from face_utils import process_face_image
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
        # Process the face image
        image_data = file.read()
        face_encoding, error = process_face_image(image_data)
        
        if error:
            return jsonify({"error": error}), 400
        
        # Query the database for matching face
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Get all people with their face encodings
        cur.execute("SELECT id, full_name, department, email, phone_number, face_embedding FROM people_records")
        people = cur.fetchall()
        
        best_match = None
        best_match_distance = float('inf')
        
        # Compare with each stored face
        for person in people:
            # Convert the stored face encoding array back to numpy array
            stored_encoding = np.array(person["face_embedding"])
            
            # Calculate face distance (lower is more similar)
            face_distance = face_recognition.face_distance([stored_encoding], face_encoding)[0]
            
            # Update best match if this is better
            if face_distance < best_match_distance:
                best_match_distance = face_distance
                best_match = person
        
        # Define a confidence threshold (lower distance = higher confidence)
        threshold = 0.6  # Adjust based on your needs
        
        if best_match is not None and best_match_distance < threshold:
            # Calculate a confidence score (1.0 = perfect match)
            confidence = 1 - best_match_distance
            
            # Return the match
            return jsonify({
                "id": best_match["id"],
                "full_name": best_match["full_name"],
                "department": best_match["department"],
                "email": best_match["email"],
                "phone_number": best_match["phone_number"],
                "confidence": confidence
            }), 200
        else:
            return jsonify({"error": "No matching person found"}), 404
            
    except Exception as e:
        current_app.logger.error(f"Error scanning face: {e}")
        return jsonify({"error": "An error occurred during face scanning"}), 500
    finally:
        if 'conn' in locals() and conn:
            cur.close()
            conn.close()