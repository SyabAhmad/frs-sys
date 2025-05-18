from flask import Blueprint, request, jsonify
from services import auth_service

bp = Blueprint('auth', __name__, url_prefix='/auth')

@bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    result, status_code = auth_service.signup_user(
        data.get('full_name'),
        data.get('email'),
        data.get('password')
    )
    return jsonify(result), status_code

@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    result, status_code = auth_service.login_user(
        data.get('email'),
        data.get('password')
    )
    return jsonify(result), status_code