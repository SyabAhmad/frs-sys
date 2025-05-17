from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from database.db import create_database_tables, SessionLocal, User, FaceProfile
from werkzeug.security import generate_password_hash, check_password_hash
from face_recognition.embedding_service import FaceEmbeddingService
import base64
import io
from PIL import Image
import numpy as np
import os
import secrets

app = Flask(__name__)
CORS(app) # Enable CORS for all routes

# Initialize face embedding service
face_service = FaceEmbeddingService()

@app.route('/')
def index():
    return jsonify({"message": "FRS Backend API is running!"})

@app.route('/users', methods=['GET'])
def get_users():
    db_session = SessionLocal()
    try:
        # Join User and FaceProfile to get all registered users with face data
        profiles = db_session.query(FaceProfile).all()
        
        users_data = [{
            "user_id": profile.user_id,
            "name": profile.full_name,
            "email": profile.user.email if profile.user else None,
            "department": profile.department,
            "occupation": profile.occupation,
            "img": f"/user/{profile.user_id}/image" if profile.face_embedding_id else None
        } for profile in profiles]
        
        return jsonify(users_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        db_session.close()

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    db_session = SessionLocal()
    try:
        # Check if user already exists
        existing_user = db_session.query(User).filter(User.email == data.get('email')).first()
        if existing_user:
            return jsonify({"message": "Email already registered"}), 409

        # Generate password hash
        password_hash = generate_password_hash(data.get('password'))
        
        new_user = User(
            full_name=data.get('full_name'),
            email=data.get('email'),
            password_hash=password_hash  # Store the hashed password
        )
        db_session.add(new_user)
        db_session.commit()
        return jsonify({"message": "User created successfully", "user_id": new_user.user_id}), 201
    except Exception as e:
        db_session.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db_session.close()

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    db_session = SessionLocal()
    try:
        user = db_session.query(User).filter(User.email == email).first()
        
        # Use check_password_hash to verify the password
        if user and check_password_hash(user.password_hash, password):
            return jsonify({
                "message": "Login successful", 
                "user_id": user.user_id,
                "name": user.full_name
            }), 200
        else:
            return jsonify({"message": "Invalid email or password"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        db_session.close()

@app.route('/add-user', methods=['POST'])
def add_user():
    """
    Add a new user with face embedding
    
    Expects:
    - JSON with user details + base64 image
    or
    - multipart/form-data with user details + image file
    """
    try:
        user_data = {}
        image_data = None
        
        # Handle multipart/form-data (image file upload)
        if 'image' in request.files:
            file = request.files['image']
            if file.filename:
                img = Image.open(file.stream)
                # Convert to RGB if image is in a different format
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                image_data = np.array(img)
                
                # Get other form fields
                user_data = {
                    'full_name': request.form.get('name'),
                    'email': request.form.get('email'),
                    'address': request.form.get('address'),
                    'department': request.form.get('department'),
                    'occupation': request.form.get('occupation'),
                    'gender': request.form.get('gender'),
                    'details': request.form.get('details')
                }
        
        # Handle JSON with base64 image
        else:
            data = request.get_json()
            user_data = {
                'full_name': data.get('name'),
                'email': data.get('email'),
                'address': data.get('address'),
                'department': data.get('department'),
                'occupation': data.get('occupation'),
                'gender': data.get('gender'),
                'details': data.get('details')
            }
            
            # Process base64 image if present
            if data.get('image'):
                # Remove the base64 prefix if present
                base64_image = data.get('image')
                if ',' in base64_image:
                    base64_image = base64_image.split(',')[1]
                    
                # Decode base64 to image
                img_data = base64.b64decode(base64_image)
                img = Image.open(io.BytesIO(img_data))
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                image_data = np.array(img)
        
        # Validate required data
        if not user_data.get('full_name') or not user_data.get('email'):
            return jsonify({"message": "Name and email are required"}), 400
            
        if image_data is None:
            return jsonify({"message": "User image is required"}), 400
        
        # Create database session
        db_session = SessionLocal()
        
        try:
            # Check if email already exists in Users or FaceProfiles
            existing_user = db_session.query(User).filter(User.email == user_data.get('email')).first()
            
            # If no user exists yet, create one with a random password
            if existing_user is None:
                # Generate a random password for system-created users
                random_password = secrets.token_urlsafe(12)
                password_hash = generate_password_hash(random_password)
                
                # Create new user
                new_user = User(
                    full_name=user_data.get('full_name'),
                    email=user_data.get('email'),
                    password_hash=password_hash  # Store the hashed password
                )
                db_session.add(new_user)
                db_session.flush()  # Get the ID without committing
                user_id = new_user.user_id
            else:
                user_id = existing_user.user_id
                
            # Generate face embedding
            embedding = face_service.generate_embedding(image_data)
            
            # Store embedding in Qdrant
            embedding_id = face_service.store_embedding(embedding, {
                "user_id": user_id,
                "name": user_data.get('full_name'),
                "email": user_data.get('email'),
                "department": user_data.get('department')
            })
            
            # Save image to disk
            os.makedirs('user_images', exist_ok=True)
            img_path = f"user_images/{user_id}.jpg"
            Image.fromarray(image_data).save(img_path)
            
            # Check if face profile exists
            existing_profile = db_session.query(FaceProfile).filter(
                FaceProfile.user_id == user_id
            ).first()
            
            if existing_profile:
                # Update existing profile
                existing_profile.full_name = user_data.get('full_name')
                existing_profile.profile_image_path = img_path
                existing_profile.face_embedding_id = embedding_id
                existing_profile.address = user_data.get('address')
                existing_profile.department = user_data.get('department')
                existing_profile.occupation = user_data.get('occupation')
                existing_profile.gender = user_data.get('gender')
                existing_profile.details = user_data.get('details')
            else:
                # Create new face profile
                new_profile = FaceProfile(
                    user_id=user_id,
                    full_name=user_data.get('full_name'),
                    profile_image_path=img_path,
                    face_embedding_id=embedding_id,
                    address=user_data.get('address'),
                    department=user_data.get('department'),
                    occupation=user_data.get('occupation'),
                    gender=user_data.get('gender'),
                    details=user_data.get('details')
                )
                db_session.add(new_profile)
            
            # Commit all changes
            db_session.commit()
            
            return jsonify({
                "message": "User added successfully",
                "user_id": user_id,
                "name": user_data.get('full_name')
            }), 201
            
        except Exception as e:
            db_session.rollback()
            raise e
            
        finally:
            db_session.close()
            
    except Exception as e:
        return jsonify({"message": f"Error adding user: {str(e)}"}), 500

@app.route('/recognize', methods=['POST'])
def recognize_face():
    """Recognize a face from an image"""
    try:
        image_data = None
        
        # Handle file upload
        if 'image' in request.files:
            file = request.files['image']
            if file.filename:
                img = Image.open(file.stream)
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                image_data = np.array(img)
        
        # Handle base64 image
        else:
            data = request.get_json()
            if not data or not data.get('image'):
                return jsonify({"message": "No image provided"}), 400
                
            base64_image = data.get('image')
            if ',' in base64_image:
                base64_image = base64_image.split(',')[1]
                
            img_data = base64.b64decode(base64_image)
            img = Image.open(io.BytesIO(img_data))
            if img.mode != 'RGB':
                img = img.convert('RGB')
            image_data = np.array(img)
        
        if image_data is None:
            return jsonify({"message": "Invalid image data"}), 400
        
        # Generate embedding for the uploaded face
        embedding = face_service.generate_embedding(image_data)
        
        # Search for similar faces
        results = face_service.search_similar_faces(embedding, threshold=0.7)
        
        if not results:
            return jsonify({
                "recognized": False,
                "message": "No matching face found"
            }), 200
            
        # Get the best match
        best_match = results[0]
        
        # Get user data from database
        db_session = SessionLocal()
        face_profile = db_session.query(FaceProfile).filter(
            FaceProfile.user_id == best_match.payload.get("user_id")
        ).first()
        db_session.close()
        
        if not face_profile:
            return jsonify({
                "recognized": False,
                "message": "User profile not found"
            }), 200
        
        return jsonify({
            "recognized": True,
            "user": {
                "id": face_profile.user_id,
                "name": face_profile.full_name,
                "department": face_profile.department,
                "occupation": face_profile.occupation,
                "similarity": 1 - best_match.score  # Convert cosine distance to similarity
            }
        }), 200
        
    except Exception as e:
        return jsonify({"message": f"Error recognizing face: {str(e)}"}), 500

@app.route('/user/<int:user_id>/image', methods=['GET'])
def get_user_image(user_id):
    """Get a user's profile image"""
    try:
        img_path = f"user_images/{user_id}.jpg"
        if os.path.exists(img_path):
            return send_file(img_path, mimetype='image/jpeg')
        else:
            return jsonify({"message": "Image not found"}), 404
    except Exception as e:
        return jsonify({"message": f"Error retrieving image: {str(e)}"}), 500

if __name__ == '__main__':
    print("Initializing database and creating tables if they don't exist...")
    create_database_tables()  # Call the function from your db.py
    print("Starting Flask development server...")
    app.run(debug=True, port=5000) # Flask default port is 5000