from flask import Flask, request, jsonify
from flask_cors import CORS
from database.db import create_database_tables, SessionLocal, User

app = Flask(__name__)
CORS(app) # Enable CORS for all routes

@app.route('/')
def index():
    return jsonify({"message": "FRS Backend API is running!"})

@app.route('/users', methods=['GET'])
def get_users():
    db_session = SessionLocal()
    try:
        return jsonify({"message": "User endpoint placeholder. Implement your query."})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        db_session.close()

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    db_session = SessionLocal()
    try:

        new_user = User(
            full_name=data.get('full_name'),
            email=data.get('email'),
            password_hash=data.get('password')
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
        if user and user.password_hash == password: # In a real app, compare hashed passwords
            return jsonify({"message": "Login successful", "user_id": user.user_id}), 200
        else:
            return jsonify({"message": "Invalid email or password"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        db_session.close()

if __name__ == '__main__':
    print("Initializing database and creating tables if they don't exist...")
    create_database_tables()  # Call the function from your db.py
    print("Starting Flask development server...")
    app.run(debug=True, port=5000) # Flask default port is 5000