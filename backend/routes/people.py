from flask import Blueprint, request, jsonify, current_app
from database import get_db_connection
from face_utils import process_face_image
import json
import psycopg2.extras
from psycopg2.extras import RealDictCursor

people_bp = Blueprint('people', __name__)

# Add this new GET route to retrieve people data
@people_bp.route('/api/people', methods=['GET'])
def get_people():
    try:
        # Connect to database
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Get all people records
        cursor.execute("""
            SELECT id, full_name, department, email, phone_number, 
                   age, home_address, occupation, education, 
                   interests, hobbies, bio, created_at
            FROM people_records
            ORDER BY full_name
        """)
        
        people = cursor.fetchall()
        
        # Convert any datetime objects to strings for JSON serialization
        for person in people:
            if person.get('created_at'):
                person['created_at'] = person['created_at'].isoformat()
        
        return jsonify(people), 200
        
    except Exception as e:
        current_app.logger.error(f"Error retrieving people records: {e}")
        return jsonify({"error": f"Failed to retrieve people: {str(e)}"}), 500
    finally:
        if 'conn' in locals() and conn:
            cursor.close()
            conn.close()

# Your existing POST route for adding people
@people_bp.route('/api/people', methods=['POST'])
def add_person():
    # Check if the image is in the request
    if 'faceImage' not in request.files:
        return jsonify({"error": "No face image provided"}), 400
    # full_name: '',
    # age: '',
    # department: '',
    # home_address: '',
    # phone_number: '',
    # email: '',
    # occupation: '',
    # education: '',
    # interests: '',
    # hobbies: '',
    # bio: '',
    # Extract form data
    full_name = request.form.get('full_name', '')
    department = request.form.get('department', '')
    email = request.form.get('email', '')
    phone_number = request.form.get('phone_number', '')
    age = request.form.get('age', '')
    home_address = request.form.get('home_address', '')
    occupation = request.form.get('occupation', '')
    education = request.form.get('education', '')
    interests = request.form.get('interests', '')
    hobbies = request.form.get('hobbies', '')
    bio = request.form.get('bio', '')



    # Get the image file
    file = request.files['faceImage']
    
    try:
        # Process the image to extract face encoding
        image_data = file.read()
        face_encoding, error = process_face_image(image_data)
        
        if error:
            return jsonify({"error": error}), 400
        
        if not face_encoding:
            return jsonify({"error": "Failed to extract face features"}), 400
        
        # Connect to database
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Store the face embedding as a proper PostgreSQL array
        # Use psycopg2's adapt function to format it correctly
        if hasattr(face_encoding, 'tolist'):
            face_encoding = face_encoding.tolist()
            
        # Use psycopg2's adaptation for arrays
        face_embedding_adapted = psycopg2.extensions.adapt(face_encoding)
                # Insert the person record
        cursor.execute(
            "INSERT INTO people_records (full_name, department, email, phone_number, face_embedding, age, home_address, occupation, education, interests, hobbies, bio) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id",
            (full_name, department, email, phone_number, face_embedding_adapted, age, home_address, occupation, education, interests, hobbies, bio)
        )
        
        new_person_id = cursor.fetchone()[0]
        conn.commit()
        
        return jsonify({
            "id": new_person_id,
            "message": "Person added successfully"
        }), 201
        
    except Exception as e:
        current_app.logger.error(f"Error adding person record: {e}")
        return jsonify({"error": f"Failed to add person: {str(e)}"}), 500
    finally:
        if 'conn' in locals():
            cursor.close()
            conn.close()

@people_bp.route('/api/people/<int:person_id>', methods=['DELETE'])
def delete_person(person_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("DELETE FROM people_records WHERE id = %s RETURNING id", (person_id,))
        deleted = cur.fetchone()
        conn.commit()
        if deleted:
            return jsonify({"message": "Person deleted successfully."}), 200
        else:
            return jsonify({"error": "Person not found."}), 404
    except Exception as e:
        current_app.logger.error(f"Error deleting person: {e}")
        return jsonify({"error": f"Failed to delete person: {str(e)}"}), 500
    finally:
        if 'conn' in locals() and conn:
            cur.close()
            conn.close()