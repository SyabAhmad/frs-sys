from flask import Flask, request, jsonify
from flask_cors import CORS
import bcrypt 
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime 
import os
from werkzeug.utils import secure_filename # For handling filenames
import uuid # For generating unique filenames
import face_recognition
import numpy as np
import secrets # For generating tokens

app = Flask(__name__)
CORS(app) # This will allow requests from your frontend (defaulting to all origins)
# For more specific CORS configuration:
# CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}}) # Assuming frontend is on port 3000

# --- File Upload Configuration ---
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads', 'people_images')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER) # Create the folder if it doesn't exist

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# --- Database Connection ---
def get_database_url():
    """Get database connection parameters from environment variables"""
    DB_USER = os.getenv('DB_USER', 'postgres')
    DB_PASSWORD = os.getenv('DB_PASSWORD', 'mentee') 
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_PORT = os.getenv('DB_PORT', '5433') 
    DB_NAME = os.getenv('DB_NAME', 'frs_db')
    
    return {
        "user": DB_USER,
        "password": DB_PASSWORD,
        "host": DB_HOST,
        "port": DB_PORT,
        "dbname": DB_NAME
    }

def get_db_connection():
    """Create a new database connection"""
    params = get_database_url()
    conn = psycopg2.connect(**params)
    return conn

def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

def check_password(password, hashed_password):
    if isinstance(hashed_password, str):
        hashed_password = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password)


@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    full_name = data.get('full_name')
    email = data.get('email')
    password = data.get('password')

    if not all([full_name, email, password]):
        return jsonify({"error": "Missing data"}), 400

    hashed_pw = hash_password(password)

    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Check if email already exists
        cur.execute("SELECT email FROM users WHERE email = %s", (email,))
        if cur.fetchone():
            return jsonify({"error": "Email already registered", "field": "email"}), 409
            
        # Check if username already exists
        cur.execute("SELECT username FROM users WHERE username = %s", (full_name,))
        if cur.fetchone():
            return jsonify({"error": "Username already taken, please try a different name", "field": "username"}), 409

        # Proceed with registration if username and email are unique
        cur.execute(
            "INSERT INTO users (username, email, password_hash) VALUES (%s, %s, %s) RETURNING id",
            (full_name, email, hashed_pw.decode('utf-8')) 
        )
        user_id_data = cur.fetchone()
        if not user_id_data or 'id' not in user_id_data:
             app.logger.error("User ID not returned after insert.")
             return jsonify({"error": "Failed to register user"}), 500
        user_id = user_id_data['id']
        conn.commit()
        
        return jsonify({"message": "User registered successfully!", "user_id": user_id}), 201
    except psycopg2.Error as e:
        if conn:
            conn.rollback()
        app.logger.error(f"Database error during signup: {e}")
        return jsonify({"error": "Database error", "details": str(e)}), 500
    except Exception as e:
        app.logger.error(f"Unexpected error during signup: {e}")
        return jsonify({"error": "An unexpected error occurred", "details": str(e)}), 500
    finally:
        if conn:
            cur.close()
            conn.close()

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not all([email, password]):
        return jsonify({'error': 'Missing email or password'}), 400

    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Check if user exists
        cur.execute("SELECT id, username, email, password_hash FROM users WHERE email = %s", (email,))
        user = cur.fetchone()
        
        if not user:
            return jsonify({'error': 'Invalid email or password'}), 401
            
        # Check password
        if not check_password(password, user['password_hash']):
            return jsonify({'error': 'Invalid email or password'}), 401
            
        # Generate token (you would use a proper JWT here)
        token = secrets.token_hex(16)
        
        # Don't return the password hash to the client
        user.pop('password_hash', None)
        
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': user
        }), 200
    except Exception as e:
        app.logger.error(f"Login error: {e}")
        return jsonify({'error': 'Login failed'}), 500
    finally:
        if conn:
            cur.close()
            conn.close()

# --- New Endpoint for Adding People ---
@app.route('/api/people', methods=['POST'])
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
        # Save the image data to memory for processing
        image_data = file.read()
        
        # Convert image to numpy array for face_recognition
        np_image = np.frombuffer(image_data, np.uint8)
        
        # Use OpenCV to decode the image
        import cv2
        image = cv2.imdecode(np_image, cv2.IMREAD_COLOR)
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Find face locations and extract encodings
        face_locations = face_recognition.face_locations(rgb_image)
        
        if not face_locations:
            return jsonify({"error": "No face detected in the image. Please try again."}), 400
        
        face_encodings = face_recognition.face_encodings(rgb_image, face_locations)
        
        if not face_encodings:
            return jsonify({"error": "Failed to encode face. Please try with a clearer image."}), 400
        
        # Get the first face encoding (assuming one face per image)
        face_encoding = face_encodings[0]
        
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

    except cv2.error as e:
        app.logger.error(f"OpenCV error processing image: {e}")
        return jsonify({"error": "Error processing image", "details": str(e)}), 500
    except psycopg2.Error as e:
        if conn:
            conn.rollback()
        app.logger.error(f"Database error while adding person: {e}")
        return jsonify({"error": "Database error", "details": str(e)}), 500
    except Exception as e:
        app.logger.error(f"Error adding person record: {e}")
        return jsonify({"error": "Failed to add person record", "details": str(e)}), 500
    finally:
        if conn:
            cur.close()
            conn.close()

@app.route('/api/scan', methods=['POST'])
def scan_face():
    # Check if the image is in the request
    if 'faceImage' not in request.files:
        return jsonify({"error": "No face image part in the request"}), 400
    
    file = request.files['faceImage']
    if file.filename == '':
        return jsonify({"error": "No selected face image file"}), 400

    try:
        # Process the image using face_recognition
        image_data = file.read()
        np_image = np.frombuffer(image_data, np.uint8)
        
        import cv2
        image = cv2.imdecode(np_image, cv2.IMREAD_COLOR)
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Find face locations and extract encodings
        face_locations = face_recognition.face_locations(rgb_image)
        
        if not face_locations:
            return jsonify({"error": "No face detected in the image"}), 400
        
        face_encodings = face_recognition.face_encodings(rgb_image, face_locations)
        
        if not face_encodings:
            return jsonify({"error": "Failed to encode face"}), 400
        
        # Get the first face encoding (assuming one face per image)
        face_encoding = face_encodings[0]
        
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
            
    except cv2.error as e:
        app.logger.error(f"OpenCV error processing image: {e}")
        return jsonify({"error": "Error processing image"}), 500
    except Exception as e:
        app.logger.error(f"Error scanning face: {e}")
        return jsonify({"error": "An error occurred during face scanning"}), 500
    finally:
        if 'conn' in locals() and conn:
            cur.close()
            conn.close()


if __name__ == '__main__':
    if not os.getenv('DB_PASSWORD'):
        print("WARNING: DB_PASSWORD environment variable is not set.")
    
    # Note: Your frontend is trying to reach http://localhost:8000
    # This Flask app runs on port 5000 by default.
    # Ensure your frontend fetch URL matches this port or change this port.
    app.run(debug=True, port=5000)