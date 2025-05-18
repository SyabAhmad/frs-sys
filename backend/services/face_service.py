from face_recognition.embedding_service import FaceEmbeddingService
from database.db import SessionLocal, FaceProfile
from utils.image_utils import save_image
from services.user_service import find_or_create_user, create_or_update_face_profile
import os
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize the face embedding service
face_embedding_service = FaceEmbeddingService()

def add_face_profile(user_data, image_data):
    """Add a new user face profile with embedding"""
    try:
        # Validate required data
        if not user_data.get('full_name') or not user_data.get('email'):
            logger.warning("Missing required fields: name or email")
            return {"message": "Name and email are required"}, 400
            
        if image_data is None:
            logger.warning("Missing required image data")
            return {"message": "User image is required"}, 400
        
        logger.info(f"Processing face profile for: {user_data.get('full_name')}")
        
        # Find or create user
        user_id = find_or_create_user(user_data.get('email'), user_data.get('full_name'))
        logger.info(f"User ID: {user_id}")
        
        # Generate face embedding
        logger.info("Generating face embedding...")
        embedding = face_embedding_service.generate_embedding(image_data)
        
        # Store embedding in Qdrant
        logger.info("Storing embedding in database...")
        embedding_id = face_embedding_service.store_embedding(embedding, {
            "user_id": user_id,
            "name": user_data.get('full_name'),
            "email": user_data.get('email'),
            "department": user_data.get('department')
        })
        
        # Save image to disk
        os.makedirs('user_images', exist_ok=True)
        img_path = f"user_images/{user_id}.jpg"
        save_image(image_data, img_path)
        logger.info(f"Saved user image to {img_path}")
        
        # Create or update face profile
        create_or_update_face_profile(user_id, user_data, img_path, embedding_id)
        logger.info("Face profile created/updated successfully")
        
        return {
            "message": "User added successfully",
            "user_id": user_id,
            "name": user_data.get('full_name')
        }, 201
            
    except Exception as e:
        logger.error(f"Error adding user: {str(e)}", exc_info=True)
        return {"message": f"Error adding user: {str(e)}"}, 500

def recognize_face(image_data):
    """Recognize a face from image data"""
    try:
        if image_data is None:
            logger.warning("Invalid image data")
            return {"message": "Invalid image data"}, 400
        
        logger.info("Generating embedding for recognition")
        # Generate embedding for the uploaded face
        embedding = face_embedding_service.generate_embedding(image_data)
        
        if embedding is None:
            logger.error("Failed to generate embedding")
            return {"message": "Failed to generate face embedding"}, 500
        
        logger.info("Searching for similar faces")
        # Search for top 5 similar faces
        results = face_embedding_service.search_similar_faces(embedding, threshold=0.5, limit=5)
        
        if not results:
            logger.info("No matching face found")
            return {
                "recognized": False,
                "message": "No matching face found",
                "matches": []
            }, 200
            
        # Process matches to get user details
        matches = []
        db_session = SessionLocal()
        try:
            for result in results:
                # Calculate similarity score (convert from distance)
                similarity_score = 1 - result.score
                confidence = min(similarity_score * 100, 100.0)
                
                # Get user info from payload
                user_id = result.payload.get("user_id")
                name = result.payload.get("name", "Unknown")
                department = result.payload.get("department", "Not specified")
                
                # Try to get additional details from database
                face_profile = None
                try:
                    face_profile = db_session.query(FaceProfile).filter(
                        FaceProfile.user_id == user_id
                    ).first()
                    
                    if face_profile:
                        name = face_profile.full_name
                        department = face_profile.department or "Not specified"
                except Exception as e:
                    logger.warning(f"Error retrieving profile for user {user_id}: {e}")
                
                # Add to matches list
                matches.append({
                    "user_id": user_id,
                    "name": name,
                    "department": department,
                    "confidence": round(confidence, 1)
                })
        finally:
            db_session.close()
            
        # Get the best match
        best_match = results[0]
        best_similarity = 1 - best_match.score
        
        logger.info(f"Best match score: {best_similarity:.4f}")
        
        # Only consider it a match if the similarity is high enough
        recognized = best_similarity >= 0.6  # 60% threshold
        
        if recognized:
            # Get user data from database for the best match
            db_session = SessionLocal()
            try:
                user_id = best_match.payload.get("user_id")
                logger.info(f"Looking up user ID: {user_id}")
                
                face_profile = db_session.query(FaceProfile).filter(
                    FaceProfile.user_id == user_id
                ).first()
                
                if not face_profile:
                    logger.warning(f"No face profile found for user ID: {user_id}")
                    return {
                        "recognized": False,
                        "message": "User profile not found",
                        "matches": matches
                    }, 200
                
                logger.info(f"Face recognized: {face_profile.full_name}")
                
                # Calculate confidence percentage
                confidence_percent = min(best_similarity * 100, 100.0)
                
                return {
                    "recognized": True,
                    "matches": matches,
                    "user": {
                        "id": face_profile.user_id,
                        "name": face_profile.full_name,
                        "department": face_profile.department or "Not specified",
                        "occupation": face_profile.occupation or "Not specified",
                        "confidence": round(confidence_percent, 1)
                    },
                    "message": f"Welcome, {face_profile.full_name}!"
                }, 200
            finally:
                db_session.close()
        else:
            # Return not recognized but with match details
            logger.info(f"Match too weak ({best_similarity:.2f}), rejecting recognition")
            return {
                "recognized": False,
                "message": "No confident match found",
                "matches": matches,
                "debug_info": {
                    "best_match_score": best_similarity,
                    "best_match_name": best_match.payload.get("name")
                }
            }, 200
        
    except Exception as e:
        logger.error(f"Error recognizing face: {str(e)}", exc_info=True)
        return {"message": f"Error recognizing face: {str(e)}"}, 500

def list_all_profiles():
    """Return a list of all face profiles for administration"""
    try:
        db_session = SessionLocal()
        profiles = db_session.query(FaceProfile).all()
        
        result = []
        for profile in profiles:
            result.append({
                "id": profile.user_id,
                "name": profile.full_name,
                "department": profile.department,
                "occupation": profile.occupation,
                "has_image": profile.profile_image_path is not None
            })
        
        return {"profiles": result}, 200
    except Exception as e:
        logger.error(f"Error listing profiles: {str(e)}")
        return {"message": f"Error retrieving profiles: {str(e)}"}, 500
    finally:
        db_session.close()