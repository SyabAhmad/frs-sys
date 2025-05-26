from flask import Blueprint, request, jsonify, current_app
import secrets
from database import get_db_connection, hash_password, check_password
from psycopg2.extras import RealDictCursor

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/signup', methods=['POST'])
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
             current_app.logger.error("User ID not returned after insert.")
             return jsonify({"error": "Failed to register user"}), 500
        user_id = user_id_data['id']
        conn.commit()
        
        return jsonify({"message": "User registered successfully!", "user_id": user_id}), 201
    except Exception as e:
        if conn:
            conn.rollback()
        current_app.logger.error(f"Database error during signup: {e}")
        return jsonify({"error": "Database error", "details": str(e)}), 500
    finally:
        if conn:
            if 'cur' in locals():  # Check if cur exists before trying to close it
                cur.close()
            conn.close()

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not all([email, password]):
        return jsonify({'error': 'Missing email or password'}), 400

    conn = None
    cur = None  # Initialize cur to prevent the UnboundLocalError
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
        current_app.logger.error(f"Login error: {e}")
        return jsonify({'error': 'Login failed'}), 500
    finally:
        if cur:  # Only try to close the cursor if it exists
            cur.close()
        if conn:
            conn.close()