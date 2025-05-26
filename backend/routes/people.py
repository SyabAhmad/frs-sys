from flask import Blueprint, request, jsonify, current_app
import psycopg2
from database import get_db_connection
from face_utils import process_face_image

people_bp = Blueprint('people', __name__)

@people_bp.route('/api/people', methods=['POST'])
def add_people_record():
    # --- Form Data ---
    full_name = request.form.get('full_name')
    age_str = request.form.get('age')
    department = request.form.get('department')
    home_address = request.form.get('home_address')
    phone_number = request.form.get('phone_number')
    email = request.form.get('email')
    occupation = request.form.get('occupation')
    education = request.form.get('education')
    interests = request.form.get('interests')
    hobbies = request.form.get('hobbies')
    bio = request.form.get('bio')

    # --- File Data ---
    if 'faceImage' not in request.files:
        return jsonify({"error": "No face image part in the request"}), 400
    
    file = request.files['faceImage']

    if file.filename == '':
        return jsonify({"error": "No selected face image file"}), 400

    # --- Validations ---
    if not full_name:
        return jsonify({"error": "Full name is required"}), 400
    
    age = None
    if age_str:
        try:
            age = int(age_str)
        except ValueError:
            return jsonify({"error": "Invalid age format"}), 400

    conn = None
    try:
        # Process the face image
        image_data = file.read()
        face_encoding, error = process_face_image(image_data)
        
        if error:
            return jsonify({"error": error}), 400
        
        # For double precision array in PostgreSQL, we need to convert the encoding to a list
        face_encoding_list = face_encoding.tolist()
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Update to use the correct table and column name
        cur.execute(
            """
            INSERT INTO people_records (
                full_name, age, department, home_address, phone_number, email,
                occupation, education, interests, hobbies, bio, face_embedding
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id
            """,
            (
                full_name, age, department, home_address, phone_number, email,
                occupation, education, interests, hobbies, bio, face_encoding_list
            )
        )
        person_id = cur.fetchone()[0]
        conn.commit()
        
        return jsonify({
            "message": "Person record and face encoding added successfully!", 
            "person_id": person_id
        }), 201

    except Exception as e:
        if conn:
            conn.rollback()
        current_app.logger.error(f"Error adding person record: {e}")
        return jsonify({"error": "Failed to add person record", "details": str(e)}), 500
    finally:
        if conn:
            cur.close()
            conn.close()