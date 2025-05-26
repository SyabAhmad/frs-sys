import psycopg2
from psycopg2.extras import RealDictCursor
from config import get_database_url
import bcrypt

def get_db_connection():
    """Create a new database connection"""
    params = get_database_url()
    conn = psycopg2.connect(**params)
    return conn

def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

def check_password(password, hashed_password):
    if isinstance(hashed_password, str):
        hashed_password = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password)