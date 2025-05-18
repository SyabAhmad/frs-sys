from flask import Blueprint, request, jsonify
from services import face_service
from utils.image_utils import process_image_from_request

bp = Blueprint('face', __name__)

@bp.route('/add-user', methods=['POST'])
def add_user():
    """Add a new user with face embedding"""
    try:
        # Process the image from request
        user_data, image_data = process_image_from_request(request)
        
        # Add face profile
        result, status_code = face_service.add_face_profile(user_data, image_data)
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"message": f"Error adding user: {str(e)}"}), 500

@bp.route('/recognize', methods=['POST'])
def recognize_face():
    """Recognize a face from an image"""
    try:
        # Process the image from request
        _, image_data = process_image_from_request(request)
        
        # Recognize face
        result, status_code = face_service.recognize_face(image_data)
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"message": f"Error recognizing face: {str(e)}"}), 500

@bp.route('/profiles', methods=['GET'])
def get_all_profiles():
    """Get all face profiles (admin function)"""
    result, status_code = face_service.list_all_profiles()
    return jsonify(result), status_code