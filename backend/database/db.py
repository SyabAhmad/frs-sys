import os
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime


# Create base class for declarative models
Base = declarative_base()

# --- SQLAlchemy Models ---

class User(Base):
    """User model for authentication purposes"""
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship: A user can have multiple sessions
    sessions = relationship("Session", back_populates="user")
    
    # Relationship: A user can have one face profile
    face_profile = relationship("FaceProfile", back_populates="user", uselist=False)

    def __repr__(self):
        return f"<User(user_id={self.user_id}, email='{self.email}', full_name='{self.full_name}')>"


class FaceProfile(Base):
    """Separate model for storing face recognition data"""
    __tablename__ = "face_profiles"

    profile_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), unique=True, nullable=False)
    full_name = Column(String(100), nullable=False)  # Duplicated for quick access
    profile_image_path = Column(String(255), nullable=True)
    face_embedding_id = Column(String(100), nullable=True)  # Reference to Qdrant embedding
    address = Column(String(200), nullable=True)
    department = Column(String(100), nullable=True)
    occupation = Column(String(100), nullable=True)
    gender = Column(String(10), nullable=True)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship: A face profile belongs to one user
    user = relationship("User", back_populates="face_profile")

    def __repr__(self):
        return f"<FaceProfile(profile_id={self.profile_id}, user_id={self.user_id}, full_name='{self.full_name}')>"


class Session(Base):
    __tablename__ = "sessions"

    session_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    is_authenticated = Column(Boolean, default=False)
    # Examples: "password", "face_recognition", "oauth_google"
    authentication_method = Column(String(50), nullable=True) 

    # Relationship: A session belongs to one user
    user = relationship("User", back_populates="sessions")

    def __repr__(self):
        return f"<Session(session_id={self.session_id}, user_id={self.user_id}, authenticated={self.is_authenticated})>"


# --- Utility Functions ---

def get_db():
    """
    Dependency to get a database session.
    Ensures the session is closed after the request.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_database_url():
    # Environment variables
    DB_USER = os.getenv('DB_USER', 'postgres')
    DB_PASSWORD = os.getenv('DB_PASSWORD', 'yourpassword')
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_PORT = os.getenv('DB_PORT', '5432')
    DB_NAME = os.getenv('DB_NAME', 'frs_db')
    
    # For development, you can use SQLite
    # return "sqlite:///./frs.db"
    
    # For PostgreSQL
    return f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

def create_database_tables():
    """
    Creates all tables in the database defined by Base's metadata.
    Call this once when your application starts if the tables don't exist.
    """
    # Environment variables
    DB_USER = os.getenv('DB_USER', 'postgres')
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_PORT = os.getenv('DB_PORT', '5432')
    DB_NAME = os.getenv('DB_NAME', 'frs_db')
    
    try:
        # Create user_images directory if it doesn't exist
        os.makedirs('user_images', exist_ok=True)
        
        # Create all tables in the database
        Base.metadata.create_all(bind=engine)
        print("Database tables checked/created (if they didn't exist).")
    except Exception as e:
        print(f"Error creating database tables: {e}")
        print(f"Please ensure your PostgreSQL server is running and the database '{DB_NAME}' exists.")
        print(f"Connection URL used: postgresql://{DB_USER}:<password>@{DB_HOST}:{DB_PORT}/{DB_NAME}")


# Create engine
engine = create_engine(get_database_url())

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

if __name__ == "__main__":
    DB_NAME = os.getenv('DB_NAME', 'frs_db')
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_PORT = os.getenv('DB_PORT', '5432')
    print(f"Attempting to connect to PostgreSQL database: {DB_NAME} on {DB_HOST}:{DB_PORT}")
    create_database_tables()
