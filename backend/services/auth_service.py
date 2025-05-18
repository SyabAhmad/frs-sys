from database.db import SessionLocal, User
from werkzeug.security import generate_password_hash, check_password_hash
import secrets

def signup_user(full_name, email, password):
    """Register a new user with email and password"""
    db_session = SessionLocal()
    try:
        # Check if user already exists
        existing_user = db_session.query(User).filter(User.email == email).first()
        if existing_user:
            return {"message": "Email already registered"}, 409

        # Generate password hash
        password_hash = generate_password_hash(password)
        
        new_user = User(
            full_name=full_name,
            email=email,
            password_hash=password_hash
        )
        db_session.add(new_user)
        db_session.commit()
        return {"message": "User created successfully", "user_id": new_user.user_id}, 201
    except Exception as e:
        db_session.rollback()
        return {"error": str(e)}, 500
    finally:
        db_session.close()

def login_user(email, password):
    """Authenticate a user with email and password"""
    db_session = SessionLocal()
    try:
        user = db_session.query(User).filter(User.email == email).first()
        
        # Use check_password_hash to verify the password
        if user and check_password_hash(user.password_hash, password):
            return {
                "message": "Login successful", 
                "user_id": user.user_id,
                "name": user.full_name
            }, 200
        else:
            return {"message": "Invalid email or password"}, 401
    except Exception as e:
        return {"error": str(e)}, 500
    finally:
        db_session.close()

def generate_random_password():
    """Generate a random secure password"""
    return secrets.token_urlsafe(12)