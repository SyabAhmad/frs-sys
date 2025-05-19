
import os
import psycopg2
from psycopg2.extras import RealDictCursor
# datetime is not used directly in this simplified version, can be removed if not needed elsewhere
# from datetime import datetime 
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file

# --- Database Connection ---

def get_database_url():
    """Get database connection parameters from environment variables"""
    DB_USER = os.getenv('DB_USER', 'postgres')
    DB_PASSWORD = os.getenv('DB_PASSWORD', 'yourpassword') # Ensure this is set in .env
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_PORT = os.getenv('DB_PORT', '5432') # Default PostgreSQL port
    DB_NAME = os.getenv('DB_NAME', 'frs_db_fyp')

    return {
        "user": DB_USER,
        "password": DB_PASSWORD,
        "host": DB_HOST,
        "port": DB_PORT,
        "dbname": DB_NAME
    }

def get_db_connection():
    """Create a new database connection"""
    params = get_database_url()
    conn = psycopg2.connect(**params)
    # conn.autocommit = False # You can manage transactions explicitly in your route handlers
    return conn

# --- Schema Creation ---
# Removed create_database_tables function as tables are already created.
# Removed get_db function as it's not strictly necessary for basic connection.

if __name__ == "__main__":
    # This block can be used to test the connection if needed
    try:
        conn = get_db_connection()
        print("Successfully connected to the database.")
        conn.close()
    except Exception as e:
        print(f"Failed to connect to the database: {e}")
        db_name_env = os.getenv('DB_NAME', 'frs_db')
        print(f"Please ensure your PostgreSQL server is running, the database '{db_name_env}' exists, and connection details are correct.")
