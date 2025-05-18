from flask import Blueprint, request, jsonify, send_file
from services import user_service

bp = Blueprint('users', __name__)

@bp.route('/users', methods=['GET'])
def get_users():
    result, status_code = user_service.get_all_users()
    return jsonify(result), status_code

@bp.route('/user/<int:user_id>', methods=['GET'])
def get_user(user_id):
    result, status_code = user_service.get_user_by_id(user_id)
    return jsonify(result), status_code

@bp.route('/user/<int:user_id>/image', methods=['GET'])
def get_user_image(user_id):
    result, status_code = user_service.get_user_image(user_id)
    if status_code == 200:
        return send_file(result, mimetype='image/jpeg')
    else:
        return jsonify(result), status_code