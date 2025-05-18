from database.db import SessionLocal, User, FaceProfile
from werkzeug.security import generate_password_hash
from services.auth_service import generate_random_password
import os
from PIL import Image

def get_all_users():
    """Get all users with face profiles"""
    db_session = SessionLocal()
    try:
        profiles = db_session.query(FaceProfile).all()
        
        users_data = [{
            "user_id": profile.user_id,
            "name": profile.full_name,
            "email": profile.user.email if profile.user else None,
            "department": profile.department,
            "occupation": profile.occupation,
            "img": f"/user/{profile.user_id}/image" if profile.face_embedding_id else None
        } for profile in profiles]
        
        return users_data, 200
    except Exception as e:
        return {"error": str(e)}, 500
    finally:
        db_session.close()

def get_user_by_id(user_id):
    """Get user by ID"""
    db_session = SessionLocal()
    try:
        user = db_session.query(User).filter(User.user_id == user_id).first()
        if not user:
            return {"message": "User not found"}, 404
            
        # Get face profile if it exists
        profile = db_session.query(FaceProfile).filter(
            FaceProfile.user_id == user_id
        ).first()
        
        user_data = {
            "user_id": user.user_id,
            "name": user.full_name,
            "email": user.email,
        }
        
        if profile:
            user_data.update({
                "department": profile.department,
                "occupation": profile.occupation,
                "address": profile.address,
                "gender": profile.gender,
                "details": profile.details,
                "has_face_profile": True,
                "img": f"/user/{user.user_id}/image" if profile.face_embedding_id else None
            })
        else:
            user_data["has_face_profile"] = False
            
        return user_data, 200
    except Exception as e:
        return {"error": str(e)}, 500
    finally:
        db_session.close()

def get_user_image(user_id):
    """Get a user's profile image"""
    try:
        img_path = f"user_images/{user_id}.jpg"
        if os.path.exists(img_path):
            return img_path, 200
        else:
            return {"message": "Image not found"}, 404
    except Exception as e:
        return {"message": f"Error retrieving image: {str(e)}"}, 500

def find_or_create_user(email, full_name):
    """Find a user by email or create a new one"""
    db_session = SessionLocal()
    try:
        existing_user = db_session.query(User).filter(User.email == email).first()
        
        if existing_user is None:
            # Generate a random password for system-created users
            random_password = generate_random_password()
            password_hash = generate_password_hash(random_password)
            
            # Create new user
            new_user = User(
                full_name=full_name,
                email=email,
                password_hash=password_hash
            )
            db_session.add(new_user)
            db_session.flush()  # Get the ID without committing
            user_id = new_user.user_id
        else:
            user_id = existing_user.user_id
            
        return user_id
    except Exception as e:
        db_session.rollback()
        raise e

def create_or_update_face_profile(user_id, profile_data, image_path, embedding_id):
    """Create or update a user's face profile"""
    db_session = SessionLocal()
    try:
        # Check if face profile exists
        existing_profile = db_session.query(FaceProfile).filter(
            FaceProfile.user_id == user_id
        ).first()
        
        if existing_profile:
            # Update existing profile
            existing_profile.full_name = profile_data.get('full_name')
            existing_profile.profile_image_path = image_path
            existing_profile.face_embedding_id = embedding_id
            existing_profile.address = profile_data.get('address')
            existing_profile.department = profile_data.get('department')
            existing_profile.occupation = profile_data.get('occupation')
            existing_profile.gender = profile_data.get('gender')
            existing_profile.details = profile_data.get('details')
        else:
            # Create new face profile
            new_profile = FaceProfile(
                user_id=user_id,
                full_name=profile_data.get('full_name'),
                profile_image_path=image_path,
                face_embedding_id=embedding_id,
                address=profile_data.get('address'),
                department=profile_data.get('department'),
                occupation=profile_data.get('occupation'),
                gender=profile_data.get('gender'),
                details=profile_data.get('details')
            )
            db_session.add(new_profile)
        
        db_session.commit()
        return True
    except Exception as e:
        db_session.rollback()
        raise e
    finally:
        db_session.close()